import {
  Body,
  Controller,
  Get,
  Post,
  HttpCode,
  HttpStatus,
  Param,
  Query,
} from '@nestjs/common';
import { PublicServicesService } from './public-services.service';
import { CreateServiceOrderDto } from './dto/create-service-order.dto';

@Controller('public/:citySlug/services')
export class PublicServicesController {
  constructor(private readonly servicesService: PublicServicesService) {}

  /**
   * Обзорная страница услуг:
   * корневые категории + несколько услуг в каждой
   */
  @Get()
  async getOverview(
    @Query('limitPerCategory') limitPerCategory = '3',
  ) {
    const limit = Number.isNaN(Number(limitPerCategory))
      ? 3
      : Math.max(1, Number(limitPerCategory));

    return this.servicesService.getServicesOverview(limit);
  }

  /**
   * Полный список услуг в категории (по slug категории услуг)
   */
  @Get('by-category/:slug')
  async getByCategory(@Param('slug') slug: string) {
    return this.servicesService.getServicesByCategorySlug(slug);
  }

  /**
   * Страница конкретной услуги по slug
   */
  @Get(':slug')
  async getBySlug(@Param('slug') slug: string) {
    return this.servicesService.getServiceBySlug(slug);
  }

  /**
   * Заявка на услугу (форма на странице услуги)
   */
  @Post(':slug/order')
  @HttpCode(HttpStatus.OK)
  async createOrder(
    @Param('slug') slug: string,
    @Body() dto: CreateServiceOrderDto,
  ) {
    await this.servicesService.sendServiceOrder(slug, dto.name, dto.phone);

    return {
      message: 'Заявка успешно отправлена',
    };
  }
}

