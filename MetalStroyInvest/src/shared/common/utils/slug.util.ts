import { PrismaService } from 'src/shared/prisma/prisma.service';

//Утилита для генерации slug из текста
export class SlugUtil {
  private static readonly transliterationMap: { [key: string]: string } = {
    а: 'a',
    б: 'b',
    в: 'v',
    г: 'g',
    д: 'd',
    е: 'e',
    ё: 'e',
    ж: 'zh',
    з: 'z',
    и: 'i',
    й: 'y',
    к: 'k',
    л: 'l',
    м: 'm',
    н: 'n',
    о: 'o',
    п: 'p',
    р: 'r',
    с: 's',
    т: 't',
    у: 'u',
    ф: 'f',
    х: 'h',
    ц: 'ts',
    ч: 'ch',
    ш: 'sh',
    щ: 'sch',
    ъ: '',
    ы: 'y',
    ь: '',
    э: 'e',
    ю: 'yu',
    я: 'ya',
    А: 'a',
    Б: 'b',
    В: 'v',
    Г: 'g',
    Д: 'd',
    Е: 'e',
    Ё: 'e',
    Ж: 'zh',
    З: 'z',
    И: 'i',
    Й: 'y',
    К: 'k',
    Л: 'l',
    М: 'm',
    Н: 'n',
    О: 'o',
    П: 'p',
    Р: 'r',
    С: 's',
    Т: 't',
    У: 'u',
    Ф: 'f',
    Х: 'h',
    Ц: 'ts',
    Ч: 'ch',
    Ш: 'sh',
    Щ: 'sch',
    Ъ: '',
    Ы: 'y',
    Ь: '',
    Э: 'e',
    Ю: 'yu',
    Я: 'ya',
  };

  static generateSlug(text: string): string {
    let slug = text
      .toLowerCase()
      .split('')
      .map((char) => this.transliterationMap[char] || char)
      .join('')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    return slug;
  }

  static async generateUniqueProductSlug(
    prisma: PrismaService,
    baseSlug: string,
    excludeProductId?: number,
  ): Promise<string> {
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const existing = await prisma.product.findFirst({
        where: { slug },
        select: { productId: true },
      });

      if (!existing || (excludeProductId && existing.productId === excludeProductId)) {
        return slug;
      }

      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  }

  static async generateUniqueArticleSlug(
    prisma: PrismaService,
    baseSlug: string,
    excludeArticleId?: number,
  ): Promise<string> {
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const existing = await prisma.article.findUnique({
        where: { slug },
        select: { articleId: true },
      });

      if (!existing || (excludeArticleId && existing.articleId === excludeArticleId)) {
        return slug;
      }

      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  }

  static async generateUniqueCategorySlug(
    prisma: PrismaService,
    baseSlug: string,
    excludeCategoryId?: number,
  ): Promise<string> {
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const existing = await prisma.category.findFirst({
        where: { slug },
        select: { categoryId: true },
      });

      if (!existing || (excludeCategoryId && existing.categoryId === excludeCategoryId)) {
        return slug;
      }

      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  }

  static async generateUniqueServiceCategorySlug(
    prisma: PrismaService,
    baseSlug: string,
    excludeServiceCategoryId?: number,
  ): Promise<string> {
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const existing = await prisma.serviceCategory.findFirst({
        where: { slug },
        select: { serviceCategoryId: true },
      });

      if (!existing || (excludeServiceCategoryId && existing.serviceCategoryId === excludeServiceCategoryId)) {
        return slug;
      }

      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  }

  static async generateUniqueServiceSlug(
    prisma: PrismaService,
    baseSlug: string,
    excludeServiceId?: number,
  ): Promise<string> {
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const existing = await prisma.service.findFirst({
        where: { slug },
        select: { serviceId: true },
      });

      if (!existing || (excludeServiceId && existing.serviceId === excludeServiceId)) {
        return slug;
      }

      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  }
}
