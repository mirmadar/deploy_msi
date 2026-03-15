import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { paginateQuery, PaginatedResult } from 'src/shared/common/utils/pagination.util';
import { Prisma, ProductStatus } from '@prisma/client';
import { SlugUtil } from 'src/shared/common/utils/slug.util';
import { BulkIndexService } from 'src/admin/search/bulk-index.service';

export interface CategoryNode {
  categoryId: number;
  name: string;
  parentId: number | null;
  children: CategoryNode[];
  pathItems: { id: number; name: string }[];
}

export interface CategoryNodeWithCount extends CategoryNode {
  branchProductCount: number;
}

@Injectable()
export class CategoriesService {
  constructor(
    private prisma: PrismaService,
    private bulkIndexService: BulkIndexService,
  ) {}

  async createCategory(dto: CreateCategoryDto) {
    let level = 0;

    if (dto.parentId) {
      const parent = await this.prisma.category.findUnique({
        where: { categoryId: dto.parentId },
        select: { level: true },
      });

      if (!parent) {
        throw new HttpException('Родительская категория не найдена', HttpStatus.NOT_FOUND);
      }

      level = parent.level + 1;
    }

    // Генерируем slug автоматически из названия
    const baseSlug = SlugUtil.generateSlug(dto.name);
    const slug = await SlugUtil.generateUniqueCategorySlug(this.prisma, baseSlug);

    const parentIdValue = dto.parentId ?? null;
    const max = await this.prisma.category.aggregate({
      where: { parentId: parentIdValue },
      _max: { sortOrder: true },
    });
    const sortOrder = (max._max.sortOrder ?? -1) + 1;

    const category = await this.prisma.category.create({
      data: {
        name: dto.name,
        slug,
        parentId: parentIdValue,
        imageUrl: dto.imageUrl ?? null,
        level,
        sortOrder,
      },
    });

    return category;
  }
  async getAllCategories(page = 1, limit = 25, parentId?: number | null) {
    const where: Prisma.CategoryWhereInput = parentId !== undefined ? { parentId: parentId === null ? null : parentId } : {};

    const select = {
      categoryId: true,
      name: true,
      parentId: true,
      level: true,
      sortOrder: true,
      imageUrl: true,
      _count: {
        select: {
          children: true,
          products: true,
        },
      },
    } as const;

    type CategorySelect = typeof select;
    type CategoryWithCount = Prisma.CategoryGetPayload<{
      select: CategorySelect;
    }>;

    const result = await paginateQuery({
      findMany: (args) => this.prisma.category.findMany(args as Prisma.CategoryFindManyArgs),
      count: (args) => this.prisma.category.count(args as Prisma.CategoryCountArgs | undefined),
      where,
      orderBy: [{ level: 'asc' as const }, { sortOrder: 'asc' as const }, { name: 'asc' as const }] as Prisma.CategoryOrderByWithRelationInput[],
      select,
      pagination: { page, pageSize: limit },
    }) as unknown as PaginatedResult<CategoryWithCount>;

    // Собираем id категорий на текущей странице
    const categoryIds = result.data.map((item) => item.categoryId);

    // Находим категории, у которых есть НЕ архивные товары
    const categoriesWithActiveProducts = await this.prisma.category.findMany({
      where: {
        categoryId: { in: categoryIds },
        products: {
          some: {
            status: {
              not: ProductStatus.ARCHIVE,
            },
          },
        },
      },
      select: { categoryId: true },
    });

    const activeProductsSet = new Set(
      categoriesWithActiveProducts.map((c) => c.categoryId),
    );

    return {
      ...result,
      data: result.data.map((item) => {
        const { _count, ...cat } = item;
        return {
          ...cat,
          hasChildren: _count.children > 0,
          // hasProducts теперь означает "есть неархивные товары"
          hasProducts: activeProductsSet.has(cat.categoryId),
        };
      }),
      limit: result.pageSize,
    };
  }

  async getCategoryById(categoryId: number) {
    const category = await this.prisma.category.findUnique({
      where: { categoryId },
    });

    if (!category) {
      throw new HttpException('Категория не найдена', HttpStatus.NOT_FOUND);
    }

    const path = await this.findPath(categoryId);

    return {
      ...category,
      path,
    };
  }

