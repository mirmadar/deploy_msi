import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CategoriesService } from 'src/admin/categories/categories.service';
import { ProductCharacteristicsService } from 'src/admin/product-characteristics/product-characteristics.service';
import { UpdateProductCharacteristicsDto } from 'src/admin/product-characteristics/dto/update-product-characteristics.dto';
import { ProductStatus, ProductUnit, Prisma } from '@prisma/client';
import { paginateQuery, PaginatedResult } from 'src/shared/common/utils/pagination.util';
import { BulkIndexService } from 'src/admin/search/bulk-index.service';
import { SearchService } from 'src/admin/search/search.service';
import { SlugUtil } from 'src/shared/common/utils/slug.util';
import { EntityUtil } from 'src/shared/common/utils/entity.util';
import { FormatUtil } from 'src/shared/common/utils/format.util';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    private prisma: PrismaService,
    private categoriesService: CategoriesService,
    private productCharacteristicsService: ProductCharacteristicsService,
    private bulkIndexService: BulkIndexService,
    private searchService: SearchService,
  ) {}

  async createProduct(createProductDto: CreateProductDto) {
    if (createProductDto.categoryId !== undefined && createProductDto.categoryId !== null) {
      await this.categoriesService.getCategoryOrFail(createProductDto.categoryId);
    }

    // Генерируем slug автоматически из названия
    const baseSlug = SlugUtil.generateSlug(createProductDto.name);
    const slug = await SlugUtil.generateUniqueProductSlug(this.prisma, baseSlug);

    const product = await this.prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          name: createProductDto.name,
          price: createProductDto.price,
          categoryId: createProductDto.categoryId ?? null,
          imageUrl: createProductDto.imageUrl ?? null,
          isNew: createProductDto.isNew ?? false,
          status: createProductDto.status ?? ProductStatus.IN_STOCK, // Дефолт IN_STOCK если не указан
          unit: createProductDto.unit ?? ProductUnit.SHT, // Дефолт SHT если не указан
          slug,
        },
        select: {
          productId: true,
          name: true,
          price: true,
          isNew: true,
          status: true,
          imageUrl: true,
          unit: true,
          slug: true,
        },
      });

      // Если есть характеристики — добавляем через сервис характеристик
      if (createProductDto.characteristics?.length) {
        await this.productCharacteristicsService.addCharacteristics(
          product.productId,
          createProductDto.characteristics,
          tx, // передаём транзакцию, чтобы всё было атомарно
        );
      }

      return product;
    });

    // Индексируем продукт в Elasticsearch после успешного создания
    try {
      await this.bulkIndexService.indexProduct(product.productId);
    } catch (error) {
      this.logger.error(
        `Ошибка индексации продукта ${product.productId} в Elasticsearch: ${error.message}`,
        error.stack,
      );
      // Не бросаем ошибку, т.к. продукт уже создан в БД
    }

    return product;
  }

  async getAllProducts(
    page = 1,
    pageSize = 20,
    sortBy: 'price' | 'productId' = 'productId',
    sortOrder: 'asc' | 'desc' = 'desc',
  ) {
    const orderBy: Prisma.ProductOrderByWithRelationInput =
      sortBy === 'price'
        ? { price: sortOrder }
        : { productId: sortOrder };

    const select = {
      productId: true,
      name: true,
      price: true,
      isNew: true,
      status: true,
      unit: true,
      slug: true,
      imageUrl: true,
      category: {
        select: {
          categoryId: true,
          name: true,
        },
      },
    } as const;

    type ProductSelect = typeof select;
    type ProductWithCategory = Prisma.ProductGetPayload<{
      select: ProductSelect;
    }>;

    const result = await paginateQuery({
      findMany: (args) => this.prisma.product.findMany(args as Prisma.ProductFindManyArgs),
      count: (args) => this.prisma.product.count(args as Prisma.ProductCountArgs | undefined),
      orderBy,
      select,
      pagination: { page, pageSize },
    }) as unknown as PaginatedResult<ProductWithCategory>;

    return {
      ...result,
      data: result.data.map((p) => ({
        ...p,
        category: FormatUtil.formatCategory(p.category),
      })),
    };
  }

  async getProductById(productId: number) {
    const product = await this.prisma.product.findUnique({
      where: { productId },
      select: {
        productId: true,
        name: true,
        price: true,
        isNew: true,
        status: true,
        imageUrl: true,
        unit: true,
        categoryId: true,
        slug: true,
      },
    });

    if (!product) {
      throw new HttpException('Товар не найден', HttpStatus.NOT_FOUND);
    }

    // Получаем путь категории
    const categoryPath = product.categoryId
      ? await this.categoriesService.findPath(product.categoryId)
      : [];

    // Получаем характеристики
    const characteristics =
      await this.productCharacteristicsService.getProductCharacteristics(productId);

    return {
      ...product,
      category: {
        id: product.categoryId,
        path: categoryPath.map((c) => c.name).join(' / '),
        pathItems: categoryPath,
      },
      characteristics,
    };
  }

  async updateProduct(
    productId: number,
    updateProductDto: UpdateProductDto,
    updateCharacteristicsDto?: UpdateProductCharacteristicsDto,
  ) {
    await EntityUtil.findOrFail(this.prisma, 'product', productId);
  
    // Генерируем slug автоматически, если обновляется name
    let slug: string | null | undefined = undefined;
    if (updateProductDto.name !== undefined) {
      const baseSlug = SlugUtil.generateSlug(updateProductDto.name);
      slug = await SlugUtil.generateUniqueProductSlug(this.prisma, baseSlug, productId);
    }
  
    const updatedProduct = await this.prisma.$transaction(async (tx) => {
      // Создаем объект для обновления, строго следуя типам Prisma
      const updateData: Prisma.ProductUpdateInput = {};
  
      if (updateProductDto.name !== undefined) updateData.name = updateProductDto.name;
      if (updateProductDto.price !== undefined) updateData.price = updateProductDto.price;
      if (updateProductDto.imageUrl !== undefined) updateData.imageUrl = updateProductDto.imageUrl;
      if (updateProductDto.isNew !== undefined) updateData.isNew = updateProductDto.isNew;
      if (updateProductDto.status !== undefined) updateData.status = updateProductDto.status;
      if (updateProductDto.unit !== undefined) updateData.unit = updateProductDto.unit;
      
      if (updateProductDto.categoryId !== undefined) {
        // Проверяем категорию только если она не null (null означает снятие категории)
        if (updateProductDto.categoryId !== null) {
          await this.categoriesService.getCategoryOrFail(updateProductDto.categoryId);
        }
        // Для Prisma используем connect/disconnect для отношений
        updateData.category = updateProductDto.categoryId !== null 
          ? { connect: { categoryId: updateProductDto.categoryId } }
          : { disconnect: true };
      }
      
      if (slug !== undefined) updateData.slug = slug;
  
      const updatedProduct = await tx.product.update({
        where: { productId },
        data: updateData,
        select: {
          productId: true,
          name: true,
          price: true,
          isNew: true,
          status: true,
          imageUrl: true,
          unit: true,
          slug: true,
        },
      });
  
      if (updateCharacteristicsDto) {
        if (updateCharacteristicsDto.delete?.length) {
          await this.productCharacteristicsService.deleteCharacteristics(
            productId,
            updateCharacteristicsDto.delete,
            tx,
          );
        }
  
        if (updateCharacteristicsDto.update?.length) {
          await this.productCharacteristicsService.updateCharacteristics(
            updateCharacteristicsDto.update,
            tx,
          );
        }
  
        if (updateCharacteristicsDto.add?.length) {
          await this.productCharacteristicsService.addCharacteristics(
            productId,
            updateCharacteristicsDto.add,
            tx,
          );
        }
      }
  
      return updatedProduct;
    });
  
    // Индексируем обновленный продукт в Elasticsearch
    try {
      await this.bulkIndexService.indexProduct(productId);
    } catch (error) {
      this.logger.error(
        `Ошибка индексации продукта ${productId} в Elasticsearch: ${error.message}`,
        error.stack,
      );
    }
  
    return updatedProduct;
  }

  async bulkUpdateProducts(
    productIds: number[],
    data: { status?: ProductStatus; isNew?: boolean; imageUrl?: string; categoryId?: number; unit?: ProductUnit },
  ) {
    if (!data.status && data.isNew === undefined && !data.imageUrl && data.categoryId === undefined && data.unit === undefined) {
      throw new HttpException('Необходимо указать хотя бы одно поле для обновления', HttpStatus.BAD_REQUEST);
    }

    const updateData: {
      status?: ProductStatus;
      isNew?: boolean;
      imageUrl?: string | null;
      categoryId?: number | null;
      unit?: ProductUnit;
    } = {};
    if (data.status !== undefined) updateData.status = data.status;
    if (data.isNew !== undefined) updateData.isNew = data.isNew;
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl || null;
    if (data.unit !== undefined) updateData.unit = data.unit;
    if (data.categoryId !== undefined) {
      if (data.categoryId !== null) {
        await this.categoriesService.getCategoryOrFail(data.categoryId);
      }
      updateData.categoryId = data.categoryId;
    }

    const BATCH_SIZE = 10000;
    let totalUpdated = 0;

    for (let i = 0; i < productIds.length; i += BATCH_SIZE) {
      const batch = productIds.slice(i, i + BATCH_SIZE);
      const result = await this.prisma.product.updateMany({
        where: { productId: { in: batch } },
        data: updateData,
      });
      totalUpdated += result.count;
    }

    // Индексируем обновленные продукты в Elasticsearch
    const ES_BATCH_SIZE = 1000;
    for (let i = 0; i < productIds.length; i += ES_BATCH_SIZE) {
      const batch = productIds.slice(i, i + ES_BATCH_SIZE);
      try {
        await this.bulkIndexService.indexProducts(batch);
      } catch (error) {
        this.logger.error(
          `Ошибка индексации продуктов в Elasticsearch (батч ${i / ES_BATCH_SIZE + 1}): ${error.message}`,
          error.stack,
        );
      }
    }

    return {
      message: 'Товары обновлены',
      updatedCount: totalUpdated,
    };
  }

  async deleteProduct(productId: number) {
    await EntityUtil.findOrFail(this.prisma, 'product', productId);

    // Проверяем, участвовал ли товар в заказах
    const orderItemsCount = await this.prisma.orderItem.count({
      where: { productId },
    });

    if (orderItemsCount > 0) {
      // Если товар уже был в заказах — не удаляем, а архивируем
      await this.prisma.$transaction(async (tx) => {
        // Чистим элементы корзины
        await tx.cartItem.deleteMany({
          where: { productId },
        });

        // Характеристики можно оставить для истории, поэтому не удаляем

        await tx.product.update({
          where: { productId },
          data: {
            status: ProductStatus.ARCHIVE,
            isNew: false,
          },
        });
      });

      try {
        await this.bulkIndexService.indexProduct(productId);
      } catch (error) {
        this.logger.error(
          `Ошибка переиндексации архивного продукта ${productId} в Elasticsearch: ${error.message}`,
          error.stack,
        );
      }

      return {
        message:
          'Товар участвовал в заказах и был помечен как архивный. Он больше не будет отображаться в публичном каталоге.',
        archived: true,
        productId,
      };
    }

    // Если товар ни разу не участвовал в заказах — можно удалить полностью
    await this.prisma.$transaction(async (tx) => {
      await tx.cartItem.deleteMany({
        where: { productId },
      });

      await tx.productCharacteristic.deleteMany({
        where: { productId },
      });

      await tx.product.delete({
        where: { productId },
      });
    });

    try {
      await this.bulkIndexService.deleteProduct(productId);
    } catch (error) {
      this.logger.error(
        `Ошибка удаления продукта ${productId} из Elasticsearch: ${error.message}`,
        error.stack,
      );
    }

    return { message: 'Товар удален', deleted: true, productId };
  }

  async bulkDeleteProducts(productIds: number[]) {
    if (productIds.length === 0) {
      throw new HttpException('Необходимо выбрать хотя бы один товар', HttpStatus.BAD_REQUEST);
    }

    const BATCH_SIZE = 10000;
    const existingIds = new Set<number>();
    const notFoundIds: number[] = [];

    for (let i = 0; i < productIds.length; i += BATCH_SIZE) {
      const batch = productIds.slice(i, i + BATCH_SIZE);
      const existingProducts = await this.prisma.product.findMany({
        where: {
          productId: { in: batch },
        },
        select: { productId: true },
      });

      const batchExistingIds = new Set(existingProducts.map((p) => p.productId));
      batch.forEach((id) => {
        if (batchExistingIds.has(id)) {
          existingIds.add(id);
        } else {
          notFoundIds.push(id);
        }
      });
    }

    if (notFoundIds.length > 0) {
      throw new HttpException(
        `Товары с ID ${notFoundIds.slice(0, 10).join(', ')}${notFoundIds.length > 10 ? ` и еще ${notFoundIds.length - 10}` : ''} не найдены`,
        HttpStatus.NOT_FOUND,
      );
    }

    // Определяем товары, которые участвовали в заказах
    const productsWithOrders = await this.prisma.orderItem.findMany({
      where: {
        productId: { in: Array.from(existingIds) },
      },
      select: { productId: true },
      distinct: ['productId'],
    });

    const productsWithOrdersSet = new Set(productsWithOrders.map((p) => p.productId));

    const deletableIds = Array.from(existingIds).filter(
      (id) => !productsWithOrdersSet.has(id),
    );
    const archivableIds = Array.from(productsWithOrdersSet);

    let totalDeleted = 0;
    let totalArchived = 0;

    // Сначала удаляем полностью те товары, которые не участвовали в заказах
    for (let i = 0; i < deletableIds.length; i += BATCH_SIZE) {
      const batch = deletableIds.slice(i, i + BATCH_SIZE);

      const result = await this.prisma.$transaction(async (tx) => {
        await tx.cartItem.deleteMany({
          where: {
            productId: { in: batch },
          },
        });

        await tx.productCharacteristic.deleteMany({
          where: {
            productId: { in: batch },
          },
        });

        const deleteResult = await tx.product.deleteMany({
          where: {
            productId: { in: batch },
          },
        });

        return deleteResult;
      });

      totalDeleted += result.count;
    }

    // Затем архивируем товары, которые уже были в заказах
    if (archivableIds.length > 0) {
      const result = await this.prisma.product.updateMany({
        where: {
          productId: { in: archivableIds },
        },
        data: {
          status: ProductStatus.ARCHIVE,
          isNew: false,
        },
      });
      totalArchived += result.count;
    }

    // Обновляем индексы в Elasticsearch
    for (let i = 0; i < deletableIds.length; i += BATCH_SIZE) {
      const batch = deletableIds.slice(i, i + BATCH_SIZE);
      try {
        await Promise.all(batch.map((id) => this.bulkIndexService.deleteProduct(id)));
      } catch (error) {
        this.logger.error(
          `Ошибка удаления продуктов из Elasticsearch (батч ${i / BATCH_SIZE + 1}): ${error.message}`,
          error.stack,
        );
      }
    }

    if (archivableIds.length > 0) {
      const ES_BATCH_SIZE = 1000;
      for (let i = 0; i < archivableIds.length; i += ES_BATCH_SIZE) {
        const batch = archivableIds.slice(i, i + ES_BATCH_SIZE);
        try {
          await this.bulkIndexService.indexProducts(batch);
        } catch (error) {
          this.logger.error(
            `Ошибка индексации архивных продуктов в Elasticsearch (батч ${
              i / ES_BATCH_SIZE + 1
            }): ${error.message}`,
            error.stack,
          );
        }
      }
    }

    return {
      message: `Удалено товаров: ${totalDeleted}, архивировано товаров: ${totalArchived}`,
      deletedCount: totalDeleted,
      archivedCount: totalArchived,
      deletedIds: deletableIds,
      archivedIds: archivableIds,
    };
  }

  async countProductsByFilters(filters: {
    categories?: string[];
    minPrice?: number;
    maxPrice?: number;
    status?: ProductStatus;
    isNew?: boolean;
    unit?: ProductUnit;
    categoryId?: number;
  }): Promise<number> {
    return this.searchService.countProductsByFilters({
      categories: filters.categories,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      status: filters.status,
      isNew: filters.isNew,
      unit: filters.unit,
      categoryId: filters.categoryId,
    });
  }

  async bulkUpdateProductsByFilters(
    filters: {
      categories?: string[];
      minPrice?: number;
      maxPrice?: number;
      status?: ProductStatus;
      isNew?: boolean;
      unit?: ProductUnit;
      categoryId?: number;
    },
    updateData: {
      status?: ProductStatus;
      isNew?: boolean;
      imageUrl?: string;
      categoryId?: number;
      unit?: ProductUnit;
    },
    confirmCount?: number,
  ) {
    if (!updateData.status && updateData.isNew === undefined && !updateData.imageUrl && updateData.categoryId === undefined && updateData.unit === undefined) {
      throw new HttpException('Необходимо указать хотя бы одно поле для обновления', HttpStatus.BAD_REQUEST);
    }

    const count = await this.searchService.countProductsByFilters({
      categories: filters.categories,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      status: filters.status,
      isNew: filters.isNew,
      unit: filters.unit,
      categoryId: filters.categoryId,
    });

    if (confirmCount !== undefined && confirmCount !== count) {
      throw new HttpException(
        `Количество товаров не совпадает. Ожидается: ${confirmCount}, найдено: ${count}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (count === 0) {
      return {
        message: 'Товары не найдены по указанным фильтрам',
        updatedCount: 0,
      };
    }

    const productIds = await this.searchService.findProductIdsByFilters({
      categories: filters.categories,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      status: filters.status,
      isNew: filters.isNew,
      unit: filters.unit,
      categoryId: filters.categoryId,
    });

    return this.bulkUpdateProducts(productIds, updateData);
  }

  async bulkDeleteProductsByFilters(
    filters: {
      categories?: string[];
      minPrice?: number;
      maxPrice?: number;
      status?: ProductStatus;
      isNew?: boolean;
      unit?: ProductUnit;
      categoryId?: number;
    },
    confirmCount?: number,
  ) {
    const count = await this.searchService.countProductsByFilters({
      categories: filters.categories,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      status: filters.status,
      isNew: filters.isNew,
      unit: filters.unit,
      categoryId: filters.categoryId,
    });

    if (confirmCount !== undefined && confirmCount !== count) {
      throw new HttpException(
        `Количество товаров не совпадает. Ожидается: ${confirmCount}, найдено: ${count}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (count === 0) {
      return {
        message: 'Товары не найдены по указанным фильтрам',
        deletedCount: 0,
      };
    }

    const productIds = await this.searchService.findProductIdsByFilters({
      categories: filters.categories,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      status: filters.status,
      isNew: filters.isNew,
      unit: filters.unit,
      categoryId: filters.categoryId,
    });

    return this.bulkDeleteProducts(productIds);
  }
}
