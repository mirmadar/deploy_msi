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
  UseGuards,
} from '@nestjs/common';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { CreateServiceBlockDto } from './dto/create-service-block.dto';
import { UpdateServiceBlockDto } from './dto/update-service-block.dto';
import { ReorderServiceBlocksDto } from './dto/reorder-service-blocks.dto';
import { BulkMoveServicesDto } from './dto/bulk-move-services.dto';
import { BulkDeleteServicesDto } from './dto/bulk-delete-services.dto';
import { MoveServiceDto } from './dto/move-service.dto';
import { parsePagination } from 'src/shared/common/utils/query-parser.util';
import { JwtAuthGuard } from 'src/admin/auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('admin/services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Post()
  async create(@Body() dto: CreateServiceDto) {
    return this.servicesService.create(dto);
  }

  @Get()
  async getAll(
    @Query('page') page = '1',
    @Query('limit') limit = '25',
    @Query('serviceCategoryId') serviceCategoryId?: string,
  ) {
    const { page: pageNumber, pageSize: limitNumber } = parsePagination(page, limit);
    const categoryId =
      serviceCategoryId === undefined ? undefined : Number(serviceCategoryId);

    return this.servicesService.getAll(pageNumber, limitNumber, categoryId);
  }

  @Patch('bulk/move')
  async bulkMove(@Body() dto: BulkMoveServicesDto) {
    return this.servicesService.bulkMove(
      dto.serviceIds,
      dto.newServiceCategoryId,
    );
  }

  @Delete('bulk')
  async bulkDelete(@Body() dto: BulkDeleteServicesDto) {
    return this.servicesService.bulkDelete(dto.serviceIds);
  }

  @Get(':id')
  async getById(@Param('id', ParseIntPipe) id: number) {
    return this.servicesService.getById(id);
  }

  @Patch(':id/move')
  async move(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: MoveServiceDto,
  ) {
    return this.servicesService.move(id, dto.direction);
  }

  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateServiceDto) {
    return this.servicesService.update(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.servicesService.delete(id);
  }

  // ——— Блоки ———

  @Post(':id/blocks')
  async addBlock(
    @Param('id', ParseIntPipe) serviceId: number,
    @Body() dto: CreateServiceBlockDto,
  ) {
    return this.servicesService.addBlock(serviceId, dto);
  }

  @Patch(':id/blocks/reorder')
  async reorderBlocks(
    @Param('id', ParseIntPipe) serviceId: number,
    @Body() dto: ReorderServiceBlocksDto,
  ) {
    return this.servicesService.reorderBlocks(serviceId, dto);
  }

  @Patch(':id/blocks/:blockId')
  async updateBlock(
    @Param('id', ParseIntPipe) serviceId: number,
    @Param('blockId', ParseIntPipe) serviceBlockId: number,
    @Body() dto: UpdateServiceBlockDto,
  ) {
    return this.servicesService.updateBlock(serviceId, serviceBlockId, dto);
  }

  @Delete(':id/blocks/:blockId')
  async deleteBlock(
    @Param('id', ParseIntPipe) serviceId: number,
    @Param('blockId', ParseIntPipe) serviceBlockId: number,
  ) {
    return this.servicesService.deleteBlock(serviceId, serviceBlockId);
  }
}
