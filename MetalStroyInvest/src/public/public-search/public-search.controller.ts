import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from 'src/admin/search/search.service';
import { parsePagination } from 'src/shared/common/utils/query-parser.util';

@Controller('public/:citySlug/search')
export class PublicSearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  async search(
    @Query('q') q?: string,
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '20',
    @Query('limit') limit?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
  ) {
    const pageSizeToUse = limit || pageSize;
    const { page: pageNumber, pageSize: pageSizeNumber } = parsePagination(page, pageSizeToUse);

    const minPriceNumber =
      minPrice !== undefined && minPrice !== null && minPrice !== ''
        ? Number(minPrice)
        : undefined;
    const maxPriceNumber =
      maxPrice !== undefined && maxPrice !== null && maxPrice !== ''
        ? Number(maxPrice)
        : undefined;

    const result = await this.searchService.searchProducts({
      query: q,
      page: pageNumber,
      pageSize: pageSizeNumber,
      ...(Number.isFinite(minPriceNumber!) && { minPrice: minPriceNumber }),
      ...(Number.isFinite(maxPriceNumber!) && { maxPrice: maxPriceNumber }),
      // В публичном поиске всегда пытаемся исключить архивные товары на уровне ES-запроса
      excludeArchive: true,
    });

    // Дополнительно страхуемся: фильтруем ARCHIVE в ответе,
    // даже если по какой-то причине они всё ещё попали из Elasticsearch.
    if (Array.isArray((result as any).data)) {
      const originalData = (result as any).data;
      const filteredData = originalData.filter(
        (item: any) => item?.status !== 'ARCHIVE',
      );
      const removedCount = originalData.length - filteredData.length;
      // Оставляем в списке категорий только те, по которым реально остались товары
      let categories = (result as any).categories;
      if (Array.isArray(categories)) {
        const categoryIdsWithProducts = new Set(
          filteredData
            .map((item: any) => item?.category?.id)
            .filter((id: number | undefined) => id != null),
        );
        categories = categories.filter(
          (c: any) => categoryIdsWithProducts.has(c.id),
        );
      }

      return {
        ...(result as any),
        data: filteredData,
        categories,
        total:
          typeof (result as any).total === 'number'
            ? Math.max(0, (result as any).total - removedCount)
            : (result as any).total,
      };
    }

    return result;
  }
}
