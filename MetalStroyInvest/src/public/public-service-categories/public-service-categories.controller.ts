import { Controller, Get, Param } from '@nestjs/common';
import { PublicServiceCategoriesService } from './public-service-categories.service';

@Controller('public/:citySlug/service-categories')
export class PublicServiceCategoriesController {
  constructor(
    private readonly serviceCategoriesService: PublicServiceCategoriesService,
  ) {}

  @Get()
  async getRootCategories() {
    return this.serviceCategoriesService.getRootCategories();
  }

  @Get(':slug')
  async getCategoryBySlug(@Param('slug') slug: string) {
    return this.serviceCategoriesService.getCategoryBySlug(slug);
  }
}

