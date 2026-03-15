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
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { BulkUpdateImageUrlDto } from './dto/bulk-update-image-url.dto';
import { BulkMoveCategoriesDto } from './dto/bulk-move-categories.dto';
import { MoveCategoryDto } from './dto/move-category.dto';
import { parsePagination } from 'src/shared/common/utils/query-parser.util';
import { JwtAuthGuard } from 'src/admin/auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('admin/categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  async create(@Body() dto: CreateCategoryDto) {
    return this.categoriesService.createCategory(dto);
  }

  @Get()
  async getAll(
    @Query('page') page = '1',
    @Query('limit') limit = '25',
    @Query('parentId') parentId?: string,
  ) {
    const { page: pageNumber, pageSize: limitNumber } = parsePagination(page, limit);
    const parentIdValue =
      parentId === undefined ? undefined : parentId === 'null' ? null : Number(parentId);

    return this.categoriesService.getAllCategories(pageNumber, limitNumber, parentIdValue);
  }

  @Get('tree')
  async getTree() {
    return this.categoriesService.getCategoryTree();
  }

  @Get('tree-for-filters')
  async getTreeForFilters() {
    return this.categoriesService.getCategoryTreeForFilters();
  }

  @Get(':id')
  async getById(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.getCategoryById(id);
  }

  @Patch(':id/move')
  async move(@Param('id', ParseIntPipe) id: number, @Body() dto: MoveCategoryDto) {
    return this.categoriesService.moveCategory(id, dto.direction);
  }

  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCategoryDto) {
    return this.categoriesService.updateCategory(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.deleteCategory(id);
  }

  @Patch('bulk/move')
  async bulkMoveCategories(@Body() dto: BulkMoveCategoriesDto) {
    return this.categoriesService.bulkMoveCategories(dto.categoryIds, dto.newParentId ?? null);
  }

  @Patch('bulk/image-url')
  async bulkUpdateImageUrl(@Body() dto: BulkUpdateImageUrlDto) {
    return this.categoriesService.bulkUpdateImageUrl(dto.categoryIds, dto.imageUrl ?? null);
  }
}
