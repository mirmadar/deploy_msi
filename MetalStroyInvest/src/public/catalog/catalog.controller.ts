import { Controller, Get, Param, Query, HttpException, HttpStatus } from '@nestjs/common';
import { CatalogService } from './catalog.service';

@Controller('public/:citySlug/catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get(':slug/products')
  async getCategoryProducts(
    @Param('slug') slug: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('characteristics') characteristicsStr?: string,
  ) {
    let characteristics: Record<string, string[]> | undefined;
    if (characteristicsStr) {
      try {
        characteristics = JSON.parse(characteristicsStr);
      } catch (error) {
        throw new HttpException(
          'Неверный формат параметра characteristics. Ожидается JSON объект.',
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    return this.catalogService.getCategoryProducts(
      slug,
      page,
      pageSize,
      minPrice,
      maxPrice,
      characteristics,
    );
  }
}
