import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma/prisma.service';

@Injectable()
export class PublicArticlesService {
  constructor(private prisma: PrismaService) {}

  async getAllPublishedArticles(page = 1, pageSize = 10) {
    const skip = (page - 1) * pageSize;

    const [articles, total] = await Promise.all([
      this.prisma.article.findMany({
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
          createdAt: true,
        },
        orderBy: [
          { sortOrder: 'asc' },
          { articleId: 'asc' },
        ],
        skip,
        take: pageSize,
      }),
      this.prisma.article.count({
        where: {
          publishedAt: {
            not: null,
          },
        },
      }),
    ]);

    return {
      data: articles,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async getArticleBySlug(slug: string) {
    const article = await this.prisma.article.findUnique({
      where: { slug },
      select: {
        articleId: true,
        title: true,
        slug: true,
        content: true,
        imageUrl: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!article) {
      throw new HttpException('Статья не найдена', HttpStatus.NOT_FOUND);
    }

    if (!article.publishedAt) {
      throw new HttpException('Статья не найдена', HttpStatus.NOT_FOUND);
    }

    return article;
  }

  // Для получения связанных статьей 
  async getRelatedArticles(currentArticleId: number) {
    const articles = await this.prisma.article.findMany({
      where: {
        publishedAt: {
          not: null,
        },
        articleId: {
          not: currentArticleId,
        },
      },
      select: {
        articleId: true,
        title: true,
        slug: true,
        imageUrl: true,
        publishedAt: true,
      },
      orderBy: {
        publishedAt: 'desc',
      },
    });

    return articles;
  }
}

