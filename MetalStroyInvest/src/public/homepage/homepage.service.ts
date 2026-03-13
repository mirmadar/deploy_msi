import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma/prisma.service';

@Injectable()
export class HomepageService {
  private cache: {
    data: {
      categories: Array<{ categoryId: number; name: string; slug: string | null; imageUrl: string | null }>;
      newProducts: Array<{ 
        productId: number; 
        name: string; 
        price: number; 
        imageUrl: string | null;
        unit: string | null;
        isNew: boolean | null;
        slug: string;
      }>;
      articles: Array<{ 
        articleId: number; 
        title: string; 
        slug: string; 
        imageUrl: string | null; 
        publishedAt: Date | null;
      }>;
    };
    timestamp: number;
  } | null = null;
  private readonly CACHE_TTL = 60 * 1000; // 1 минута кэш

  constructor(private prisma: PrismaService) {}

  async getHomepage() {
    const now = Date.now();
    if (this.cache && now - this.cache.timestamp < this.CACHE_TTL) {
      return this.cache.data;
    }

    // Выполняем запросы параллельно для лучшей производительности
    const [categories, newProducts, articles] = await Promise.all([
      this.prisma.category.findMany({
        where: {
          parentId: null,
        },
        take: 4,
        select: {
          categoryId: true,
          name: true,
          slug: true,
          imageUrl: true,
        },
        orderBy: [
          { sortOrder: 'asc' },
          { categoryId: 'asc' },
        ],
      }),
      this.prisma.product.findMany({
        take: 10,
        where: {
          isNew: true,
          status: 'IN_STOCK',
        },
        select: {
          productId: true,
          name: true,
          price: true,
          imageUrl: true,
          unit: true,
          isNew: true,
          slug: true,
        },
        orderBy: {
          productId: 'desc',
        },
      }),
      this.prisma.article.findMany({
        take: 10,
        where: {
          publishedAt: {
            not: null,
          },
        },
        select: {
          articleId: true,
          title: true,
          slug: true,
          imageUrl: true,
          publishedAt: true,
        },
        orderBy: [
          { sortOrder: 'asc' },
          { articleId: 'asc' },
        ],
      }),
    ]);

    const result = {
      categories,
      newProducts,
      articles,
    };

    // Сохраняем в кэш
    this.cache = {
      data: result,
      timestamp: now,
    };

    return result;
  }
}
