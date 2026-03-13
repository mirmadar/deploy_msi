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
import { ShipmentsService } from './shipments.service';
import { CreateShipmentPostDto } from './dto/create-shipment-post.dto';
import { UpdateShipmentPostDto } from './dto/update-shipment-post.dto';
import { BulkDeleteShipmentPostsDto } from './dto/bulk-delete-shipment-posts.dto';
import { BulkPublishShipmentPostsDto } from './dto/bulk-publish-shipment-posts.dto';
import { MoveShipmentPostDto } from './dto/move-shipment-post.dto';
import { parsePagination } from 'src/shared/common/utils/query-parser.util';
import { JwtAuthGuard } from 'src/admin/auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('admin/shipments')
export class ShipmentsController {
  constructor(private readonly shipmentsService: ShipmentsService) {}

  @Post()
  async create(@Body() dto: CreateShipmentPostDto) {
    return this.shipmentsService.createShipmentPost(dto);
  }

  @Get()
  async getAll(
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '20',
    @Query('categoryId') categoryId?: string,
  ) {
    const { page: pageNumber, pageSize: pageSizeNumber } = parsePagination(
      page,
      pageSize,
    );
    const categoryIdValue = categoryId ? Number(categoryId) : undefined;

    return this.shipmentsService.getAllShipmentPosts(
      pageNumber,
      pageSizeNumber,
      categoryIdValue,
    );
  }

  @Get('categories')
  async getCategoriesWithShipments() {
    return this.shipmentsService.getCategoriesWithShipments();
  }

  @Get('categories/select')
  async getAllCategoriesForSelect() {
    return this.shipmentsService.getAllCategoriesForSelect();
  }

  @Post('bulk-delete')
  async bulkDelete(@Body() dto: BulkDeleteShipmentPostsDto) {
    return this.shipmentsService.bulkDeleteShipmentPosts(dto.shipmentPostIds);
  }

  @Patch('bulk-publish')
  async bulkPublish(@Body() dto: BulkPublishShipmentPostsDto) {
    return this.shipmentsService.bulkPublishShipmentPosts(dto.shipmentPostIds);
  }

  @Patch('bulk-unpublish')
  async bulkUnpublish(@Body() dto: BulkPublishShipmentPostsDto) {
    return this.shipmentsService.bulkUnpublishShipmentPosts(dto.shipmentPostIds);
  }

  @Get(':id')
  async getById(@Param('id', ParseIntPipe) id: number) {
    return this.shipmentsService.getShipmentPostById(id);
  }

  @Patch(':id/move')
  async move(@Param('id', ParseIntPipe) id: number, @Body() dto: MoveShipmentPostDto) {
    return this.shipmentsService.moveShipmentPost(id, dto.direction);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateShipmentPostDto,
  ) {
    return this.shipmentsService.updateShipmentPost(id, dto);
  }

  @Patch(':id/publish')
  async publish(@Param('id', ParseIntPipe) id: number) {
    return this.shipmentsService.publishShipmentPost(id);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.shipmentsService.deleteShipmentPost(id);
  }
}


