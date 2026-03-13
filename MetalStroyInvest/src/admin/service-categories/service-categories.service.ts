import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { CreateServiceCategoryDto } from './dto/create-service-category.dto';
import { UpdateServiceCategoryDto } from './dto/update-service-category.dto';
import { paginateQuery, PaginatedResult } from 'src/shared/common/utils/pagination.util';
import { Prisma } from '@prisma/client';
import { SlugUtil } from 'src/shared/common/utils/slug.util';

export interface ServiceCategoryNode {
  serviceCategoryId: number;
  name: string;
  parentId: number | null;
  children: ServiceCategoryNode[];
  pathItems: { id: number; name: string }[];
}

@Injectable()
export class ServiceCategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateServiceCategoryDto) {
    let level = 0;

    if (dto.parentId) {
      const parent = await this.prisma.serviceCategory.findUnique({
        where: { serviceCategoryId: dto.parentId },
        select: { level: true },
      });

      if (!parent) {
        throw new HttpException('Родительская категория не найдена', HttpStatus.NOT_FOUND);
      }

      level = parent.level + 1;
    }

    const baseSlug = SlugUtil.generateSlug(dto.name);
    const slug = await SlugUtil.generateUniqueServiceCategorySlug(this.prisma, baseSlug);

    const where: Prisma.ServiceCategoryWhereInput =
      dto.parentId != null ? { parentId: dto.parentId } : { parentId: null };
    const max = await this.prisma.serviceCategory.aggregate({
      where,
      _max: { sortOrder: true },
    });
    const sortOrder = (max._max.sortOrder ?? -1) + 1;

