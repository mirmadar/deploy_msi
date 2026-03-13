import { HttpException, HttpStatus, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma/prisma.service';

@Injectable()
export class PublicCitiesService implements OnModuleInit {
  private citiesCache: Array<{
    cityId: number;
    name: string;
    slug: string;
    phone: string;
    workHours: string | null;
  }> | null = null;
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 минут
  private cacheTimestamp: number = 0;

  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    // Предзагрузка кэша при старте приложения
    await this.refreshCache();
  }

  /**
   * Обновить кэш городов
   */
  private async refreshCache() {
    const cities = await this.prisma.city.findMany({
      select: {
        cityId: true,
        name: true,
        slug: true,
        phone: true,
        workHours: true,
      },
      orderBy: [
        { sortOrder: 'asc' },
        { cityId: 'asc' },
      ],
    });

    this.citiesCache = cities;
    this.cacheTimestamp = Date.now();
  }

  /**
   * Получить список всех городов (с кэшированием)
   * Используется для селектора города на фронтенде
   */
  async getActiveCities(forceRefresh = false) {
    const now = Date.now();

    // Если кэш устарел, отсутствует или принудительное обновление, обновляем
    if (forceRefresh || !this.citiesCache || now - this.cacheTimestamp > this.CACHE_TTL) {
      await this.refreshCache();
    }

    // Возвращаем копию кэша, чтобы избежать мутаций
    return this.citiesCache ? [...this.citiesCache] : [];
  }

  /**
   * Инвалидировать кэш (вызывать при изменении городов в админке)
   */
  invalidateCache() {
    this.citiesCache = null;
    this.cacheTimestamp = 0;
  }

  /**
   * Получить город по slug
   * Используется для получения данных города (телефон, часы работы и т.д.)
   */
  async getCityBySlug(slug: string) {
    const city = await this.prisma.city.findFirst({
      where: {
        slug,
      },
      select: {
        cityId: true,
        name: true,
        slug: true,
        phone: true,
        workHours: true,
      },
    });

    if (!city) {
      throw new HttpException('Город не найден', HttpStatus.NOT_FOUND);
    }

    return city;
  }
}

