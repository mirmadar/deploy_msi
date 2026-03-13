import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import {
  PublicCategoriesService,
  PublicCategoryWithPath,
} from './public-categories.service';

@Controller('public/:citySlug/categories')
export class PublicCategoriesController {
  constructor(private readonly publicCategoriesService: PublicCategoriesService) {}

  @Get()
  async getCategoriesByParent(
    @Query('parentId') parentId?: string,
  ) {
    const parentIdValue =
      parentId === undefined || parentId === 'null' ? null : Number(parentId);
    return this.publicCategoriesService.getCategoriesByParent(parentIdValue);
  }

  @Get(':slug')
  async getCategoryBySlug(
    @Param('slug') slug: string,
  ): Promise<PublicCategoryWithPath> {
    return this.publicCategoriesService.getCategoryBySlug(slug);
  }

  @Get(':slug/filters')
  async getCategoryFilters(@Param('slug') slug: string) {
    return this.publicCategoriesService.getCategoryFilters(slug);
  }

  @Get(':slug/filters/:characteristicNameId/values')
  async getFilterValues(
    @Param('slug') slug: string,
    @Param('characteristicNameId', ParseIntPipe) characteristicNameId: number,
  ) {
    return this.publicCategoriesService.getFilterValues(slug, characteristicNameId);
  }
}
