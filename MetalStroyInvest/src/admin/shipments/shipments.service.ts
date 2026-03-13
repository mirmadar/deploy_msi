import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { CreateShipmentPostDto } from './dto/create-shipment-post.dto';
import { UpdateShipmentPostDto } from './dto/update-shipment-post.dto';
import { paginateQuery, PaginatedResult } from 'src/shared/common/utils/pagination.util';
import { Prisma } from '@prisma/client';
import { EntityUtil } from 'src/shared/common/utils/entity.util';
import { CategoriesService } from '../categories/categories.service';

@Injectable()
export class ShipmentsService {
  constructor(
    private prisma: PrismaService,
    private categoriesService: CategoriesService,
  ) {}

  async createShipmentPost(dto: CreateShipmentPostDto) {
    await EntityUtil.findOrFail(this.prisma, 'category', dto.categoryId);

    const max = await this.prisma.shipmentPost.aggregate({
      _max: { sortOrder: true },
    });
    const sortOrder = (max._max.sortOrder ?? -1) + 1;

    const shipmentPost = await this.prisma.shipmentPost.create({
      data: {
        title: dto.title,
        description: dto.description,
        imageUrl: dto.imageUrl,
        categoryId: dto.categoryId,
        publishedAt: null,
        sortOrder,
      },
      select: {
        shipmentPostId: true,
        title: true,
        description: true,
        imageUrl: true,
        categoryId: true,
        sortOrder: true,
        createdAt: true,
        updatedAt: true,
        publishedAt: true,
        category: {
          select: {
            categoryId: true,
            name: true,
          },
        },
      },
    });

    return shipmentPost;
  }

  async getAllShipmentPosts(page = 1, pageSize = 20, categoryId?: number) {
    const where: Prisma.ShipmentPostWhereInput = categoryId
      ? { categoryId }
      : {};

    const select = {
      shipmentPostId: true,
      title: true,
      description: true,
      imageUrl: true,
      categoryId: true,
      sortOrder: true,
      createdAt: true,
      updatedAt: true,
      publishedAt: true,
      category: {
        select: {
          categoryId: true,
          name: true,
        },
      },
    } as const;

    type ShipmentPostSelect = typeof select;
    type ShipmentPostWithCategory = Prisma.ShipmentPostGetPayload<{
      select: ShipmentPostSelect;
    }>;

    const orderBy: Prisma.ShipmentPostOrderByWithRelationInput[] = [
      { sortOrder: 'asc' },
      { shipmentPostId: 'asc' },
    ];

    const result = await paginateQuery({
      findMany: (args) =>
        this.prisma.shipmentPost.findMany(
          args as Prisma.ShipmentPostFindManyArgs,
        ),
      count: (args) =>
        this.prisma.shipmentPost.count(
          args as Prisma.ShipmentPostCountArgs | undefined,
        ),
      where,
      orderBy,
      select,
      pagination: { page, pageSize },
    }) as unknown as PaginatedResult<ShipmentPostWithCategory>;

    return result;
  }

  async getShipmentPostById(shipmentPostId: number) {
    const shipmentPost = await this.prisma.shipmentPost.findUnique({
      where: { shipmentPostId },
      select: {
        shipmentPostId: true,
        title: true,
        description: true,
        imageUrl: true,
        categoryId: true,
        sortOrder: true,
        createdAt: true,
        updatedAt: true,
        publishedAt: true,
        category: {
          select: {
            categoryId: true,
            name: true,
          },
        },
      },
    });

    if (!shipmentPost) {
      throw new HttpException(
        'Пост отгрузки не найден',
        HttpStatus.NOT_FOUND,
      );
    }

    return shipmentPost;
  }

  async updateShipmentPost(
    shipmentPostId: number,
    dto: UpdateShipmentPostDto,
  ) {
    await EntityUtil.findOrFail(this.prisma, 'shipmentPost', shipmentPostId);

    // Если обновляется categoryId, проверяем существование категории
    if (dto.categoryId !== undefined) {
      await EntityUtil.findOrFail(this.prisma, 'category', dto.categoryId);
    }

    const updateData: {
      title?: string;
      description?: string;
      imageUrl?: string;
      categoryId?: number;
      publishedAt?: Date | null;
    } = {};

    if (dto.title !== undefined) {
      updateData.title = dto.title;
    }

    if (dto.description !== undefined) {
      updateData.description = dto.description;
    }

    if (dto.imageUrl !== undefined) {
      updateData.imageUrl = dto.imageUrl;
    }

    if (dto.categoryId !== undefined) {
      updateData.categoryId = dto.categoryId;
    }

    if (dto.publishedAt !== undefined) {
      updateData.publishedAt =
        dto.publishedAt === null ? null : new Date(dto.publishedAt);
    }

    const updatedShipmentPost = await this.prisma.shipmentPost.update({
      where: { shipmentPostId },
      data: updateData,
      select: {
        shipmentPostId: true,
        title: true,
        description: true,
        imageUrl: true,
        categoryId: true,
        sortOrder: true,
        createdAt: true,
        updatedAt: true,
        publishedAt: true,
        category: {
          select: {
            categoryId: true,
            name: true,
          },
        },
      },
    });

    return updatedShipmentPost;
  }

