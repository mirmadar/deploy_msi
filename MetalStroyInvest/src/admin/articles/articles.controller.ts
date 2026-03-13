import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  Patch,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { BulkDeleteArticlesDto } from './dto/bulk-delete-articles.dto';
import { BulkPublishArticlesDto } from './dto/bulk-publish-articles.dto';
import { MoveArticleDto } from './dto/move-article.dto';
import { parsePagination } from 'src/shared/common/utils/query-parser.util';
import { JwtAuthGuard } from 'src/admin/auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/admin/auth/decorators/current-user.decorator';
import type { JwtPayload } from 'src/admin/auth/types/jwt-payload.interface';

@UseGuards(JwtAuthGuard)
@Controller('admin/articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Post()
  async create(@Body() dto: CreateArticleDto, @CurrentUser() user: JwtPayload) {
    return this.articlesService.createArticle(dto, user.userId);
  }

  @Get()
  async getAll(
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '20',
  ) {
    const { page: pageNumber, pageSize: pageSizeNumber } = parsePagination(page, pageSize);

    return this.articlesService.getAllArticles(pageNumber, pageSizeNumber);
  }


  @Post('bulk-delete')
  async bulkDelete(@Body() dto: BulkDeleteArticlesDto) {
    return this.articlesService.bulkDeleteArticles(dto.articleIds);
  }


  @Patch('bulk-publish')
  async bulkPublish(@Body() dto: BulkPublishArticlesDto) {
    return this.articlesService.bulkPublishArticles(dto.articleIds);
  }


  @Patch('bulk-unpublish')
  async bulkUnpublish(@Body() dto: BulkPublishArticlesDto) {
    return this.articlesService.bulkUnpublishArticles(dto.articleIds);
  }

  @Get(':id')
  async getById(@Param('id', ParseIntPipe) id: number) {
    return this.articlesService.getArticleById(id);
  }

  @Patch(':id/move')
  async move(@Param('id', ParseIntPipe) id: number, @Body() dto: MoveArticleDto) {
    return this.articlesService.moveArticle(id, dto.direction);
  }

  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateArticleDto) {
    return this.articlesService.updateArticle(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.articlesService.deleteArticle(id);
  }

  @Patch(':id/publish')
  async publish(@Param('id', ParseIntPipe) id: number) {
    return this.articlesService.publishArticle(id);
  }
}

