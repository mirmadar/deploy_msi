import { Controller, Get, Query, NotFoundException } from '@nestjs/common';
import { PublicShipmentsService } from './public-shipments.service';
import { parsePagination } from 'src/shared/common/utils/query-parser.util';

@Controller('public/:citySlug/shipments')
export class PublicShipmentsController {
  constructor(private readonly shipmentsService: PublicShipmentsService) {}

  @Get('categories')
  async getCategories() {
    const categories = await this.shipmentsService.getCategoriesWithShipments();
    return { data: categories };
  }

  @Get()
  async getAll(
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '20',
    @Query('categorySlug') categorySlug?: string,
  ) {
    const { page: pageNumber, pageSize: pageSizeNumber } = parsePagination(page, pageSize);

    if (categorySlug?.trim()) {
      const result = await this.shipmentsService.getShipmentPostsByCategory(
        categorySlug.trim(),
        pageNumber,
        pageSizeNumber,
      );
      if (result === null) {
        throw new NotFoundException('Категория не найдена');
      }
      return result;
    }

    return this.shipmentsService.getAllShipmentPosts(
      pageNumber,
      pageSizeNumber,
    );
  }
}


