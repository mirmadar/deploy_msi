import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { paginateQuery, PaginatedResult } from 'src/shared/common/utils/pagination.util';
import { Prisma } from '@prisma/client';
import { SlugUtil } from 'src/shared/common/utils/slug.util';
import { EntityUtil } from 'src/shared/common/utils/entity.util';

@Injectable()
export class ArticlesService {
  constructor(private prisma: PrismaService) {}

  async createArticle(createArticleDto: CreateArticleDto, authorId: number) {
    const baseSlug = SlugUtil.generateSlug(createArticleDto.title);
    const slug = await SlugUtil.generateUniqueArticleSlug(this.prisma, baseSlug);

    const max = await this.prisma.article.aggregate({
      _max: { sortOrder: true },
    });
    const sortOrder = (max._max.sortOrder ?? -1) + 1;

    const article = await this.prisma.article.create({
      data: {
        title: createArticleDto.title,
        slug,
        content: createArticleDto.content,
        imageUrl: createArticleDto.imageUrl ?? null,
        publishedAt: null,
        authorId,
        sortOrder,
      },
      select: {
        articleId: true,
        title: true,
        slug: true,
        content: true,
        imageUrl: true,
        publishedAt: true,
        sortOrder: true,
        createdAt: true,
        updatedAt: true,
        author: {
          select: {
            userId: true,
            username: true,
            email: true,
          },
        },
      },
    });

    return article;
  }

  async publishArticle(articleId: number) {
    await EntityUtil.findOrFail(this.prisma, 'article', articleId);

    const article = await this.prisma.article.update({
      where: { articleId },
      data: {
        publishedAt: new Date(),
      },
      select: {
        articleId: true,
        title: true,
        slug: true,
        content: true,
        imageUrl: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
        author: {
          select: {
            userId: true,
            username: true,
            email: true,
          },
        },
      },
    });

    return article;
  }

  async getAllArticles(page = 1, pageSize = 20) {
    const select = {
      articleId: true,
      title: true,
      slug: true,
      content: true,
      imageUrl: true,
      publishedAt: true,
      sortOrder: true,
      createdAt: true,
      updatedAt: true,
      author: {
        select: {
          userId: true,
          username: true,
          email: true,
        },
      },
    } as const;

    type ArticleSelect = typeof select;
    type ArticleWithAuthor = Prisma.ArticleGetPayload<{
      select: ArticleSelect;
    }>;

    const result = await paginateQuery({
      findMany: (args) => this.prisma.article.findMany(args as Prisma.ArticleFindManyArgs),
      count: () => this.prisma.article.count(),
      orderBy: [{ sortOrder: 'asc' as const }, { articleId: 'asc' as const }] as Prisma.ArticleOrderByWithRelationInput[],
      select,
      pagination: { page, pageSize },
    }) as unknown as PaginatedResult<ArticleWithAuthor>;

    return result;
  }

  async getArticleById(articleId: number) {
    const article = await this.prisma.article.findUnique({
      where: { articleId },
      select: {
        articleId: true,
        title: true,
        slug: true,
        content: true,
        imageUrl: true,
        publishedAt: true,
        sortOrder: true,
        createdAt: true,
        updatedAt: true,
        author: {
          select: {
            userId: true,
            username: true,
            email: true,
          },
        },
      },
    });

    if (!article) {
      throw new HttpException('Статья не найдена', HttpStatus.NOT_FOUND);
    }

    return article;
  }