  async moveShipmentPost(shipmentPostId: number, direction: 'up' | 'down') {
    const current = await this.prisma.shipmentPost.findUnique({
      where: { shipmentPostId },
      select: { shipmentPostId: true, sortOrder: true, title: true },
    });
    if (!current) {
      throw new HttpException(
        'Пост отгрузки не найден',
        HttpStatus.NOT_FOUND,
      );
    }

    const siblings = await this.prisma.shipmentPost.findMany({
      select: { shipmentPostId: true, sortOrder: true, title: true },
      orderBy: [{ sortOrder: 'asc' }, { shipmentPostId: 'asc' }],
    });

    const idx = siblings.findIndex((s) => s.shipmentPostId === shipmentPostId);
    if (idx === -1) return this.getShipmentPostById(shipmentPostId);

    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= siblings.length) {
      throw new HttpException(
        direction === 'up' ? 'Уже в начале списка' : 'Уже в конце списка',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Всегда нормализуем порядок (0,1,2,...), затем меняем местами текущий и соседний по индексу
    await this.prisma.$transaction(async (tx) => {
      for (let i = 0; i < siblings.length; i++) {
        await tx.shipmentPost.update({
          where: { shipmentPostId: siblings[i].shipmentPostId },
          data: { sortOrder: i },
        });
      }
      // Поменять местами: элемент idx получает sortOrder swapIdx, элемент swapIdx — sortOrder idx
      await tx.shipmentPost.update({
        where: { shipmentPostId },
        data: { sortOrder: swapIdx },
      });
      await tx.shipmentPost.update({
        where: { shipmentPostId: siblings[swapIdx].shipmentPostId },
        data: { sortOrder: idx },
      });
    });

    return this.getShipmentPostById(shipmentPostId);
  }

  async deleteShipmentPost(shipmentPostId: number) {
    await EntityUtil.findOrFail(this.prisma, 'shipmentPost', shipmentPostId);

    await this.prisma.shipmentPost.delete({
      where: { shipmentPostId },
    });

    return { message: 'Пост отгрузки удален' };
  }

  async publishShipmentPost(shipmentPostId: number) {
    await EntityUtil.findOrFail(this.prisma, 'shipmentPost', shipmentPostId);

    return this.prisma.shipmentPost.update({
      where: { shipmentPostId },
      data: { publishedAt: new Date() },
      select: {
        shipmentPostId: true,
        title: true,
        description: true,
        imageUrl: true,
        categoryId: true,
        createdAt: true,
        updatedAt: true,
        publishedAt: true,
        category: {
          select: {
            categoryId: true,
            name: true,
          },
        },
      },
    });
  }

  async bulkPublishShipmentPosts(shipmentPostIds: number[]) {
    if (shipmentPostIds.length === 0) {
      throw new HttpException(
        'Необходимо выбрать хотя бы один пост отгрузки',
        HttpStatus.BAD_REQUEST,
      );
    }

    await EntityUtil.validateIdsExist(
      this.prisma,
      'shipmentPost',
      shipmentPostIds,
      'shipmentPostId',
      'Посты отгрузок',
    );

    const result = await this.prisma.shipmentPost.updateMany({
      where: { shipmentPostId: { in: shipmentPostIds } },
      data: { publishedAt: new Date() },
    });

    return {
      message: `Опубликовано постов отгрузок: ${result.count}`,
      publishedCount: result.count,
      shipmentPostIds,
    };
  }

  async bulkUnpublishShipmentPosts(shipmentPostIds: number[]) {
    if (shipmentPostIds.length === 0) {
      throw new HttpException(
        'Необходимо выбрать хотя бы один пост отгрузки',
        HttpStatus.BAD_REQUEST,
      );
    }

    await EntityUtil.validateIdsExist(
      this.prisma,
      'shipmentPost',
      shipmentPostIds,
      'shipmentPostId',
      'Посты отгрузок',
    );

    const result = await this.prisma.shipmentPost.updateMany({
      where: { shipmentPostId: { in: shipmentPostIds } },
      data: { publishedAt: null },
    });

    return {
      message: `Снято с публикации постов отгрузок: ${result.count}`,
      unpublishedCount: result.count,
      shipmentPostIds,
    };
  }

  async bulkDeleteShipmentPosts(shipmentPostIds: number[]) {
    if (shipmentPostIds.length === 0) {
      throw new HttpException(
        'Необходимо выбрать хотя бы один пост отгрузки',
        HttpStatus.BAD_REQUEST,
      );
    }

    await EntityUtil.validateIdsExist(
      this.prisma,
      'shipmentPost',
      shipmentPostIds,
      'shipmentPostId',
      'Посты отгрузок',
    );

    const result = await this.prisma.shipmentPost.deleteMany({
      where: {
        shipmentPostId: { in: shipmentPostIds },
      },
    });

    return {
      message: `Удалено постов отгрузок: ${result.count}`,
      deletedCount: result.count,
      shipmentPostIds,
    };
  }

  // Получить список категорий, у которых есть посты отгрузок
  async getCategoriesWithShipments() {
    const categories = await this.prisma.category.findMany({
      where: {
        shipments: {
          some: {},
        },
      },
      select: {
        categoryId: true,
        name: true,
        imageUrl: true,
        _count: {
          select: {
            shipments: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return categories.map((cat) => ({
      categoryId: cat.categoryId,
      name: cat.name,
      imageUrl: cat.imageUrl,
      shipmentsCount: cat._count.shipments,
    }));
  }

  // Получить дерево категорий для выбора в форме (как на странице категорий)
  async getAllCategoriesForSelect() {
    return this.categoriesService.getCategoryTree();
  }
}

