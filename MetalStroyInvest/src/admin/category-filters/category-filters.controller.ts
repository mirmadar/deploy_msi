import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { CategoryFiltersService } from './category-filters.service';
import { CreateCategoryFilterDto } from './dto/create-category-filter.dto';
import { UpdateCategoryFilterDto } from './dto/update-category-filter.dto';
import { BulkUpdateCategoryFiltersDto } from './dto/bulk-update-category-filters.dto';
import { JwtAuthGuard } from 'src/admin/auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('admin/category-filters')
export class CategoryFiltersController {
  constructor(private readonly categoryFiltersService: CategoryFiltersService) {}

  @Get(':categoryId')
  async getCategoryFilters(@Param('categoryId', ParseIntPipe) categoryId: number) {
    return this.categoryFiltersService.getCategoryFilters(categoryId);
  }

  @Post()
  async createCategoryFilter(@Body() dto: CreateCategoryFilterDto) {
    return this.categoryFiltersService.createCategoryFilter(dto);
  }

  @Patch('bulk')
  async bulkUpdateCategoryFilters(@Body() dto: BulkUpdateCategoryFiltersDto) {
    return this.categoryFiltersService.bulkUpdateCategoryFilters(dto.categoryId, {
      create: dto.create,
      delete: dto.delete,
      update: dto.update,
    });
  }

  @Patch(':id')
  async updateCategoryFilter(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCategoryFilterDto,
  ) {
    return this.categoryFiltersService.updateCategoryFilter(id, dto);
  }

  @Delete(':id')
  async deleteCategoryFilter(@Param('id', ParseIntPipe) id: number) {
    return this.categoryFiltersService.deleteCategoryFilter(id);
  }
}