    return this.prisma.serviceCategory.create({
      data: {
        name: dto.name,
        slug,
        parentId: dto.parentId ?? null,
        description: dto.description ?? null,
        sortOrder,
        level,
      },
    });
  }

  async getAll(page = 1, limit = 25, parentId?: number | null) {
    const where: Prisma.ServiceCategoryWhereInput =
      parentId !== undefined ? { parentId: parentId === null ? null : parentId } : {};

    const select = {
      serviceCategoryId: true,
      name: true,
      slug: true,
      description: true,
      sortOrder: true,
      parentId: true,
      level: true,
      _count: {
        select: { children: true },
      },
    } as const;

    type SelectType = typeof select;
    type WithCount = Prisma.ServiceCategoryGetPayload<{ select: SelectType }>;

    const result = await paginateQuery({
      findMany: (args) =>
        this.prisma.serviceCategory.findMany(args as Prisma.ServiceCategoryFindManyArgs),
      count: (args) =>
        this.prisma.serviceCategory.count(args as Prisma.ServiceCategoryCountArgs | undefined),
      where,
      orderBy: [
        { level: 'asc' as const },
        { sortOrder: 'asc' as const },
        { name: 'asc' as const },
      ] as Prisma.ServiceCategoryOrderByWithRelationInput[],
      select,
      pagination: { page, pageSize: limit },
    }) as unknown as PaginatedResult<WithCount>;

    return {
      ...result,
      data: result.data.map((item) => {
        const { _count, ...cat } = item;
        return { ...cat, hasChildren: _count.children > 0 };
      }),
      limit: result.pageSize,
    };
  }

  async getById(serviceCategoryId: number) {
    const category = await this.prisma.serviceCategory.findUnique({
      where: { serviceCategoryId },
      select: {
        serviceCategoryId: true,
        name: true,
        slug: true,
        description: true,
        sortOrder: true,
        level: true,
        parentId: true,
      },
    });

    if (!category) {
      throw new HttpException('Категория услуг не найдена', HttpStatus.NOT_FOUND);
    }

    const path = await this.findPath(serviceCategoryId);

    return { ...category, path };
  }

  async getTree(): Promise<ServiceCategoryNode[]> {
    const categories = await this.prisma.serviceCategory.findMany({
      select: {
        serviceCategoryId: true,
        name: true,
        parentId: true,
      },
      orderBy: [{ level: 'asc' }, { sortOrder: 'asc' }, { name: 'asc' }],
    });

    const map = new Map<number, ServiceCategoryNode>();

    categories.forEach((cat) => {
      map.set(cat.serviceCategoryId, {
        serviceCategoryId: cat.serviceCategoryId,
        name: cat.name,
        parentId: cat.parentId,
        children: [],
        pathItems: [],
      });
    });

    const roots: ServiceCategoryNode[] = [];

    categories.forEach((cat) => {
      const node = map.get(cat.serviceCategoryId)!;

      if (cat.parentId) {
        const parent = map.get(cat.parentId)!;
        node.pathItems = [...parent.pathItems, { id: parent.serviceCategoryId, name: parent.name }];
        parent.children.push(node);
      } else {
        node.pathItems = [];
        roots.push(node);
      }
    });

    return roots;
  }

  async update(serviceCategoryId: number, dto: UpdateServiceCategoryDto) {
    const existing = await this.prisma.serviceCategory.findUnique({
      where: { serviceCategoryId },
      select: { serviceCategoryId: true },
    });
    if (!existing) {
      throw new HttpException('Категория услуг не найдена', HttpStatus.NOT_FOUND);
    }

    const updateData: {
      name?: string;
      slug?: string;
      parentId?: number | null;
      description?: string | null;
      level?: number;
    } = {};

    if (dto.name !== undefined) {
      updateData.name = dto.name;
      const baseSlug = SlugUtil.generateSlug(dto.name);
      updateData.slug = await SlugUtil.generateUniqueServiceCategorySlug(
        this.prisma,
        baseSlug,
        serviceCategoryId,
      );
    }

    if (dto.description !== undefined) updateData.description = dto.description;

    if (dto.parentId !== undefined) {
      if (dto.parentId === null) {
        updateData.parentId = null;
        updateData.level = 0;
      } else {
        const parent = await this.prisma.serviceCategory.findUnique({
          where: { serviceCategoryId: dto.parentId },
          select: { level: true },
        });

        if (!parent) {
          throw new HttpException('Родительская категория не найдена', HttpStatus.NOT_FOUND);
        }

        updateData.parentId = dto.parentId;
        updateData.level = parent.level + 1;
      }
    }

    return this.prisma.serviceCategory.update({
      where: { serviceCategoryId },
      data: updateData,
    });
  }

  async delete(serviceCategoryId: number) {
    const category = await this.prisma.serviceCategory.findUnique({
      where: { serviceCategoryId },
      select: {
        serviceCategoryId: true,
        _count: { select: { children: true, services: true } },
      },
    });

    if (!category) {
      throw new HttpException('Категория услуг не найдена', HttpStatus.NOT_FOUND);
    }

    if (category._count.children > 0) {
      throw new HttpException(
        'Нельзя удалить категорию, у которой есть подкатегории',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (category._count.services > 0) {
      throw new HttpException(
        'Нельзя удалить категорию, в которой есть услуги',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.prisma.serviceCategory.delete({
      where: { serviceCategoryId },
    });

    return { message: 'Категория услуг удалена' };
  }

  async move(serviceCategoryId: number, direction: 'up' | 'down') {
    const current = await this.prisma.serviceCategory.findUnique({
      where: { serviceCategoryId },
      select: { serviceCategoryId: true, parentId: true },
    });
    if (!current) {
      throw new HttpException('Категория услуг не найдена', HttpStatus.NOT_FOUND);
    }

    const siblings = await this.prisma.serviceCategory.findMany({
      where: { parentId: current.parentId },
      select: { serviceCategoryId: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }, { serviceCategoryId: 'asc' }],
    });

    const idx = siblings.findIndex((s) => s.serviceCategoryId === serviceCategoryId);
    if (idx === -1) return this.getById(serviceCategoryId);

    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= siblings.length) {
      throw new HttpException(
        direction === 'up' ? 'Уже в начале списка' : 'Уже в конце списка',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.prisma.$transaction(async (tx) => {
      for (let i = 0; i < siblings.length; i++) {
        await tx.serviceCategory.update({
          where: { serviceCategoryId: siblings[i].serviceCategoryId },
          data: { sortOrder: i },
        });
      }
      await tx.serviceCategory.update({ where: { serviceCategoryId }, data: { sortOrder: swapIdx } });
      await tx.serviceCategory.update({ where: { serviceCategoryId: siblings[swapIdx].serviceCategoryId }, data: { sortOrder: idx } });
    });

    return this.getById(serviceCategoryId);
  }

  private async findPath(serviceCategoryId: number): Promise<Array<{ id: number; name: string }>> {
    const path: Array<{ id: number; name: string }> = [];
    const selectPath = { serviceCategoryId: true, name: true, parentId: true } as const;

    let current = await this.prisma.serviceCategory.findUnique({
      where: { serviceCategoryId },
      select: selectPath,
    });

    if (!current) {
      throw new HttpException('Категория услуг не найдена', HttpStatus.NOT_FOUND);
    }

    while (current) {
      path.unshift({ id: current.serviceCategoryId, name: current.name });
      if (!current.parentId) break;
      current = await this.prisma.serviceCategory.findUnique({
        where: { serviceCategoryId: current.parentId },
        select: selectPath,
      });
    }

    return path;
  }

  private async isDescendant(
    ancestorId: number,
    descendantId: number,
  ): Promise<boolean> {
    let currentId: number | null = descendantId;
    const visited = new Set<number>();

    while (currentId !== null && !visited.has(currentId)) {
      if (currentId === ancestorId) return true;
      visited.add(currentId);
      const cat = await this.prisma.serviceCategory.findUnique({
        where: { serviceCategoryId: currentId },
        select: { parentId: true },
      });
      currentId = cat?.parentId ?? null;
    }
    return false;
  }

  private async recalculateLevelsForServiceCategory(
    tx: Prisma.TransactionClient,
    serviceCategoryId: number,
    newLevel: number,
  ): Promise<void> {
    await tx.serviceCategory.update({
      where: { serviceCategoryId },
      data: { level: newLevel },
    });
    const children = await tx.serviceCategory.findMany({
      where: { parentId: serviceCategoryId },
      select: { serviceCategoryId: true },
    });
    for (const child of children) {
      await this.recalculateLevelsForServiceCategory(
        tx,
        child.serviceCategoryId,
        newLevel + 1,
      );
    }
  }

  async bulkMove(serviceCategoryIds: number[], newParentId: number | null) {
    if (serviceCategoryIds.length === 0) {
      throw new HttpException(
        'Необходимо выбрать хотя бы одну категорию',
        HttpStatus.BAD_REQUEST,
      );
    }

    const existing = await this.prisma.serviceCategory.findMany({
      where: { serviceCategoryId: { in: serviceCategoryIds } },
      select: { serviceCategoryId: true, parentId: true },
    });
    const existingIds = new Set(existing.map((c) => c.serviceCategoryId));
    const notFound = serviceCategoryIds.filter((id) => !existingIds.has(id));
    if (notFound.length > 0) {
      throw new HttpException(
        `Категории с ID ${notFound.join(', ')} не найдены`,
        HttpStatus.NOT_FOUND,
      );
    }

    let newParentLevel = -1;
    if (newParentId !== null) {
      const newParent = await this.prisma.serviceCategory.findUnique({
        where: { serviceCategoryId: newParentId },
        select: { serviceCategoryId: true, level: true },
      });
      if (!newParent) {
        throw new HttpException(
          'Родительская категория не найдена',
          HttpStatus.NOT_FOUND,
        );
      }
      newParentLevel = newParent.level;
      if (serviceCategoryIds.includes(newParentId)) {
        throw new HttpException(
          'Категория не может быть родителем самой себя',
          HttpStatus.BAD_REQUEST,
        );
      }
      for (const id of serviceCategoryIds) {
        const isDesc = await this.isDescendant(id, newParentId);
        if (isDesc) {
          throw new HttpException(
            'Категория не может быть перемещена в своего потомка',
            HttpStatus.BAD_REQUEST,
          );
        }
      }
    }

    const targetLevel = newParentId === null ? 0 : newParentLevel + 1;

    await this.prisma.$transaction(async (tx) => {
      await tx.serviceCategory.updateMany({
        where: { serviceCategoryId: { in: serviceCategoryIds } },
        data: { parentId: newParentId, level: targetLevel },
      });
      for (const id of serviceCategoryIds) {
        const children = await tx.serviceCategory.findMany({
          where: { parentId: id },
          select: { serviceCategoryId: true },
        });
        for (const ch of children) {
          await this.recalculateLevelsForServiceCategory(
            tx,
            ch.serviceCategoryId,
            targetLevel + 1,
          );
        }
      }
    });

    return {
      message: `Перемещено категорий: ${serviceCategoryIds.length}`,
      movedCount: serviceCategoryIds.length,
      serviceCategoryIds,
      newParentId,
    };
  }

  async bulkDelete(serviceCategoryIds: number[]) {
    if (serviceCategoryIds.length === 0) {
      throw new HttpException(
        'Необходимо выбрать хотя бы одну категорию',
        HttpStatus.BAD_REQUEST,
      );
    }

    const withChildrenOrServices = await this.prisma.serviceCategory.findMany({
      where: { serviceCategoryId: { in: serviceCategoryIds } },
      select: {
        serviceCategoryId: true,
        name: true,
        _count: { select: { children: true, services: true } },
      },
    });

    const blocked = withChildrenOrServices.filter(
      (c) => c._count.children > 0 || c._count.services > 0,
    );
    if (blocked.length > 0) {
      const reasons = blocked.map(
        (c) =>
          `${c.name}${c._count.children > 0 ? ' (есть подкатегории)' : ''}${c._count.services > 0 ? ' (есть услуги)' : ''}`,
      );
      throw new HttpException(
        `Нельзя удалить категории с подкатегориями или услугами: ${reasons.join('; ')}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const result = await this.prisma.serviceCategory.deleteMany({
      where: { serviceCategoryId: { in: serviceCategoryIds } },
    });

    return {
      message: `Удалено категорий: ${result.count}`,
      deletedCount: result.count,
      serviceCategoryIds,
    };
  }
}