  async updateArticle(articleId: number, updateArticleDto: UpdateArticleDto) {
    await EntityUtil.findOrFail(this.prisma, 'article', articleId);

    const updateData: {
      title?: string;
      slug?: string;
      content?: string;
      imageUrl?: string | null;
      publishedAt?: Date | null;
    } = {};

    // Если обновляется название, нужно обновить slug
    if (updateArticleDto.title !== undefined) {
      updateData.title = updateArticleDto.title;
      const baseSlug = SlugUtil.generateSlug(updateArticleDto.title);
      updateData.slug = await SlugUtil.generateUniqueArticleSlug(this.prisma, baseSlug, articleId);
    }

    if (updateArticleDto.content !== undefined) {
      updateData.content = updateArticleDto.content;
    }

    if (updateArticleDto.imageUrl !== undefined) {
      updateData.imageUrl = updateArticleDto.imageUrl || null;
    }

    if (updateArticleDto.publishedAt !== undefined) {
      updateData.publishedAt = updateArticleDto.publishedAt
        ? new Date(updateArticleDto.publishedAt)
        : null;
    }

    const updatedArticle = await this.prisma.article.update({
      where: { articleId },
      data: updateData,
      select: {
        articleId: true,
        title: true,
        slug: true,
        content: true,
        imageUrl: true,
        publishedAt: true,
        sortOrder: true,
        createdAt: true,
        updatedAt: true,
        author: {
          select: {
            userId: true,
            username: true,
            email: true,
          },
        },
      },
    });

    return updatedArticle;
  }

  async moveArticle(articleId: number, direction: 'up' | 'down') {
    const exists = await this.prisma.article.findUnique({
      where: { articleId },
      select: { articleId: true },
    });
    if (!exists) {
      throw new HttpException('Статья не найдена', HttpStatus.NOT_FOUND);
    }

    const all = await this.prisma.article.findMany({
      select: { articleId: true },
      orderBy: [{ sortOrder: 'asc' }, { articleId: 'asc' }],
    });

    const idx = all.findIndex((a) => a.articleId === articleId);
    if (idx === -1) return this.getArticleById(articleId);

    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= all.length) {
      throw new HttpException(
        direction === 'up' ? 'Уже в начале списка' : 'Уже в конце списка',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.prisma.$transaction(async (tx) => {
      for (let i = 0; i < all.length; i++) {
        await tx.article.update({
          where: { articleId: all[i].articleId },
          data: { sortOrder: i },
        });
      }
      await tx.article.update({ where: { articleId }, data: { sortOrder: swapIdx } });
      await tx.article.update({ where: { articleId: all[swapIdx].articleId }, data: { sortOrder: idx } });
    });

    return this.getArticleById(articleId);
  }

  async deleteArticle(articleId: number) {
    await EntityUtil.findOrFail(this.prisma, 'article', articleId);

    await this.prisma.article.delete({
      where: { articleId },
    });

    return { message: 'Статья удалена' };
  }

  async bulkDeleteArticles(articleIds: number[]) {
    if (articleIds.length === 0) {
      throw new HttpException('Необходимо выбрать хотя бы одну статью', HttpStatus.BAD_REQUEST);
    }

    await EntityUtil.validateIdsExist(this.prisma, 'article', articleIds, 'articleId', 'Статьи');

    const result = await this.prisma.article.deleteMany({
      where: {
        articleId: { in: articleIds },
      },
    });

    return {
      message: `Удалено статей: ${result.count}`,
      deletedCount: result.count,
      articleIds,
    };
  }

  async bulkPublishArticles(articleIds: number[]) {
    if (articleIds.length === 0) {
      throw new HttpException('Необходимо выбрать хотя бы одну статью', HttpStatus.BAD_REQUEST);
    }

    await EntityUtil.validateIdsExist(this.prisma, 'article', articleIds, 'articleId', 'Статьи');

    const result = await this.prisma.article.updateMany({
      where: {
        articleId: { in: articleIds },
      },
      data: {
        publishedAt: new Date(),
      },
    });

    return {
      message: `Опубликовано статей: ${result.count}`,
      publishedCount: result.count,
      articleIds,
    };
  }

  async bulkUnpublishArticles(articleIds: number[]) {
    if (articleIds.length === 0) {
      throw new HttpException('Необходимо выбрать хотя бы одну статью', HttpStatus.BAD_REQUEST);
    }

    await EntityUtil.validateIdsExist(this.prisma, 'article', articleIds, 'articleId', 'Статьи');

    const result = await this.prisma.article.updateMany({
      where: {
        articleId: { in: articleIds },
      },
      data: {
        publishedAt: null,
      },
    });

    return {
      message: `Снято с публикации статей: ${result.count}`,
      unpublishedCount: result.count,
      articleIds,
    };
  }
}

