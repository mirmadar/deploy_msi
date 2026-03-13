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
import { CharacteristicNamesService } from './characteristic-names.service';
import { CreateCharacteristicNameDto } from './dto/create-characteristic-name.dto';
import { UpdateCharacteristicNameDto } from './dto/update-characteristic-name.dto';
import { parsePagination } from 'src/shared/common/utils/query-parser.util';
import { JwtAuthGuard } from 'src/admin/auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('admin/characteristic-names')
export class CharacteristicNamesController {
  constructor(private readonly characteristicNamesService: CharacteristicNamesService) {}

  @Post()
  async create(@Body() dto: CreateCharacteristicNameDto) {
    return this.characteristicNamesService.createCharacteristicName(dto);
  }

  @Get()
  async getAll(
    @Query('page') page = '1',
    @Query('limit') limit = '25',
    @Query('search') search?: string,
    @Query('sortOrder') sortOrder?: string,
  ) {
    const { page: pageNumber, pageSize: limitNumber } = parsePagination(page, limit);
    const validSortOrder = sortOrder === 'desc' ? 'desc' : 'asc';
    return this.characteristicNamesService.getAllCharacteristicNames(
      pageNumber,
      limitNumber,
      search,
      validSortOrder,
    );
  }

  @Get('all')
  async getAllList(@Query('sortOrder') sortOrder?: string) {
    const validSortOrder = sortOrder === 'desc' ? 'desc' : 'asc';
    return this.characteristicNamesService.getAllCharacteristicNamesList(validSortOrder);
  }

  @Get(':id')
  async getById(@Param('id', ParseIntPipe) id: number) {
    return this.characteristicNamesService.getCharacteristicNameById(id);
  }

  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCharacteristicNameDto) {
    return this.characteristicNamesService.updateCharacteristicName(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.characteristicNamesService.deleteCharacteristicName(id);
  }
}
