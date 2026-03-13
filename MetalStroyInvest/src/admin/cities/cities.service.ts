import { HttpException, HttpStatus, Injectable, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { CreateCityDto } from './dto/create-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';
import { PublicCitiesService } from 'src/public/public-cities/public-cities.service';
import { paginateQuery, PaginatedResult } from 'src/shared/common/utils/pagination.util';
import { Prisma } from '@prisma/client';

@Injectable()
export class CitiesService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => PublicCitiesService))
    private publicCitiesService?: PublicCitiesService,
  ) {}

  async createCity(dto: CreateCityDto) {
    const existingCity = await this.prisma.city.findUnique({
      where: { slug: dto.slug },
    });

    if (existingCity) {
      throw new HttpException('Город с таким slug уже существует', HttpStatus.CONFLICT);
    }

    const max = await this.prisma.city.aggregate({
      _max: { sortOrder: true },
    });
    const sortOrder = (max._max.sortOrder ?? -1) + 1;

    const city = await this.prisma.city.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        phone: dto.phone,
        workHours: dto.workHours ?? null,
        sortOrder,
      },
    });

    // Инвалидируем кэш публичного сервиса
    this.publicCitiesService?.invalidateCache();

    return city;
  }

  async getAllCities(page = 1, pageSize = 20) {
    const select = {
      cityId: true,
      name: true,
      slug: true,
      phone: true,
      workHours: true,
      sortOrder: true,
    } as const;

    type CitySelect = typeof select;
    type City = Prisma.CityGetPayload<{
      select: CitySelect;
    }>;

    const result = await paginateQuery({
      findMany: (args) => this.prisma.city.findMany(args as Prisma.CityFindManyArgs),
      count: (args) => this.prisma.city.count(args as Prisma.CityCountArgs | undefined),
      where: {},
      orderBy: [{ sortOrder: 'asc' as const }, { cityId: 'asc' as const }] as Prisma.CityOrderByWithRelationInput[],
      select,
      pagination: { page, pageSize },
    }) as unknown as PaginatedResult<City>;

    return result;
  }

  async getCityById(cityId: number) {
    const city = await this.prisma.city.findUnique({
      where: { cityId },
      select: {
        cityId: true,
        name: true,
        slug: true,
        phone: true,
        workHours: true,
        sortOrder: true,
      },
    });

    if (!city) {
      throw new HttpException('Город не найден', HttpStatus.NOT_FOUND);
    }

    return city;
  }

  async getCityBySlug(slug: string) {
    const city = await this.prisma.city.findFirst({
      where: { slug },
    });

    if (!city) {
      throw new HttpException('Город не найден', HttpStatus.NOT_FOUND);
    }

    return city;
  }

  async updateCity(cityId: number, dto: UpdateCityDto) {
    const city = await this.prisma.city.findUnique({
      where: { cityId },
    });

    if (!city) {
      throw new HttpException('Город не найден', HttpStatus.NOT_FOUND);
    }

    // Если обновляется slug, проверяем уникальность
    if (dto.slug && dto.slug !== city.slug) {
      const existingCity = await this.prisma.city.findUnique({
        where: { slug: dto.slug },
      });

      if (existingCity) {
        throw new HttpException('Город с таким slug уже существует', HttpStatus.CONFLICT);
      }
    }

    const updatedCity = await this.prisma.city.update({
      where: { cityId },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.slug !== undefined && { slug: dto.slug }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
        ...(dto.workHours !== undefined && { workHours: dto.workHours }),
      },
    });

    // Инвалидируем кэш публичного сервиса
    this.publicCitiesService?.invalidateCache();

    return updatedCity;
  }

  async deleteCity(cityId: number) {
    const city = await this.prisma.city.findUnique({
      where: { cityId },
    });

    if (!city) {
      throw new HttpException('Город не найден', HttpStatus.NOT_FOUND);
    }

    await this.prisma.city.delete({
      where: { cityId },
    });

    // Инвалидируем кэш публичного сервиса
    this.publicCitiesService?.invalidateCache();

    return { message: 'Город успешно удален' };
  }

  async moveCity(cityId: number, direction: 'up' | 'down') {
    const exists = await this.prisma.city.findUnique({
      where: { cityId },
      select: { cityId: true },
    });
    if (!exists) {
      throw new HttpException('Город не найден', HttpStatus.NOT_FOUND);
    }

    const all = await this.prisma.city.findMany({
      select: { cityId: true },
      orderBy: [{ sortOrder: 'asc' }, { cityId: 'asc' }],
    });

    const idx = all.findIndex((c) => c.cityId === cityId);
    if (idx === -1) return this.getCityById(cityId);

    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= all.length) {
      throw new HttpException(
        direction === 'up' ? 'Уже в начале списка' : 'Уже в конце списка',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.prisma.$transaction(async (tx) => {
      for (let i = 0; i < all.length; i++) {
        await tx.city.update({
          where: { cityId: all[i].cityId },
          data: { sortOrder: i },
        });
      }
      await tx.city.update({ where: { cityId }, data: { sortOrder: swapIdx } });
      await tx.city.update({ where: { cityId: all[swapIdx].cityId }, data: { sortOrder: idx } });
    });

    return this.getCityById(cityId);
  }
}

