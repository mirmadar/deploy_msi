import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma/prisma.service';

@Injectable()
export class PublicServiceCategoriesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Корневые категории услуг для хедера / общей страницы услуг
   */
  async getRootCategories() {
    return this.prisma.serviceCategory.findMany({
      where: { parentId: null },
      select: {
        serviceCategoryId: true,
        name: true,
        slug: true,
        description: true,
        sortOrder: true,
      },
      orderBy: [
        { sortOrder: 'asc' },
        { name: 'asc' },
        { serviceCategoryId: 'asc' },
      ],
    });
  }

  /**
   * Категория услуг по slug (для страницы категории)
   */
  async getCategoryBySlug(slug: string) {
    const category = await this.prisma.serviceCategory.findUnique({
      where: { slug },
      select: {
        serviceCategoryId: true,
        name: true,
        slug: true,
        description: true,
        parentId: true,
        level: true,
        sortOrder: true,
      },
    });

    if (!category) {
      throw new HttpException('Категория услуг не найдена', HttpStatus.NOT_FOUND);
    }

    return category;
  }
}