  async updateCategory(categoryId: number, dto: UpdateCategoryDto) {
    const category = await this.getCategoryOrFail(categoryId);

    const updateData: {
      name?: string;
      parentId?: number | null;
      imageUrl?: string | null;
      level?: number;
      slug?: string;
    } = {};

    if (dto.name !== undefined) {
      updateData.name = dto.name;

      // Генерируем slug, если изменилось имя
      const baseSlug = SlugUtil.generateSlug(dto.name);
      updateData.slug = await SlugUtil.generateUniqueCategorySlug(this.prisma, baseSlug, categoryId);
    }

    if (dto.imageUrl !== undefined) {
      updateData.imageUrl = dto.imageUrl;
    }

    if (dto.parentId !== undefined) {
      if (dto.parentId === null) {
        updateData.parentId = null;
        updateData.level = 0;
      } else {
        const parent = await this.prisma.category.findUnique({
          where: { categoryId: dto.parentId },
          select: { level: true },
        });

        if (!parent) {
          throw new HttpException('Родительская категория не найдена', HttpStatus.NOT_FOUND);
        }

        updateData.parentId = dto.parentId;
        updateData.level = parent.level + 1;
      }
    }

    const updatedCategory = await this.prisma.category.update({
      where: { categoryId },
      data: updateData,
    });

    return updatedCategory;
  }


