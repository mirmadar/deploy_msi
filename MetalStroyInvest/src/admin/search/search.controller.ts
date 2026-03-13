//Контроллер в данный миомент не используется, но может быть использован в будущем

import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { SearchService } from './search.service';
import { parseCategories, parsePrice, parsePagination } from 'src/shared/common/utils/query-parser.util';
import { JwtAuthGuard } from 'src/admin/auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('admin/search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('filters')
  getFilters() {
    return this.searchService.getFilters();
  }

  @Get()
  search(
    @Query('q') q?: string,
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '20',
    @Query('categories') categories?: string | string[],
    @Query('minPrice') minPriceStr?: string,
    @Query('maxPrice') maxPriceStr?: string,
  ) {
    const { page: pageNumber, pageSize: pageSizeNumber } = parsePagination(page, pageSize);
    const categoriesArray = parseCategories(categories);
    const minPrice = parsePrice(minPriceStr);
    const maxPrice = parsePrice(maxPriceStr);

    return this.searchService.searchProducts({
      query: q,
      page: pageNumber,
      pageSize: pageSizeNumber,
      categories: categoriesArray,
      minPrice,
      maxPrice,
    });
  }
}
