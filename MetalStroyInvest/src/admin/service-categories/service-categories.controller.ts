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
import { ServiceCategoriesService } from './service-categories.service';
import { CreateServiceCategoryDto } from './dto/create-service-category.dto';
import { UpdateServiceCategoryDto } from './dto/update-service-category.dto';
import { BulkMoveServiceCategoriesDto } from './dto/bulk-move-service-categories.dto';
import { BulkDeleteServiceCategoriesDto } from './dto/bulk-delete-service-categories.dto';
import { MoveServiceCategoryDto } from './dto/move-service-category.dto';
import { parsePagination } from 'src/shared/common/utils/query-parser.util';
import { JwtAuthGuard } from 'src/admin/auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('admin/service-categories')
export class ServiceCategoriesController {
  constructor(private readonly serviceCategoriesService: ServiceCategoriesService) {}

  @Post()
  async create(@Body() dto: CreateServiceCategoryDto) {
    return this.serviceCategoriesService.create(dto);
  }

  @Get()
  async getAll(
    @Query('page') page = '1',
    @Query('limit') limit = '25',
    @Query('parentId') parentId?: string,
  ) {
    const { page: pageNumber, pageSize: limitNumber } = parsePagination(page, limit);
    const parentIdValue =
      parentId === undefined ? undefined : parentId === 'null' ? null : Number(parentId);

    return this.serviceCategoriesService.getAll(pageNumber, limitNumber, parentIdValue);
  }

  @Get('tree')
  async getTree() {
    return this.serviceCategoriesService.getTree();
  }

  @Patch('bulk/move')
  async bulkMove(@Body() dto: BulkMoveServiceCategoriesDto) {
    return this.serviceCategoriesService.bulkMove(
      dto.serviceCategoryIds,
      dto.newParentId ?? null,
    );
  }

  @Delete('bulk')
  async bulkDelete(@Body() dto: BulkDeleteServiceCategoriesDto) {
    return this.serviceCategoriesService.bulkDelete(dto.serviceCategoryIds);
  }

  @Get(':id')
  async getById(@Param('id', ParseIntPipe) id: number) {
    return this.serviceCategoriesService.getById(id);
  }

  @Patch(':id/move')
  async move(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: MoveServiceCategoryDto,
  ) {
    return this.serviceCategoriesService.move(id, dto.direction);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateServiceCategoryDto,
  ) {
    return this.serviceCategoriesService.update(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.serviceCategoriesService.delete(id);
  }
}
