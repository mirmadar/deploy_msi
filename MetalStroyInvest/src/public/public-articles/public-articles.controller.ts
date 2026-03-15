import { Controller, Get, Param, Query } from '@nestjs/common';
import { PublicArticlesService } from './public-articles.service';
import { parsePagination } from 'src/shared/common/utils/query-parser.util';

@Controller('public/:citySlug/articles')
export class ArticlesController {
  constructor(private readonly articlesService: PublicArticlesService) {}

  @Get()
  async getAll(
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '10',
  ) {
    const { page: pageNumber, pageSize: pageSizeNumber } = parsePagination(page, pageSize);
    return this.articlesService.getAllPublishedArticles(pageNumber, pageSizeNumber);
  }

  @Get(':slug')
  async getBySlug(@Param('slug') slug: string) {
    const article = await this.articlesService.getArticleBySlug(slug);
    
    const relatedArticles = await this.articlesService.getRelatedArticles(
      article.articleId,
    );

    return {
      ...article,
      relatedArticles,
    };
  }
}

