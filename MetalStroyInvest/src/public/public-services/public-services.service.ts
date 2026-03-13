import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import type { SendMailOptions } from 'nodemailer';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { MailService } from 'src/shared/mail/mail.service';

@Injectable()
export class PublicServicesService {
  private readonly logger = new Logger(PublicServicesService.name);

  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  /**
   * Обзорная страница услуг:
   * корневые категории + несколько услуг (карточки) для каждой
   */
  async getServicesOverview(limitPerCategory = 3) {
    const roots = await this.prisma.serviceCategory.findMany({
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

    if (roots.length === 0) {
      return [];
    }

    const rootIds = roots.map((c) => c.serviceCategoryId);

    // Находим подкатегории (leaf) для корневых категорий
    const childCategories = await this.prisma.serviceCategory.findMany({
      where: { parentId: { in: rootIds } },
      select: {
        serviceCategoryId: true,
        name: true,
        slug: true,
        parentId: true,
      },
    });

    const childrenByRoot = new Map<number, number[]>();
    for (const child of childCategories) {
      const parentId = child.parentId!;
      const list = childrenByRoot.get(parentId) ?? [];
      list.push(child.serviceCategoryId);
      childrenByRoot.set(parentId, list);
    }

    const result: Array<
      (typeof roots)[number] & {
        services: {
          serviceId: number;
          name: string;
          slug: string;
          serviceCategoryId: number;
        }[];
      }
    > = [];

    for (const root of roots) {
      const childIds = childrenByRoot.get(root.serviceCategoryId) ?? [];
      if (childIds.length === 0) {
        result.push({ ...root, services: [] });
        continue;
      }

      const services = await this.prisma.service.findMany({
        where: { serviceCategoryId: { in: childIds } },
        select: {
          serviceId: true,
          name: true,
          slug: true,
          serviceCategoryId: true,
        },
        orderBy: [
          { sortOrder: 'asc' },
          { name: 'asc' },
          { serviceId: 'asc' },
        ],
        take: limitPerCategory,
      });

      result.push({
        ...root,
        services,
      });
    }

    return result;
  }

  /**
   * Полный список услуг в конкретной категории (по slug категории)
   * Ожидаем, что услуги привязаны к подкатегории (leaf).
   */
  async getServicesByCategorySlug(categorySlug: string) {
    const category = await this.prisma.serviceCategory.findUnique({
      where: { slug: categorySlug },
      select: {
        serviceCategoryId: true,
        name: true,
        slug: true,
        description: true,
        parentId: true,
        level: true,
      },
    });

    if (!category) {
      throw new HttpException('Категория услуг не найдена', HttpStatus.NOT_FOUND);
    }

    const services = await this.prisma.service.findMany({
      where: { serviceCategoryId: category.serviceCategoryId },
      select: {
        serviceId: true,
        name: true,
        slug: true,
        sortOrder: true,
      },
      orderBy: [
        { sortOrder: 'asc' },
        { name: 'asc' },
        { serviceId: 'asc' },
      ],
    });

    return {
      category,
      services,
    };
  }

  /**
   * Страница конкретной услуги по slug
   */
  async getServiceBySlug(slug: string) {
    const service = await this.prisma.service.findUnique({
      where: { slug },
      select: {
        serviceId: true,
        name: true,
        slug: true,
        serviceCategoryId: true,
        category: {
          select: {
            serviceCategoryId: true,
            name: true,
            slug: true,
            description: true,
            parentId: true,
            level: true,
            sortOrder: true,
          },
        },
        blocks: {
          select: {
            serviceBlockId: true,
            type: true,
            payload: true,
            sortOrder: true,
          },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!service) {
      throw new HttpException('Услуга не найдена', HttpStatus.NOT_FOUND);
    }

    return service;
  }

  /**
   * Заявка на услугу (форма "Заказать услугу")
   */
  async sendServiceOrder(slug: string, name: string, phone: string): Promise<void> {
    const service = await this.prisma.service.findUnique({
      where: { slug },
      select: {
        serviceId: true,
        name: true,
        slug: true,
      },
    });

    if (!service) {
      throw new HttpException('Услуга не найдена', HttpStatus.NOT_FOUND);
    }

    const recipientEmail =
      process.env.SERVICE_ORDER_RECIPIENT_EMAIL ||
      process.env.CALLBACK_RECIPIENT_EMAIL ||
      process.env.SMTP_USER;

    if (!recipientEmail) {
      throw new HttpException(
        'Email получателя не настроен. Установите SERVICE_ORDER_RECIPIENT_EMAIL или CALLBACK_RECIPIENT_EMAIL в .env',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const dateTime = new Date().toLocaleString('ru-RU', {
      timeZone: 'Europe/Moscow',
      dateStyle: 'full',
      timeStyle: 'long',
    });

    const mailOptions: SendMailOptions = {
      from: `"MetalStroy Invest" <${process.env.SMTP_USER}>`,
      to: recipientEmail,
      subject: `Новая заявка на услугу "${service.name}" от ${name}`,
      text: `
Новая заявка на услугу

Услуга: ${service.name}

Имя: ${name}
Телефон: ${phone}
Дата: ${dateTime}

---
Это автоматическое письмо от системы MetalStroy Invest.
      `.trim(),
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
        </head>
        <body>
          <h2>Новая заявка на услугу</h2>
          <p><strong>Услуга:</strong> ${service.name}</p>
          <p><strong>Имя:</strong> ${name}</p>
          <p><strong>Телефон:</strong> <a href="tel:${phone}">${phone}</a></p>
          <p><strong>Дата:</strong> ${dateTime}</p>
          <p><small>Это автоматическое письмо от системы MetalStroy Invest.</small></p>
        </body>
        </html>
      `,
    };

    try {
      await this.mailService.sendMail(mailOptions);
      this.logger.log(
        `Заявка на услугу успешно отправлена. Услуга: ${service.name}, Имя: ${name}, Телефон: ${phone}`,
      );
    } catch (error: any) {
      this.logger.error(
        `Ошибка отправки заявки на услугу: ${error.message}`,
        error.stack,
      );
      throw new HttpException(
        'Ошибка отправки заявки. Попробуйте позже.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

