import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { elasticClient } from './elastic.client';

@Injectable()
export class BulkIndexService {
  private readonly BATCH_SIZE = 500;
  private readonly logger = new Logger(BulkIndexService.name);

  private categoriesLoaded = false;
  private categoryMap = new Map<number, { categoryId: number; name: string; parentId: number | null }>();

  constructor(private readonly prisma: PrismaService) {}

  private async ensureCategoriesLoaded() {
    if (this.categoriesLoaded) return;
    const categories = await this.prisma.category.findMany({
      select: {
        categoryId: true,
        name: true,
        parentId: true,
      },
    });
    for (const c of categories) {
      this.categoryMap.set(c.categoryId, c);
    }
    this.categoriesLoaded = true;
  }

  private async buildCategoryPath(categoryId: number | null): Promise<string | null> {
    if (categoryId == null) return null;
    await this.ensureCategoriesLoaded();

    const names: string[] = [];
    let currentId: number | null = categoryId;

    while (currentId != null) {
      const cat = this.categoryMap.get(currentId);
      if (!cat) break;
      names.unshift(cat.name);
      currentId = cat.parentId;
    }

    return names.length > 0 ? names.join(' > ') : null;
  }

  async reindexAllProducts() {
    let lastId = 0;

    while (true) {
      const products = await this.prisma.product.findMany({
        take: this.BATCH_SIZE,
        where: {
          productId: { gt: lastId },
        },
        orderBy: {
          productId: 'asc',
        },
        include: {
          category: true,
          characteristics: {
            include: { characteristicName: true },
          },
        },
      });

      if (products.length === 0) break;

      const body = await Promise.all(
        products.flatMap(async (product) => {
        const characteristics = {};
        for (const c of product.characteristics) {
          characteristics[c.characteristicName.name] = c.value;
        }
          const categoryPath =
            product.category && product.category.categoryId
              ? await this.buildCategoryPath(product.category.categoryId)
              : null;

          return [
          {
            index: {
              _index: 'products',
              _id: product.productId,
            },
          },
          {
            productId: product.productId,
            name: product.name,
            price: product.price,
            isNew: product.isNew,
            status: product.status,
            unit: product.unit,
            slug: product.slug,
            imageUrl: product.imageUrl,
            category: product.category && {
              id: product.category.categoryId,
              name: product.category.name,
              slug: product.category.slug,
            },
              categoryPath,
            characteristics,
          },
        ];
        }),
      );

      const result = await elasticClient.bulk({ refresh: false, body });

      if (result.errors) {
        this.logger.error('Ошибки при bulk-индексации');
      }

      lastId = products[products.length - 1].productId;

      // Освобождаем память
      body.length = 0;
      products.length = 0;

      // Принудительная сборка мусора
      if (global.gc) {
        global.gc();
      }

      this.logger.log(`Проиндексировано до productId=${lastId}`);

      await new Promise((resolve) => setTimeout(resolve, 10));
    }

    this.logger.log('Индексация завершена');
  }

  async indexProduct(productId: number) {
    try {
      const product = await this.prisma.product.findUnique({
        where: { productId },
        include: {
          category: true,
          characteristics: {
            include: { characteristicName: true },
          },
        },
      });

      if (!product) {
        this.logger.warn(`Продукт ${productId} не найден для индексации`);
        return;
      }

      const characteristics = {};
      for (const c of product.characteristics) {
        characteristics[c.characteristicName.name] = c.value;
      }
      const categoryPath =
        product.category && product.category.categoryId
          ? await this.buildCategoryPath(product.category.categoryId)
          : null;

      await elasticClient.index({
        index: 'products',
        id: product.productId.toString(),
        body: {
          productId: product.productId,
          name: product.name,
          price: product.price,
          isNew: product.isNew,
          status: product.status,
          unit: product.unit,
          slug: product.slug,
          imageUrl: product.imageUrl,
          category: product.category && {
            id: product.category.categoryId,
            name: product.category.name,
            slug: product.category.slug,
          },
          categoryPath,
          characteristics,
        },
        refresh: false,
      });
    } catch (error) {
      this.logger.error(`Ошибка при индексации продукта ${productId}:`, error);
    }
  }

  async deleteProduct(productId: number) {
    try {
      await elasticClient.delete({
        index: 'products',
        id: productId.toString(),
        refresh: false,
      });
    } catch (error) {
      if (error.meta?.statusCode !== 404) {
        this.logger.error(`Ошибка при удалении продукта ${productId} из индекса:`, error);
      }
    }
  }

  // для bulk операций
  async indexProducts(productIds: number[]) {
    try {
      const products = await this.prisma.product.findMany({
        where: { productId: { in: productIds } },
        include: {
          category: true,
          characteristics: {
            include: { characteristicName: true },
          },
        },
      });

      if (products.length === 0) return;

      const body = await Promise.all(
        products.flatMap(async (product) => {
        const characteristics = {};
        for (const c of product.characteristics) {
          characteristics[c.characteristicName.name] = c.value;
        }
          const categoryPath =
            product.category && product.category.categoryId
              ? await this.buildCategoryPath(product.category.categoryId)
              : null;

          return [
          {
            index: {
              _index: 'products',
              _id: product.productId,
            },
          },
          {
            productId: product.productId,
            name: product.name,
            price: product.price,
            isNew: product.isNew,
            status: product.status,
            unit: product.unit,
            slug: product.slug,
            imageUrl: product.imageUrl,
            category: product.category && {
              id: product.category.categoryId,
              name: product.category.name,
              slug: product.category.slug,
            },
              categoryPath,
            characteristics,
          },
        ];
        }),
      );

      await elasticClient.bulk({ refresh: false, body });

      body.length = 0;
    } catch (error) {
      this.logger.error(`Ошибка при массовой индексации продуктов:`, error);
    }
  }
}
