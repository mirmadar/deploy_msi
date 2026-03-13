import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma/prisma.service';

@Injectable()
export class PublicShipmentsService {
  constructor(private prisma: PrismaService) {}

  // Получить список категорий, у которых есть опубликованные посты отгрузок
  async getCategoriesWithShipments() {
    const categories = await this.prisma.category.findMany({
      where: {
        shipments: {
          some: {
            publishedAt: { not: null },
          },
        },
      },
      select: {
        categoryId: true,
        slug: true,
        name: true,
        imageUrl: true,
      },
      orderBy: [
        { sortOrder: 'asc' },
        { name: 'asc' },
      ],
    });

    return categories;
  }

  // Получить посты отгрузок по slug категории
  async getShipmentPostsByCategory(
    categorySlug: string,
    page = 1,
    pageSize = 20,
  ) {
    const category = await this.prisma.category.findUnique({
      where: { slug: categorySlug },
      select: { categoryId: true },
    });

    if (!category) {
      return null;
    }

    const skip = (page - 1) * pageSize;

    const [posts, total] = await Promise.all([
      this.prisma.shipmentPost.findMany({
        where: {
          categoryId: category.categoryId,
          publishedAt: { not: null },
        },
        select: {
          shipmentPostId: true,
          title: true,
          imageUrl: true,
          description: true,
          category: {
            select: {
              categoryId: true,
              slug: true,
              name: true,
            },
          },
        },
        orderBy: [
          { sortOrder: 'asc' },
          { shipmentPostId: 'asc' },
        ],
        skip,
        take: pageSize,
      }),
      this.prisma.shipmentPost.count({
        where: {
          categoryId: category.categoryId,
          publishedAt: { not: null },
        },
      }),
    ]);

    return {
      data: posts,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  // Получить все посты отгрузок
  async getAllShipmentPosts(page = 1, pageSize = 20) {
    const skip = (page - 1) * pageSize;

    const [posts, total] = await Promise.all([
      this.prisma.shipmentPost.findMany({
        where: {
          publishedAt: { not: null },
        },
        select: {
          shipmentPostId: true,
          title: true,
          imageUrl: true,
          description: true,
          category: {
            select: {
              categoryId: true,
              slug: true,
              name: true,
            },
          },
        },
        orderBy: [
          { sortOrder: 'asc' },
          { shipmentPostId: 'asc' },
        ],
        skip,
        take: pageSize,
      }),
      this.prisma.shipmentPost.count({
        where: {
          publishedAt: { not: null },
        },
      }),
    ]);

    return {
      data: posts,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }
}

