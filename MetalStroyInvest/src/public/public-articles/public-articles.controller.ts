import { Controller, Get, Param, Query } from '@nestjs/common';
import { PublicArticlesService } from './public-articles.service';

@Controller('public/:citySlug/articles')
export class ArticlesController {
  constructor(private readonly articlesService: PublicArticlesService) {}

  @Get()
  async getAll(
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '10',
  ) {
    const pageNumber = parseInt(page || '1', 10);
    const pageSizeNumber = parseInt(pageSize || '10', 10);

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

