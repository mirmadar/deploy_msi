import { Controller, Get, Post, Body, Param, ParseIntPipe, Patch, Delete, UseGuards } from '@nestjs/common';
import { ProductCharacteristicsService } from './product-characteristics.service';
import { CreateProductCharacteristicDto } from './dto/create-product-characteristic.dto';
import { UpdateProductCharacteristicDto } from './dto/update-product-characteristic.dto';
import { UpdateProductCharacteristicsDto } from './dto/update-product-characteristics.dto';
import { JwtAuthGuard } from 'src/admin/auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('admin/product-characteristics')
export class ProductCharacteristicsController {
  constructor(private readonly productCharacteristicsService: ProductCharacteristicsService) {}

  @Get('product/:productId')
  async getByProductId(@Param('productId', ParseIntPipe) productId: number) {
    return this.productCharacteristicsService.getProductCharacteristics(productId);
  }

  @Post('product/:productId')
  async create(
    @Param('productId', ParseIntPipe) productId: number,
    @Body() dto: CreateProductCharacteristicDto,
  ) {
    return this.productCharacteristicsService.createCharacteristic(productId, dto);
  }

  @Patch('product/:productId')
  async updateMultiple(
    @Param('productId', ParseIntPipe) productId: number,
    @Body() dto: UpdateProductCharacteristicsDto,
  ) {
    return this.productCharacteristicsService.updateProductCharacteristics(productId, dto);
  }

  @Patch(':id')
  async updateOne(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProductCharacteristicDto,
  ) {
    return this.productCharacteristicsService.updateCharacteristic(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.productCharacteristicsService.deleteCharacteristic(id);
  }
}
