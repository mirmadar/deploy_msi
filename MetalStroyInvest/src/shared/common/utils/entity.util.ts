import { HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma/prisma.service';

//Утилиты для работы с сущностями
export class EntityUtil {
  static async findOrFail<T extends { [key: string]: number }>(
    prisma: PrismaService,
    model: string,
    id: number,
    idField: string = `${model}Id`,
    errorMessage?: string,
  ): Promise<T> {
    const entity = await (prisma as any)[model].findUnique({
      where: { [idField]: id },
      select: { [idField]: true },
    });

    if (!entity) {
      const defaultMessage = this.getDefaultErrorMessage(model);
      throw new HttpException(errorMessage || defaultMessage, HttpStatus.NOT_FOUND);
    }

    return entity as T;
  }

  static async validateIdsExist(
    prisma: PrismaService,
    model: string,
    ids: number[],
    idField: string = `${model}Id`,
    entityName?: string,
  ): Promise<Set<number>> {
    if (ids.length === 0) {
      return new Set();
    }

    const entities = await (prisma as any)[model].findMany({
      where: { [idField]: { in: ids } },
      select: { [idField]: true },
    });

    const existingIds = new Set<number>(entities.map((e: any) => e[idField] as number));
    const notFoundIds = ids.filter((id) => !existingIds.has(id));

    if (notFoundIds.length > 0) {
      const name = entityName || this.getDefaultEntityName(model);
      const idsStr = notFoundIds.slice(0, 10).join(', ');
      const more = notFoundIds.length > 10 ? ` и еще ${notFoundIds.length - 10}` : '';
      throw new HttpException(
        `${name} с ID ${idsStr}${more} не найдены`,
        HttpStatus.NOT_FOUND,
      );
    }

    return existingIds;
  }

  private static getDefaultErrorMessage(model: string): string {
    const messages: { [key: string]: string } = {
      product: 'Товар не найден',
      article: 'Статья не найдена',
      category: 'Категория не найдена',
      user: 'Пользователь не найден',
      order: 'Заказ не найден',
      cart: 'Корзина не найдена',
      role: 'Роль не найдена',
      characteristicName: 'Характеристика не найдена',
      categoryFilter: 'Фильтр не найден',
    };

    return messages[model] || `${model} не найден`;
  }

  private static getDefaultEntityName(model: string): string {
    const names: { [key: string]: string } = {
      product: 'Товары',
      article: 'Статьи',
      category: 'Категории',
      user: 'Пользователи',
      order: 'Заказы',
      cart: 'Корзины',
      role: 'Роли',
      characteristicName: 'Характеристики',
      categoryFilter: 'Фильтры',
    };

    return names[model] || model;
  }
}

