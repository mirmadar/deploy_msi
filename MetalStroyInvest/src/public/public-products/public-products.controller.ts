import { Controller, Get, Param } from '@nestjs/common';
import { PublicProductsService } from './public-products.service';
import { getProductUnitOptions } from 'src/shared/common/constants/product-units';

@Controller('public/:citySlug/products')
export class PublicProductsController {
  constructor(private readonly publicProductsService: PublicProductsService) {}

  @Get('meta/units')
  getUnits() {
    return getProductUnitOptions();
  }

  /**
   * Получение товара по slug
   * URL: /public/:citySlug/products/:slug
   * В публичной части используем только slug для SEO и читаемости URL
   */
  @Get(':slug')
  async getProductBySlug(@Param('slug') slug: string) {
    return this.publicProductsService.getProductBySlug(slug);
  }
}
