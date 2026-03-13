import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { CreateCharacteristicNameDto } from './dto/create-characteristic-name.dto';
import { UpdateCharacteristicNameDto } from './dto/update-characteristic-name.dto';
import { Prisma } from '@prisma/client';
import { paginateQuery } from 'src/shared/common/utils/pagination.util';
import { ValueType } from '@prisma/client';

@Injectable()
export class CharacteristicNamesService {
  constructor(private prisma: PrismaService) {}

  async createCharacteristicName(dto: CreateCharacteristicNameDto) {
    await this.ensureNameUnique(dto.name);

    return this.prisma.characteristicName.create({
      data: { name: dto.name.trim(), valueType: dto.valueType },
    });
  }

  async getAllCharacteristicNames(
    page = 1,
    limit = 25,
    search?: string,
    sortOrder: 'asc' | 'desc' = 'asc',
  ) {
    const whereCondition: Prisma.CharacteristicNameWhereInput = search
      ? {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        }
      : {};

    const orderBy: Prisma.CharacteristicNameOrderByWithRelationInput = { name: sortOrder };

    const select = {
      characteristicNameId: true,
      name: true,
      valueType: true,
    } as const;

    return paginateQuery({
      findMany: (args) => this.prisma.characteristicName.findMany(args as Prisma.CharacteristicNameFindManyArgs),
      count: (args) => this.prisma.characteristicName.count(args as Prisma.CharacteristicNameCountArgs | undefined),
      where: whereCondition,
      orderBy,
      select,
      pagination: { page, pageSize: limit },
    });
  }

  // Получение всех характеристик без пагинации (для выпадающих списков)
  async getAllCharacteristicNamesList(sortOrder: 'asc' | 'desc' = 'asc') {
    return this.prisma.characteristicName.findMany({
      select: {
        characteristicNameId: true,
        name: true,
        valueType: true,
      },
      orderBy: { name: sortOrder },
    });
  }

  async getCharacteristicNameById(id: number) {
    return this.getCharacteristicNameOrFail(id);
  }

  async updateCharacteristicName(id: number, dto: UpdateCharacteristicNameDto) {
    await this.getCharacteristicNameOrFail(id);

    const updateData: { name?: string; valueType?: ValueType } = {};

    if (dto.name) {
      await this.ensureNameUnique(dto.name, id);
      updateData.name = dto.name.trim();
    }

    if (dto.valueType) {
      updateData.valueType = dto.valueType;
    }

    return this.prisma.characteristicName.update({
      where: { characteristicNameId: id },
      data: updateData,
    });
  }

  async deleteCharacteristicName(id: number) {
    // Проверяем, используется ли характеристика
    const usageCount = await this.prisma.productCharacteristic.count({
      where: { characteristicNameId: id },
    });

    if (usageCount > 0) {
      throw new BadRequestException(
        `Невозможно удалить характеристику: она используется в ${usageCount} товарах. Сначала удалите эту характеристику у всех товаров.`,
      );
    }

    await this.prisma.characteristicName.delete({ where: { characteristicNameId: id } });
  }

  async findByName(name: string) {
    return this.prisma.characteristicName.findUnique({ where: { name: name.trim() } });
  }

  private async getCharacteristicNameOrFail(id: number) {
    const name = await this.prisma.characteristicName.findUnique({
      where: { characteristicNameId: id },
    });
    if (!name) throw new NotFoundException('Название характеристики не найдено');
    return name;
  }

  private async ensureNameUnique(name: string, id?: number) {
    const existing = await this.prisma.characteristicName.findUnique({
      where: { name: name.trim() },
    });
    if (existing && existing.characteristicNameId !== id) {
      throw new BadRequestException(`Название характеристики "${name}" уже существует`);
    }
  }
}
