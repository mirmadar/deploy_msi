import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ProductStatus } from '@prisma/client';
import { PrismaService } from 'src/shared/prisma/prisma.service';

export interface PublicCategoryPathItem {
  id: number;
  name: string;
  slug: string | null;
}

export interface PublicCategoryWithPath {
  categoryId: number;
  name: string;
  slug: string | null;
  imageUrl: string | null;
  path: PublicCategoryPathItem[];
}

@Injectable()
export class PublicCategoriesService {
  private categoriesCache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 минут кэш для категорий

  constructor(private prisma: PrismaService) {}

  async getCategoriesByParent(parentId: number | null = null) {
    const cacheKey = `categories_${parentId ?? 'null'}`;
    const now = Date.now();

    const cached = this.categoriesCache.get(cacheKey);
    if (cached && now - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }

    const categories = await this.prisma.category.findMany({
      where: { parentId },
      select: {
        categoryId: true,
        name: true,
        slug: true,
        imageUrl: true,
      },
      orderBy: [
        { sortOrder: 'asc' },
        { name: 'asc' },
      ],
    });

    if (categories.length === 0) {
      const result: any[] = [];
      this.categoriesCache.set(cacheKey, {
        data: result,
        timestamp: now,
      });
      return result;
    }

    const categoryIds = categories.map((c) => c.categoryId);

    const categoriesWithChildren = await this.prisma.category.findMany({
      where: {
        parentId: { in: categoryIds },
      },
      select: { parentId: true },
      distinct: ['parentId'],
      take: categoryIds.length,
    });

    const hasChildrenSet = new Set(
      categoriesWithChildren.map((c) => c.parentId),
    );

    const result = categories.map((cat) => ({
      ...cat,
      hasChildren: hasChildrenSet.has(cat.categoryId),
      hasProducts: true,
    }));

    this.categoriesCache.set(cacheKey, {
      data: result,
      timestamp: now,
    });

    return result;
  }

  async getCategoryBySlug(slug: string): Promise<PublicCategoryWithPath> {
    const category = await this.prisma.category.findFirst({
      where: { slug },
      select: {
        categoryId: true,
        name: true,
        slug: true,
        imageUrl: true,
        parentId: true,
      },
    });

    if (!category) {
      throw new HttpException('Категория не найдена', HttpStatus.NOT_FOUND);
    }

    const path = await this.buildCategoryPath(category.parentId);

    return {
      categoryId: category.categoryId,
      name: category.name,
      slug: category.slug,
      imageUrl: category.imageUrl,
      path,
    };
  }

  async getCategoryFilters(slug: string) {
    const category = await this.prisma.category.findFirst({
      where: { slug },
      select: { categoryId: true, name: true },
    });

    if (!category) {
      throw new HttpException('Категория не найдена', HttpStatus.NOT_FOUND);
    }

    const filters = await this.prisma.categoryFilter.findMany({
      where: { categoryId: category.categoryId },
      include: {
        characteristicName: {
          select: {
            characteristicNameId: true,
            name: true,
            valueType: true,
          },
        },
      },
      orderBy: { displayOrder: 'asc' },
    });

    // Оставляем только фильтры, у которых есть хотя бы два разных значения у неархивных товаров
    const groupedByCharAndValue = await this.prisma.productCharacteristic.groupBy({
      by: ['characteristicNameId', 'value'],
      where: {
        product: {
          categoryId: category.categoryId,
          status: { not: ProductStatus.ARCHIVE },
        },
      },
    });
    const distinctValueCountByCharId = new Map<number, number>();
    for (const row of groupedByCharAndValue) {
      const count = distinctValueCountByCharId.get(row.characteristicNameId) ?? 0;
      distinctValueCountByCharId.set(row.characteristicNameId, count + 1);
    }
    const idsWithAtLeastTwoValues = new Set(
      [...distinctValueCountByCharId.entries()]
        .filter(([, count]) => count >= 2)
        .map(([id]) => id),
    );
    const filtersWithValues = filters.filter((f) =>
      idsWithAtLeastTwoValues.has(f.characteristicName.characteristicNameId),
    );

    return filtersWithValues.map((filter) => ({
      characteristicNameId: filter.characteristicName.characteristicNameId,
      name: filter.characteristicName.name,
      valueType: filter.characteristicName.valueType,
      displayOrder: filter.displayOrder,
    }));
  }

  // Получить значения конкретного фильтра категории
  // Загружается отдельно только когда фильтр раскрывается пользователем
  async getFilterValues(slug: string, characteristicNameId: number) {
    const category = await this.prisma.category.findFirst({
      where: { slug },
      select: { categoryId: true },
    });

    if (!category) {
      throw new HttpException('Категория не найдена', HttpStatus.NOT_FOUND);
    }

    const filter = await this.prisma.categoryFilter.findFirst({
      where: {
        categoryId: category.categoryId,
        characteristicNameId,
      },
    });

    if (!filter) {
      throw new HttpException('Фильтр не найден', HttpStatus.NOT_FOUND);
    }

    const characteristicsData = await this.prisma.productCharacteristic.groupBy({
      by: ['value'],
      where: {
        characteristicNameId,
        product: {
          categoryId: category.categoryId,
          status: { not: ProductStatus.ARCHIVE },
        },
      },
      orderBy: {
        value: 'asc',
      },
    });

    return {
      characteristicNameId,
      values: characteristicsData.map((char) => char.value),
    };
  }

  /**
   * Строит путь от корневой категории до родителя указанной категории.
   * Возвращает массив без самой текущей категории.
   */
  private async buildCategoryPath(parentId: number | null): Promise<PublicCategoryPathItem[]> {
    const path: PublicCategoryPathItem[] = [];

    let currentParentId: number | null = parentId;

    while (currentParentId !== null) {
      const parent = await this.prisma.category.findUnique({
        where: { categoryId: currentParentId },
        select: {
          categoryId: true,
          name: true,
          slug: true,
          parentId: true,
        },
      });

      if (!parent) break;

      path.unshift({
        id: parent.categoryId,
        name: parent.name,
        slug: parent.slug,
      });

      currentParentId = parent.parentId;
    }

    return path;
  }
}
