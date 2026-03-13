import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { CitiesService } from './cities.service';
import { CreateCityDto } from './dto/create-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';
import { MoveCityDto } from './dto/move-city.dto';
import { JwtAuthGuard } from 'src/admin/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/admin/auth/guards/roles.guard';
import { Roles } from 'src/admin/auth/decorators/roles.decorator';
import { parsePagination } from 'src/shared/common/utils/query-parser.util';

@Controller('admin/cities')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CitiesController {
  constructor(private readonly citiesService: CitiesService) {}

  @Post()
  @Roles('SUPER_ADMIN', 'ADMIN')
  async create(@Body() createCityDto: CreateCityDto) {
    return this.citiesService.createCity(createCityDto);
  }

  @Get()
  @Roles('SUPER_ADMIN', 'ADMIN')
  async getAll(
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '20',
  ) {
    const { page: pageNumber, pageSize: pageSizeNumber } = parsePagination(page, pageSize);
    return this.citiesService.getAllCities(pageNumber, pageSizeNumber);
  }

  @Get(':id')
  @Roles('SUPER_ADMIN', 'ADMIN')
  async getById(@Param('id', ParseIntPipe) id: number) {
    return this.citiesService.getCityById(id);
  }

  @Patch(':id/move')
  @Roles('SUPER_ADMIN', 'ADMIN')
  async move(@Param('id', ParseIntPipe) id: number, @Body() dto: MoveCityDto) {
    return this.citiesService.moveCity(id, dto.direction);
  }

  @Patch(':id')
  @Roles('SUPER_ADMIN', 'ADMIN')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCityDto: UpdateCityDto,
  ) {
    return this.citiesService.updateCity(id, updateCityDto);
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN', 'ADMIN')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.citiesService.deleteCity(id);
  }
}


