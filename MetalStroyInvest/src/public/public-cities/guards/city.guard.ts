import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from 'src/shared/prisma/prisma.service';

type CachedCity = {
  cityId: number;
  name: string;
  slug: string;
  phone: string;
  workHours: string | null;
};

@Injectable()
export class CityGuard implements CanActivate {
  private readonly cityCache = new Map<
    string,
    { data: CachedCity; timestamp: number }
  >();
  private readonly CACHE_TTL_MS = 5 * 60 * 1000; // 5 минут

  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const url = request.url;

    // Убираем query параметры из URL для парсинга
    const urlWithoutQuery = url.split('?')[0];

    // Извлекаем citySlug из URL
    // Формат: /public/:citySlug/...
    const urlParts = urlWithoutQuery.split('/').filter((part) => part.length > 0);

    // Проверяем, что URL начинается с 'public'
    if (urlParts[0] !== 'public') {
      return true; // Если это не публичный URL, пропускаем
    }

    // Второй сегмент должен быть citySlug
    if (urlParts.length < 2) {
      return true; // Если нет citySlug, пропускаем (может быть другой публичный эндпоинт)
    }

    const citySlug = urlParts[1];

    // Проверяем, что это не известный публичный эндпоинт без города
    const publicEndpointsWithoutCity = [
      'cities',
      'callback-request',
      'orders',
      'cart',
    ];

    if (publicEndpointsWithoutCity.includes(citySlug)) {
      return true; // Это эндпоинт без города, пропускаем
    }

    const now = Date.now();
    const cached = this.cityCache.get(citySlug);
    if (cached && now - cached.timestamp < this.CACHE_TTL_MS) {
      request.city = cached.data;
      return true;
    }

    // Ищем город в БД
    const city = await this.prisma.city.findFirst({
      where: {
        slug: citySlug,
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
      throw new NotFoundException(`Город "${citySlug}" не найден`);
    }

    this.cityCache.set(citySlug, { data: city, timestamp: now });

    // Добавляем данные города в request
    request.city = city;

    return true;
  }
}