  async deleteCategory(categoryId: number) {
    await this.getCategoryOrFail(categoryId);

    // Проверяем, есть ли неархивные товары в категории
    const activeProductsCount = await this.prisma.product.count({
      where: {
        categoryId,
        status: {
          not: ProductStatus.ARCHIVE,
        },
      },
    });

    if (activeProductsCount > 0) {
      throw new HttpException(
        'Нельзя удалить категорию, так как в ней есть товары, которые не помечены как архивные. Сначала переместите или архивируйте эти товары.',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Обнуляем categoryId у архивных товаров, чтобы они не блокировали удаление
    const archivedProducts = await this.prisma.product.findMany({
      where: {
        categoryId,
        status: ProductStatus.ARCHIVE,
      },
      select: { productId: true },
    });

    if (archivedProducts.length > 0) {
      await this.prisma.product.updateMany({
        where: {
          categoryId,
          status: ProductStatus.ARCHIVE,
        },
        data: {
          categoryId: null,
        },
      });

      // Переиндексируем архивные товары, чтобы обновилась категория в Elasticsearch
      const archivedIds = archivedProducts.map((p) => p.productId);
      try {
        await this.bulkIndexService.indexProducts(archivedIds);
      } catch (error) {
        // Логирование ошибки индексации, но не ломаем удаление категории
        console.error(
          `Ошибка индексации архивных товаров после удаления категории ${categoryId}:`,
          error,
        );
      }
    }

    await this.prisma.category.delete({
      where: { categoryId },
    });

    return { message: 'Категория удалена' };
  }

  async moveCategory(categoryId: number, direction: 'up' | 'down') {
    const current = await this.prisma.category.findUnique({
      where: { categoryId },
      select: { categoryId: true, parentId: true },
    });
    if (!current) {
      throw new HttpException('Категория не найдена', HttpStatus.NOT_FOUND);
    }

    const siblings = await this.prisma.category.findMany({
      where: { parentId: current.parentId },
      select: { categoryId: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }, { categoryId: 'asc' }],
    });

    const idx = siblings.findIndex((s) => s.categoryId === categoryId);
    if (idx === -1) return this.getCategoryById(categoryId);

    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= siblings.length) {
      throw new HttpException(
        direction === 'up' ? 'Уже в начале списка' : 'Уже в конце списка',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.prisma.$transaction(async (tx) => {
      for (let i = 0; i < siblings.length; i++) {
        await tx.category.update({
          where: { categoryId: siblings[i].categoryId },
          data: { sortOrder: i },
        });
      }
      await tx.category.update({ where: { categoryId }, data: { sortOrder: swapIdx } });
      await tx.category.update({ where: { categoryId: siblings[swapIdx].categoryId }, data: { sortOrder: idx } });
    });

    return this.getCategoryById(categoryId);
  }

  async findPath(categoryId: number) {
    const path: Array<{ id: number; name: string; imageUrl?: string }> = [];
    let current = await this.prisma.category.findUnique({
      where: { categoryId },
    });

    if (!current) {
      throw new HttpException('Категория не найдена', HttpStatus.NOT_FOUND);
    }

    while (current) {
      path.unshift({
        id: current.categoryId,
        name: current.name,
        imageUrl: current.imageUrl ?? undefined,
      });

      if (!current.parentId) break;

      current = await this.prisma.category.findUnique({
        where: { categoryId: current.parentId },
      });
    }

    return path;
  }

  async getCategoryTree(): Promise<CategoryNode[]> {
    // 1. Получаем все категории плоским списком
    const categories = await this.prisma.category.findMany({
      select: {
        categoryId: true,
        name: true,
        parentId: true,
      },
      orderBy: [{ level: 'asc' }, { sortOrder: 'asc' }, { name: 'asc' }],
    });

    // 2. Map для быстрого доступа к узлам
    const map = new Map<number, CategoryNode>();

    categories.forEach((cat) => {
      map.set(cat.categoryId, {
        categoryId: cat.categoryId,
        name: cat.name,
        parentId: cat.parentId,
        children: [],
        pathItems: [],
      });
    });

    // 3. Строим дерево
    const roots: CategoryNode[] = [];

    categories.forEach((cat) => {
      const node = map.get(cat.categoryId)!;

      if (cat.parentId) {
        const parent = map.get(cat.parentId)!;
        // pathItems = путь родителя + родитель
        node.pathItems = [...parent.pathItems, { id: parent.categoryId, name: parent.name }];
        parent.children.push(node);
      } else {
        // корневой узел
        node.pathItems = [];
        roots.push(node);
      }
    });

    return roots;
  }

  /** Возвращает id категории и всех её потомков. Загружает категории один раз и строит список в памяти. */
  async getDescendantCategoryIds(categoryId: number): Promise<number[]> {
    const all = await this.prisma.category.findMany({
      select: { categoryId: true, parentId: true },
    });
    return this.collectDescendantIds(all, categoryId);
  }

  /** Собирает id узла и всех потомков по уже загруженному списку категорий. */
  private collectDescendantIds(
    all: { categoryId: number; parentId: number | null }[],
    categoryId: number,
  ): number[] {
    const byParent = new Map<number | null, { categoryId: number }[]>();
    all.forEach((c) => {
      const list = byParent.get(c.parentId) ?? [];
      list.push({ categoryId: c.categoryId });
      byParent.set(c.parentId, list);
    });
    const result: number[] = [];
    const stack = [categoryId];
    while (stack.length) {
      const id = stack.pop()!;
      result.push(id);
      const children = byParent.get(id) ?? [];
      children.forEach((ch) => stack.push(ch.categoryId));
    }
    return result;
  }

  /** Для набора id категорий возвращает объединение (каждая категория + все потомки). Один запрос к БД. */
  async getCategoryIdsInBranch(categoryIds: number[]): Promise<number[]> {
    if (!categoryIds?.length) return [];
    const all = await this.prisma.category.findMany({
      select: { categoryId: true, parentId: true },
    });
    const seen = new Set<number>();
    for (const id of categoryIds) {
      this.collectDescendantIds(all, id).forEach((i) => seen.add(i));
    }
    return Array.from(seen);
  }

  /** Дерево категорий с количеством товаров в ветке (сама категория + потомки) для фильтра товаров. */
  async getCategoryTreeForFilters(): Promise<CategoryNodeWithCount[]> {
    const tree = await this.getCategoryTree();
    const counts = await this.prisma.product.groupBy({
      by: ['categoryId'],
      _count: { productId: true },
      where: { categoryId: { not: null } },
    });
    const countByCategoryId = new Map<number, number>();
    counts.forEach((r) => {
      if (r.categoryId != null) countByCategoryId.set(r.categoryId, r._count.productId);
    });

    function addBranchCount(node: CategoryNode): number {
      const direct = countByCategoryId.get(node.categoryId) ?? 0;
      let childrenTotal = 0;
      node.children.forEach((ch) => {
        childrenTotal += addBranchCount(ch);
      });
      const branch = direct + childrenTotal;
      (node as CategoryNodeWithCount).branchProductCount = branch;
      return branch;
    }

    tree.forEach((root) => addBranchCount(root));
    return tree as CategoryNodeWithCount[];
  }

  async getCategoryOrFail(categoryId: number) {
    const category = await this.prisma.category.findUnique({
      where: { categoryId },
      select: { categoryId: true },
    });

    if (!category) {
      throw new HttpException('Категория не найдена', HttpStatus.NOT_FOUND);
    }

    return category;
  }

  // Проверяет, что категория не является потомком другой категории (для предотвращения циклических зависимостей)
  private async isDescendant(ancestorId: number, descendantId: number): Promise<boolean> {
    let currentId: number | null = descendantId;
    const visited = new Set<number>();

    while (currentId !== null && !visited.has(currentId)) {
      if (currentId === ancestorId) {
        return true;
      }
      visited.add(currentId);

      const category = await this.prisma.category.findUnique({
        where: { categoryId: currentId },
        select: { parentId: true },
      });

      currentId = category?.parentId ?? null;
    }

    return false;
  }

  // Рекурсивно пересчитывает level для категории и всех её потомков
  private async recalculateLevels(categoryId: number, newLevel: number): Promise<void> {
    await this.prisma.category.update({
      where: { categoryId },
      data: { level: newLevel },
    });

    const children = await this.prisma.category.findMany({
      where: { parentId: categoryId },
      select: { categoryId: true },
    });

    for (const child of children) {
      await this.recalculateLevels(child.categoryId, newLevel + 1);
    }
  }

  // Назначение нового родителя
  async bulkMoveCategories(categoryIds: number[], newParentId: number | null) {
    if (categoryIds.length === 0) {
      throw new HttpException('Необходимо выбрать хотя бы одну категорию', HttpStatus.BAD_REQUEST);
    }

    // Проверяем существование всех категорий
    const existingCategories = await this.prisma.category.findMany({
      where: {
        categoryId: { in: categoryIds },
      },
      select: {
        categoryId: true,
        parentId: true,
      },
    });

    const existingIds = new Set(existingCategories.map((c) => c.categoryId));
    const notFoundIds = categoryIds.filter((id) => !existingIds.has(id));

    if (notFoundIds.length > 0) {
      throw new HttpException(
        `Категории с ID ${notFoundIds.join(', ')} не найдены`,
        HttpStatus.NOT_FOUND,
      );
    }

    // Проверяем существование нового родителя (если указан)
    let newParentLevel = -1;
    if (newParentId !== null) {
      const newParent = await this.prisma.category.findUnique({
        where: { categoryId: newParentId },
        select: { categoryId: true, level: true },
      });

      if (!newParent) {
        throw new HttpException('Родительская категория не найдена', HttpStatus.NOT_FOUND);
      }

      newParentLevel = newParent.level;

      // Проверяем, что новый родитель не является одной из перемещаемых категорий
      if (categoryIds.includes(newParentId)) {
        throw new HttpException(
          'Категория не может быть родителем самой себя',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Проверяем, что новый родитель не является потомком одной из перемещаемых категорий
      for (const categoryId of categoryIds) {
        const isDesc = await this.isDescendant(categoryId, newParentId);
        if (isDesc) {
          throw new HttpException(
            `Категория не может быть перемещена в своего потомка`,
            HttpStatus.BAD_REQUEST,
          );
        }
      }
    }

    // Выполняем массовое перемещение в транзакции
    const result = await this.prisma.$transaction(async (tx) => {
      const targetLevel = newParentId === null ? 0 : newParentLevel + 1;

      // Обновляем parentId и level для всех перемещаемых категорий
      await tx.category.updateMany({
        where: {
          categoryId: { in: categoryIds },
        },
        data: {
          parentId: newParentId,
          level: targetLevel,
        },
      });

      // Пересчитываем level для всех потомков перемещаемых категорий
      for (const categoryId of categoryIds) {
        const children = await tx.category.findMany({
          where: { parentId: categoryId },
          select: { categoryId: true },
        });

        for (const child of children) {
          await this.recalculateLevelsForCategory(tx, child.categoryId, targetLevel + 1);
        }
      }

      return { count: categoryIds.length };
    });

    return {
      message: `Перемещено категорий: ${result.count}`,
      movedCount: result.count,
      categoryIds,
      newParentId,
    };
  }

  // Вспомогательный метод для пересчета уровней в транзакции
  private async recalculateLevelsForCategory(
    tx: any,
    categoryId: number,
    newLevel: number,
  ): Promise<void> {
    await tx.category.update({
      where: { categoryId },
      data: { level: newLevel },
    });

    const children = await tx.category.findMany({
      where: { parentId: categoryId },
      select: { categoryId: true },
    });

    for (const child of children) {
      await this.recalculateLevelsForCategory(tx, child.categoryId, newLevel + 1);
    }
  }

  async bulkUpdateImageUrl(categoryIds: number[], imageUrl: string | null) {
    if (categoryIds.length === 0) {
      throw new HttpException('Необходимо выбрать хотя бы одну категорию', HttpStatus.BAD_REQUEST);
    }

    const existingCategories = await this.prisma.category.findMany({
      where: {
        categoryId: { in: categoryIds },
      },
      select: { categoryId: true },
    });

    const existingIds = new Set(existingCategories.map((c) => c.categoryId));
    const notFoundIds = categoryIds.filter((id) => !existingIds.has(id));

    if (notFoundIds.length > 0) {
      throw new HttpException(
        `Категории с ID ${notFoundIds.join(', ')} не найдены`,
        HttpStatus.NOT_FOUND,
      );
    }

    const result = await this.prisma.category.updateMany({
      where: {
        categoryId: { in: categoryIds },
      },
      data: {
        imageUrl: imageUrl ?? null,
      },
    });

    return {
      message: `Обновлено категорий: ${result.count}`,
      updatedCount: result.count,
      categoryIds,
    };
  }
}
