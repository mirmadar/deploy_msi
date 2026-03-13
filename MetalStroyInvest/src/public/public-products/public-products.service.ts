import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { FormatUtil } from 'src/shared/common/utils/format.util';
import { ProductStatus } from '@prisma/client';

@Injectable()
export class PublicProductsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Получение товара по slug (для публичной части)
   * В публичной части используем только slug для SEO и читаемости URL
   */
  async getProductBySlug(slug: string) {
    const product = await this.prisma.product.findFirst({
      where: {
        slug,
        status: {
          not: ProductStatus.ARCHIVE,
        },
      },
      select: {
        productId: true,
        name: true,
        price: true,
        imageUrl: true,
        isNew: true,
        status: true,
        unit: true,
        slug: true,
        category: {
          select: {
            categoryId: true,
            name: true,
            slug: true,
          },
        },
        characteristics: {
          include: {
            characteristicName: {
              select: {
                name: true,
                valueType: true,
              },
            },
          },
        },
      },
    });

    if (!product) {
      throw new HttpException('Товар не найден', HttpStatus.NOT_FOUND);
    }

    return {
      productId: product.productId,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      isNew: product.isNew,
      status: product.status,
      unit: product.unit,
      slug: product.slug,
      category: FormatUtil.formatCategory(product.category),
      characteristics: FormatUtil.formatProductCharacteristics(product.characteristics),
    };
  }
}
