import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { parsePagination } from 'src/shared/common/utils/query-parser.util';
import { paginateQuery, PaginatedResult } from 'src/shared/common/utils/pagination.util';
import { Prisma, ProductStatus } from '@prisma/client';
import { FormatUtil } from 'src/shared/common/utils/format.util';

@Injectable()
export class CatalogService {
  constructor(private prisma: PrismaService) {}

  // фильтрация товаров через Prisma
  async getCategoryProducts(
    slug: string,
    page: string = '1',
    pageSize: string = '20',
    minPrice?: string,
    maxPrice?: string,
    characteristics?: Record<string, string[]>,
  ) {
    const category = await this.prisma.category.findFirst({
      where: { slug },
      select: { categoryId: true, name: true, slug: true },
    });

    if (!category) {
      throw new HttpException('Категория не найдена', HttpStatus.NOT_FOUND);
    }

    const { page: pageNumber, pageSize: pageSizeNumber } = parsePagination(page, pageSize);
    const minPriceNum = minPrice ? parseFloat(minPrice) : undefined;
    const maxPriceNum = maxPrice ? parseFloat(maxPrice) : undefined;

    if (minPriceNum !== undefined && !isNaN(minPriceNum) && minPriceNum < 0) {
      throw new HttpException(
        'Минимальная цена не может быть отрицательной',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (maxPriceNum !== undefined && !isNaN(maxPriceNum) && maxPriceNum < 0) {
      throw new HttpException(
        'Максимальная цена не может быть отрицательной',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (
      minPriceNum !== undefined &&
      !isNaN(minPriceNum) &&
      maxPriceNum !== undefined &&
      !isNaN(maxPriceNum) &&
      minPriceNum > maxPriceNum
    ) {
      throw new HttpException(
        'Минимальная цена не может быть больше максимальной',
        HttpStatus.BAD_REQUEST,
      );
    }

    const where: Prisma.ProductWhereInput = {
      categoryId: category.categoryId,
      // В публичном каталоге показываем все товары, кроме архивных
      status: {
        not: ProductStatus.ARCHIVE,
      },
    };

    if (
      (minPriceNum !== undefined && !isNaN(minPriceNum)) ||
      (maxPriceNum !== undefined && !isNaN(maxPriceNum))
    ) {
      where.price = {};
      if (minPriceNum !== undefined && !isNaN(minPriceNum)) {
        where.price.gte = minPriceNum;
      }
      if (maxPriceNum !== undefined && !isNaN(maxPriceNum)) {
        where.price.lte = maxPriceNum;
      }
    }

    if (characteristics && Object.keys(characteristics).length > 0) {
      const characteristicNames = Object.keys(characteristics);
      const characteristicEntities = await this.prisma.characteristicName.findMany({
        where: { name: { in: characteristicNames } },
        select: { characteristicNameId: true, name: true },
      });

      const characteristicMap = new Map(
        characteristicEntities.map((c) => [c.name, c.characteristicNameId]),
      );

      const characteristicFilters: Prisma.ProductWhereInput[] = [];

      for (const [characteristicName, values] of Object.entries(characteristics)) {
        if (values.length === 0) continue;

        const characteristicId = characteristicMap.get(characteristicName);
        if (!characteristicId) {
          continue;
        }

        characteristicFilters.push({
          characteristics: {
            some: {
              characteristicNameId: characteristicId,
              value: {
                in: values,
              },
            },
          },
        });
      }

      if (characteristicFilters.length > 0) {
        where.AND = characteristicFilters;
      }
    }

    const select = {
      productId: true,
      name: true,
      price: true,
      isNew: true,
      status: true,
      imageUrl: true,
      unit: true,
      slug: true,
    } as const;

    type ProductSelect = typeof select;
    type Product = Prisma.ProductGetPayload<{
      select: ProductSelect;
    }>;

    const result = await paginateQuery({
      findMany: (args) => this.prisma.product.findMany(args as Prisma.ProductFindManyArgs),
      count: (args) => this.prisma.product.count(args as Prisma.ProductCountArgs | undefined),
      where,
      orderBy: { productId: 'desc' },
      select,
      pagination: { page: pageNumber, pageSize: pageSizeNumber },
    }) as unknown as PaginatedResult<Product>;

    return {
      ...result,
      data: result.data.map((p) => ({
        productId: p.productId,
        name: p.name,
        price: p.price,
        isNew: p.isNew,
        status: p.status,
        imageUrl: p.imageUrl,
        unit: p.unit,
        slug: p.slug,
        category: FormatUtil.formatCategory(category),
      })),
    };
  }
}
