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
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { ProductStatus, ProductUnit } from '@prisma/client';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateProductCharacteristicsDto } from 'src/admin/product-characteristics/dto/update-product-characteristics.dto';
import { BulkUpdateProductsDto } from './dto/bulk-update-products.dto';
import { BulkDeleteProductsDto } from './dto/bulk-delete-products.dto';
import { BulkUpdateByFiltersDto } from './dto/bulk-update-by-filters.dto';
import { BulkDeleteByFiltersDto } from './dto/bulk-delete-by-filters.dto';
import { SearchService } from 'src/admin/search/search.service';
import { parseCategories, parseCategoryIds, parsePrice, parseBoolean, parsePagination, parseSortParams } from 'src/shared/common/utils/query-parser.util';
import { JwtAuthGuard } from 'src/admin/auth/guards/jwt-auth.guard';
import { CategoriesService } from 'src/admin/categories/categories.service';

@UseGuards(JwtAuthGuard)
@Controller('admin/products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly searchService: SearchService,
    private readonly categoriesService: CategoriesService,
  ) {}

  @Post()
  async create(@Body() dto: CreateProductDto) {
    return this.productsService.createProduct(dto);
  }

  @Get()
  async getAll(
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '20',
    @Query('search') search?: string,
    @Query('categories') categories?: string | string[],
    @Query('categoryIds') categoryIdsParam?: string | string[],
    @Query('minPrice') minPriceStr?: string,
    @Query('maxPrice') maxPriceStr?: string,
    @Query('status') status?: string,
    @Query('isNew') isNewStr?: string,
    @Query('unit') unit?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: string,
    @Req() request?: Request,
  ) {
    const { page: pageNumber, pageSize: pageSizeNumber } = parsePagination(page, pageSize);
    const categoriesArray = parseCategories(categories, request?.query);
    const categoryIds = parseCategoryIds(categoryIdsParam, request?.query);
    const minPrice = parsePrice(minPriceStr);
    const maxPrice = parsePrice(maxPriceStr);
    const isNew = parseBoolean(isNewStr);
    const { sortBy: validSortBy, sortOrder: validSortOrder } = parseSortParams(
      sortBy,
      sortOrder,
      ['price', 'productId'] as const,
      'productId',
    );

    let resolvedCategoryIds: number[] | undefined;
    if (categoryIds?.length) {
      resolvedCategoryIds = await this.categoriesService.getCategoryIdsInBranch(categoryIds);
    }

    const hasFilters =
      (categoriesArray && categoriesArray.length > 0) ||
      (resolvedCategoryIds && resolvedCategoryIds.length > 0) ||
      minPrice !== undefined ||
      maxPrice !== undefined ||
      status !== undefined ||
      isNew !== undefined ||
      unit !== undefined;

    if (search || hasFilters) {
      return this.searchService.searchProducts({
        query: search,
        page: pageNumber,
        pageSize: pageSizeNumber,
        categories: categoriesArray,
        categoryIds: resolvedCategoryIds,
        minPrice: minPrice && !isNaN(minPrice) ? minPrice : undefined,
        maxPrice: maxPrice && !isNaN(maxPrice) ? maxPrice : undefined,
        status: status,
        isNew: isNew,
        unit: unit,
        sortBy: validSortBy,
        sortOrder: validSortOrder,
      });
    }

    return this.productsService.getAllProducts(pageNumber, pageSizeNumber, validSortBy, validSortOrder);
  }

  @Get('count-by-filters')
  async countByFilters(
    @Query('categories') categories?: string | string[],
    @Query('categoryIds') categoryIdsParam?: string | string[],
    @Query('minPrice') minPriceStr?: string,
    @Query('maxPrice') maxPriceStr?: string,
    @Query('status') status?: string,
    @Query('isNew') isNewStr?: string,
    @Query('unit') unit?: string,
    @Query('categoryId') categoryIdStr?: string,
    @Req() request?: Request,
  ) {
    const categoriesArray = parseCategories(categories, request?.query);
    const categoryIds = parseCategoryIds(categoryIdsParam, request?.query);
    const minPrice = parsePrice(minPriceStr);
    const maxPrice = parsePrice(maxPriceStr);
    const isNew = parseBoolean(isNewStr);
    const categoryId = categoryIdStr ? parseInt(categoryIdStr, 10) : undefined;

    let resolvedCategoryIds: number[] | undefined;
    if (categoryIds?.length) {
      resolvedCategoryIds = await this.categoriesService.getCategoryIdsInBranch(categoryIds);
    }

    const count = await this.productsService.countProductsByFilters({
      categories: categoriesArray,
      categoryIds: resolvedCategoryIds,
      minPrice: minPrice && !isNaN(minPrice) ? minPrice : undefined,
      maxPrice: maxPrice && !isNaN(maxPrice) ? maxPrice : undefined,
      status: status as ProductStatus | undefined,
      isNew: isNew,
      unit: unit as ProductUnit | undefined,
      categoryId: categoryId && !isNaN(categoryId) ? categoryId : undefined,
    });

    return { count };
  }

  @Get(':id')
  async getById(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.getProductById(id);
  }

  @Patch('bulk-update')
  async bulkUpdate(@Body() dto: BulkUpdateProductsDto) {
    return this.productsService.bulkUpdateProducts(dto.productIds, {
      status: dto.status,
      isNew: dto.isNew,
      imageUrl: dto.imageUrl,
      categoryId: dto.categoryId,
      unit: dto.unit,
    });
  }

  @Patch('bulk-update-by-filters')
  async bulkUpdateByFilters(@Body() dto: BulkUpdateByFiltersDto) {
    return this.productsService.bulkUpdateProductsByFilters(
      dto.filters,
      {
        status: dto.status,
        isNew: dto.isNew,
        imageUrl: dto.imageUrl,
        categoryId: dto.categoryId,
        unit: dto.unit,
      },
      dto.confirmCount,
    );
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProductDto,
    @Body('characteristics') characteristicsDto?: UpdateProductCharacteristicsDto,
  ) {
    return this.productsService.updateProduct(id, dto, characteristicsDto);
  }

  @Post('bulk-delete')
  async bulkDelete(@Body() dto: BulkDeleteProductsDto) {
    return this.productsService.bulkDeleteProducts(dto.productIds);
  }

  @Post('bulk-delete-by-filters')
  async bulkDeleteByFilters(@Body() dto: BulkDeleteByFiltersDto) {
    return this.productsService.bulkDeleteProductsByFilters(dto.filters, dto.confirmCount);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.deleteProduct(id);
  }
}
