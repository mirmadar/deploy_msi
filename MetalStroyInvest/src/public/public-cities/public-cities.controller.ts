import { Controller, Get, Param, Query } from '@nestjs/common';
import { PublicCitiesService } from './public-cities.service';

@Controller('public/cities')
export class PublicCitiesController {
  constructor(private readonly publicCitiesService: PublicCitiesService) {}

  /**
   * Получить список всех активных городов
   * GET /public/cities?refresh=true - принудительное обновление кэша
   */
  @Get()
  async getActiveCities(@Query('refresh') refresh?: string) {
    const forceRefresh = refresh === 'true';
    return this.publicCitiesService.getActiveCities(forceRefresh);
  }

  /**
   * Получить город по slug
   * GET /public/cities/:slug
   */
  @Get(':slug')
  async getCityBySlug(@Param('slug') slug: string) {
    return this.publicCitiesService.getCityBySlug(slug);
  }
}


