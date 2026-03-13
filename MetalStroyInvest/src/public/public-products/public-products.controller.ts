import { Controller, Get, Param } from '@nestjs/common';
import { PublicProductsService } from './public-products.service';

@Controller('public/:citySlug/products')
export class PublicProductsController {
  constructor(private readonly publicProductsService: PublicProductsService) {}

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
