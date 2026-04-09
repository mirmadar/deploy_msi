import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { ProductUnit, ProductStatus } from '@prisma/client';
import type { SendMailOptions } from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';
import { Queue } from 'bullmq';
import { CartService } from 'src/public/cart/cart.service';
import { MailService } from 'src/shared/mail/mail.service';
import PDFDocument from 'pdfkit';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);
  private robotoFontPath: string | null = null;
  private readonly mailJobName = 'send-order-emails';
  private readonly bitrixJobName = 'send-bitrix-lead';

  constructor(
    private prisma: PrismaService,
    private cartService: CartService,
    private mailService: MailService,
    @InjectQueue('orders-processing') private ordersQueue: Queue,
  ) {
    // Пытаемся найти любой TTF-шрифт в папке fonts внутри проекта/контейнера.
    try {
      const fontsDir = path.join(process.cwd(), 'fonts');
      if (fs.existsSync(fontsDir)) {
        const files = fs.readdirSync(fontsDir);
        const ttfFile = files.find(
          (file) => file.toLowerCase().endsWith('.ttf'),
        );
        if (ttfFile) {
          this.robotoFontPath = path.join(fontsDir, ttfFile);
        }
      }
    } catch {
      // Если шрифт не найден или произошла ошибка — просто используем дефолтный шрифт pdfkit
    }
  }

  async createOrder(
    cartToken: string | undefined,
    createOrderDto: CreateOrderDto,
    file?: Express.Multer.File,
  ) {
    if (!cartToken) {
      throw new HttpException(
        'Корзина не найдена. Пожалуйста, добавьте товары в корзину.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const cart = await this.prisma.cart.findUnique({
      where: { token: cartToken },
      include: {
        items: {
          include: {
            product: {
              select: {
                productId: true,
                name: true,
                price: true,
                unit: true,
                status: true,
              },
            },
          },
        },
      },
    });

    if (!cart) {
      throw new HttpException('Корзина не найдена', HttpStatus.NOT_FOUND);
    }

    if (!cart.items || cart.items.length === 0) {
      throw new HttpException(
        'Корзина пуста. Пожалуйста, добавьте товары в корзину.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const validItems = cart.items.filter((item) => item.quantity > 0);
    if (validItems.length === 0) {
      throw new HttpException(
        'В корзине нет товаров с корректным количеством.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const unavailableItems = validItems.filter(
      (item) => item.product.status !== ProductStatus.IN_STOCK,
    );
    if (unavailableItems.length > 0) {
      const unavailableNames = unavailableItems
        .map((i) => i.product.name)
        .join(', ');
      throw new HttpException(
        `Товары "${unavailableNames}" недоступны для заказа`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const orderNumber = await this.generateOrderNumber();

    const order = await this.prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          clientName: createOrderDto.clientName.trim(),
          clientPhone: createOrderDto.clientPhone.trim(),
          clientEmail: createOrderDto.clientEmail.trim().toLowerCase(),
          items: {
            create: validItems.map((item) => ({
              productId: item.productId,
              productName: item.product.name,
              quantity: item.quantity,
              unitPrice: item.price,
              unit: item.product.unit,
            })),
          },
        },
        select: {
          orderId: true,
          orderNumber: true,
          clientName: true,
          clientPhone: true,
          clientEmail: true,
          createdAt: true,
          items: {
            select: {
              orderItemId: true,
              productId: true,
              productName: true,
              quantity: true,
              unitPrice: true,
              unit: true,
              product: {
                select: {
                  productId: true,
                  name: true,
                  imageUrl: true,
                  slug: true,
                  characteristics: {
                    select: {
                      value: true,
                      characteristicName: {
                        select: {
                          name: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      // Очистка корзины в той же транзакции
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });
      await tx.cart.update({
        where: { id: cart.id },
        data: { totalAmount: 0 },
      });

      return newOrder;
    });

    await this.enqueueOrderProcessing(order.orderNumber, file);

    return order;
  }

  private async enqueueOrderProcessing(
    orderNumber: string,
    file?: Express.Multer.File,
  ): Promise<void> {
    const serializedFile = file
      ? {
          originalname: file.originalname,
          mimetype: file.mimetype,
          encoding: file.encoding,
          size: file.size,
          bufferBase64: file.buffer.toString('base64'),
        }
      : undefined;

    const defaultJobOptions = {
      attempts: 5,
      backoff: { type: 'exponential' as const, delay: 5000 },
      removeOnComplete: 100,
      removeOnFail: 1000,
    };

    try {
      await this.ordersQueue.add(
        this.mailJobName,
        {
          orderNumber,
          file: serializedFile,
        },
        {
          ...defaultJobOptions,
          jobId: `emails-${orderNumber}`,
        },
      );

      await this.ordersQueue.add(
        this.bitrixJobName,
        { orderNumber },
        {
          ...defaultJobOptions,
          jobId: `bitrix-${orderNumber}`,
        },
      );
    } catch (error) {
      this.logger.error(
        `Не удалось добавить задачи в очередь для заказа ${orderNumber}, запускаем синхронный fallback: ${error.message}`,
        error.stack,
      );
      await Promise.allSettled([
        this.sendOrderEmails(orderNumber, file),
        this.sendBitrixLead(orderNumber),
      ]);
    }
  }

  async getOrderByNumber(orderNumber: string) {
    const order = await this.prisma.order.findUnique({
      where: { orderNumber },
      select: {
        orderId: true,
        orderNumber: true,
        clientName: true,
        clientPhone: true,
        clientEmail: true,
        createdAt: true,
        items: {
          select: {
            orderItemId: true,
            productId: true,
            productName: true,
            quantity: true,
            unitPrice: true,
            unit: true,
            product: {
              select: {
                productId: true,
                name: true,
                imageUrl: true,
                slug: true,
                characteristics: {
                  select: {
                    value: true,
                    characteristicName: {
                      select: {
                        name: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!order) {
      throw new HttpException('Заказ не найден', HttpStatus.NOT_FOUND);
    }

    return order;
  }

  private async generateOrderNumber(): Promise<string> {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const prefix = `${year}${month}`;
    const MAX_RETRIES = 5;
    const SEQUENCE_LEN = 6;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const orderNumber = await this.prisma.$transaction(async (tx) => {
          const lastOrder = await tx.order.findFirst({
            where: {
              orderNumber: {
                startsWith: prefix,
              },
            },
            orderBy: {
              orderNumber: 'desc',
            },
          });

          let sequenceNumber = 1;

          if (lastOrder) {
            const lastNumber = lastOrder.orderNumber.slice(prefix.length);
            const parsed = parseInt(lastNumber, 10);
            
            if (isNaN(parsed)) {
              this.logger.warn(
                `Не удалось распарсить номер заказа: ${lastOrder.orderNumber}, используем 1`,
              );
              sequenceNumber = 1;
            } else {
              sequenceNumber = parsed + 1;
            }
          }

          const formattedNumber = sequenceNumber
            .toString()
            .padStart(SEQUENCE_LEN, '0');
          return `${prefix}${formattedNumber}`;
        });

        return orderNumber;
      } catch (error) {
        if (
          error.code === 'P2002' &&
          error.meta?.target?.includes('orderNumber')
        ) {
          if (attempt === MAX_RETRIES - 1) {
            this.logger.error(
              `Не удалось сгенерировать уникальный номер заказа после ${MAX_RETRIES} попыток`,
            );
            throw new HttpException(
              'Не удалось создать заказ. Попробуйте еще раз.',
              HttpStatus.INTERNAL_SERVER_ERROR,
            );
          }
          await new Promise((resolve) => setTimeout(resolve, 50 * (attempt + 1)));
          continue;
        }
        throw error;
      }
    }

    throw new HttpException(
      'Не удалось создать заказ. Попробуйте еще раз.',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  private formatUnit(unit: ProductUnit): string {
    const unitMap: Record<ProductUnit, string> = {
      PG_M: 'Пг.м.',
      T: 'Т',
      KG: 'Кг',
      GR: 'Г',
      M: 'М',
      M2: 'М²',
      M3: 'М³',
      SHT: 'Шт',
      UP: 'Уп',
      SECTION: 'Секция',
      ROLL: 'Рулон',
      BUKHTA: 'Бухта',
    };
    return unitMap[unit] || unit;
  }

  async generateOrderPDF(orderNumber: string): Promise<Buffer> {
    const order = await this.getOrderByNumber(orderNumber);

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'A4',
        margins: {
          top: 50,
          bottom: 50,
          left: 50,
          right: 50,
        },
      });

      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      try {
        // Подключаем пользовательский шрифт, если он найден
        if (this.robotoFontPath && fs.existsSync(this.robotoFontPath)) {
          try {
            doc.registerFont('MainFont', this.robotoFontPath);
            doc.font('MainFont');
          } catch {
            // Если не удалось зарегистрировать шрифт — продолжаем с дефолтным
          }
        }

        doc.fontSize(14).text(`Заказ №${order.orderNumber}`, { align: 'center' });
        doc.moveDown(1);

        // Возвращаем основной шрифт (если был зарегистрирован)
        if (this.robotoFontPath) {
          try {
            doc.font('MainFont');
          } catch {
          }
        }

        // Информация о заказе
        doc.fontSize(14);
        
        // Имя клиента
        doc.text(`Имя: ${order.clientName}`, { align: 'left' });
        doc.moveDown(0.5);

        // Номер заказа
        doc.text(`Номер заказа: ${order.orderNumber}`, { align: 'left' });
        doc.moveDown(0.5);

        // Дата заказа (формат: ДД.ММ.ГГГГ)
        const orderDate = new Date(order.createdAt);
        const formattedDate = orderDate.toLocaleDateString('ru-RU', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        });
        doc.text(`Дата заказа: ${formattedDate}`, { align: 'left' });
        doc.moveDown(1);

        // Таблица товаров
        doc.text('Список товаров:', { align: 'left' });
        doc.moveDown(0.5);

        // Определение колонок таблицы
        const pageWidth = 550;
        const margin = 50;
        const col1Width = 200; // Наименование
        const col2Width = 200; // Характеристики
        const col3Width = 60; // Количество
        const col4Width = 40; // Ед. изм.

        const col1X = margin;
        const col2X = col1X + col1Width + 10;
        const col3X = col2X + col2Width + 10;
        const col4X = col3X + col3Width + 10;

        // Заголовки таблицы
        doc.fontSize(10);
        const headerY = doc.y;
        doc.text('Наименование', col1X, headerY, {
          width: col1Width,
          align: 'left',
        });
        doc.text('Характеристики', col2X, headerY, {
          width: col2Width,
          align: 'left',
        });
        doc.text('Количество', col3X, headerY, {
          width: col3Width,
          align: 'center',
        });
        doc.text('Ед. изм.', col4X, headerY, {
          width: col4Width,
          align: 'center',
        });
        // Возвращаем обычный шрифт для товаров
        if (this.robotoFontPath) {
          try {
            doc.font('MainFont');
          } catch {
          }
        }
        doc.fontSize(9);

        // Линия под заголовками
        doc.moveTo(margin, doc.y + 5).lineTo(margin + pageWidth, doc.y + 5).stroke();
        doc.moveDown(0.5);

        // Товары
        doc.fontSize(10);
        order.items.forEach((item, index) => {
          const rowStartY = doc.y;
          let maxHeight = 0;

          // Наименование товара
          const nameHeight = doc.heightOfString(item.productName, {
            width: col1Width,
            align: 'left',
          });
          doc.text(item.productName, col1X, rowStartY, {
            width: col1Width,
            align: 'left',
          });
          maxHeight = Math.max(maxHeight, nameHeight);

          // Характеристики - список
          let characteristicsText = '';
          if (item.product.characteristics && item.product.characteristics.length > 0) {
            characteristicsText = item.product.characteristics
              .map((char) => `${char.characteristicName.name}: ${char.value}`)
              .join('\n');
          } else {
            characteristicsText = '—';
          }

          const charHeight = doc.heightOfString(characteristicsText, {
            width: col2Width,
            align: 'left',
          });
          doc.text(characteristicsText, col2X, rowStartY, {
            width: col2Width,
            align: 'left',
          });
          maxHeight = Math.max(maxHeight, charHeight);

          // Количество
          const qtyText = item.quantity.toString();
          const qtyHeight = doc.heightOfString(qtyText, {
            width: col3Width,
            align: 'center',
          });
          doc.text(qtyText, col3X, rowStartY, {
            width: col3Width,
            align: 'center',
          });
          maxHeight = Math.max(maxHeight, qtyHeight);

          // Единица измерения
          const unitText = this.formatUnit(item.unit);
          const unitHeight = doc.heightOfString(unitText, {
            width: col4Width,
            align: 'center',
          });
          doc.text(unitText, col4X, rowStartY, {
            width: col4Width,
            align: 'center',
          });
          maxHeight = Math.max(maxHeight, unitHeight);

          doc.y = rowStartY + maxHeight + 5;

          // Разделительная линия после каждого товара
          doc.moveTo(margin, doc.y).lineTo(margin + pageWidth, doc.y).stroke();
          doc.moveDown(0.3);
        });

        doc.end();
      } catch (error) {
        doc.end();
        reject(error);
      }
    });
  }

  private getDownloadUrl(orderNumber: string): string {
    const baseUrl = process.env.APP_BASE_URL || 'http://localhost:3000';
    return `${baseUrl}/public/orders/${orderNumber}/download`;
  }

  private getBitrixWebhookBaseUrl(): string {
    const webhookUrl = process.env.BITRIX_WEBHOOK_URL?.trim();
    if (!webhookUrl) {
      throw new Error(
        'BITRIX_WEBHOOK_URL не задан. Проверьте переменные окружения.',
      );
    }

    return webhookUrl.replace(/\/+$/, '');
  }

  private getBitrixMethodUrl(method: string): string {
    const base = this.getBitrixWebhookBaseUrl();
    if (base.includes(`/${method}`)) {
      return base;
    }

    return `${base}/${method}.json`;
  }

  private getBitrixOrderNumberFieldCode(): string {
    return process.env.BITRIX_ORDER_NUMBER_FIELD_CODE || 'UF_CRM_ORDER_NUMBER';
  }

  private getBitrixLeadTitle(orderNumber: string): string {
    return `Новый заказ ${orderNumber}`;
  }

  private normalizePhoneForBitrix(rawPhone: string): string {
    const digits = rawPhone.replace(/\D/g, '');
    if (!digits) {
      return rawPhone.trim();
    }

    if (digits.length === 11 && digits.startsWith('8')) {
      return `+7${digits.slice(1)}`;
    }
    if (digits.length === 11 && digits.startsWith('7')) {
      return `+${digits}`;
    }
    if (digits.length === 10 && digits.startsWith('9')) {
      return `+7${digits}`;
    }

    return rawPhone.trim().startsWith('+') ? rawPhone.trim() : `+${digits}`;
  }

  private buildBitrixComments(order: {
    orderNumber: string;
    items: Array<{
      productName: string;
      quantity: number;
      unit: ProductUnit;
      product: {
        characteristics: Array<{
          value: string;
          characteristicName: {
            name: string;
          };
        }>;
      };
    }>;
  }): string {
    const lines = order.items.map((item, index) => {
      const characteristicsText =
        item.product.characteristics.length > 0
          ? item.product.characteristics
              .map((char) => `${char.characteristicName.name}: ${char.value}`)
              .join(', ')
          : '—';

      return `${index + 1}. ${item.productName} | Кол-во: ${item.quantity} ${this.formatUnit(item.unit)} | Характеристики: ${characteristicsText}`;
    });

    return [
      `Номер заказа: ${order.orderNumber}`,
      '',
      'Состав заказа:',
      ...lines,
      '',
      `Ссылка на файл заказа: ${this.getDownloadUrl(order.orderNumber)}`,
    ].join('\n');
  }

  private async findExistingBitrixLeadId(
    orderNumber: string,
  ): Promise<number | null> {
    const fieldCode = this.getBitrixOrderNumberFieldCode();
    const url = this.getBitrixMethodUrl('crm.lead.list');
    const parseLeadId = (result?: Array<{ ID?: string | number }>) => {
      const leadId = Number(result?.[0]?.ID);
      return Number.isFinite(leadId) ? leadId : null;
    };

    const request = async (filter: Record<string, unknown>) => {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filter,
          select: ['ID'],
          order: { ID: 'DESC' },
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Bitrix24 вернул HTTP ${response.status} при поиске лида.`,
        );
      }

      return (await response.json()) as {
        result?: Array<{ ID?: string | number }>;
        error?: string;
        error_description?: string;
      };
    };

    const byCustomField = await request({ [fieldCode]: orderNumber });
    if (!byCustomField.error) {
      return parseLeadId(byCustomField.result);
    }

    this.logger.warn(
      `Поиск дубля по полю ${fieldCode} недоступен в Bitrix (${byCustomField.error}). Используем fallback по TITLE.`,
    );

    const byTitle = await request({ TITLE: this.getBitrixLeadTitle(orderNumber) });
    if (byTitle.error) {
      throw new Error(
        `Bitrix24 ошибка поиска лида: ${byTitle.error_description || byTitle.error}`,
      );
    }

    return parseLeadId(byTitle.result);
  }

  private async markBitrixSent(
    orderNumber: string,
    bitrixLeadId: number,
  ): Promise<void> {
    await this.prisma.$executeRaw`
      UPDATE "orders"
      SET "bitrixSent" = true,
          "bitrixSentAt" = NOW(),
          "bitrixLeadId" = ${bitrixLeadId}
      WHERE "orderNumber" = ${orderNumber}
    `;
  }

  async sendBitrixLead(orderNumber: string): Promise<void> {
    const order = await this.getOrderByNumber(orderNumber);
    const existingLeadId = await this.findExistingBitrixLeadId(orderNumber);

    if (existingLeadId) {
      await this.markBitrixSent(orderNumber, existingLeadId);
      return;
    }

    const url = this.getBitrixMethodUrl('crm.lead.add');
    const fieldCode = this.getBitrixOrderNumberFieldCode();
    const normalizedPhone = this.normalizePhoneForBitrix(order.clientPhone);

    const fields: Record<string, unknown> = {
      TITLE: this.getBitrixLeadTitle(order.orderNumber),
      NAME: order.clientName,
      PHONE: [{ VALUE: normalizedPhone, VALUE_TYPE: 'WORK' }],
      EMAIL: [{ VALUE: order.clientEmail, VALUE_TYPE: 'WORK' }],
      COMMENTS: this.buildBitrixComments(order),
      [fieldCode]: order.orderNumber,
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fields,
        params: { REGISTER_SONET_EVENT: 'Y' },
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Bitrix24 вернул HTTP ${response.status} при создании лида.`,
      );
    }

    const payload = (await response.json()) as {
      result?: number;
      error?: string;
      error_description?: string;
    };

    if (payload.error) {
      throw new Error(
        `Bitrix24 ошибка создания лида: ${payload.error_description || payload.error}`,
      );
    }

    if (!payload.result) {
      throw new Error('Bitrix24 не вернул ID лида после создания.');
    }

    await this.markBitrixSent(orderNumber, payload.result);
  }

  async sendClientEmail(orderNumber: string): Promise<void> {
    const order = await this.getOrderByNumber(orderNumber);
    const downloadUrl = this.getDownloadUrl(orderNumber);

    let pdfBuffer: Buffer | null = null;
    try {
      pdfBuffer = await this.generateOrderPDF(orderNumber);
    } catch (error) {
      this.logger.error(`Ошибка генерации PDF для заказа ${orderNumber}: ${error.message}`, error.stack);
    }

    const mailOptions: SendMailOptions = {
      from: `"MetalStroy Invest" <${process.env.SMTP_USER}>`,
      to: order.clientEmail,
      replyTo: process.env.SMTP_USER,
      subject: `Заказ ${order.orderNumber} оформлен`,
      text: `
Заказ успешно оформлен

Номер заказа: ${order.orderNumber}
Имя клиента: ${order.clientName}
Ссылка на скачивание документа: ${downloadUrl}

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
          <h2>Заказ успешно оформлен</h2>
          <p><strong>Номер заказа:</strong> ${order.orderNumber}</p>
          <p><strong>Имя клиента:</strong> ${order.clientName}</p>
          <p><strong>Ссылка на скачивание документа:</strong> <a href="${downloadUrl}">${downloadUrl}</a></p>
          <p><small>Это автоматическое письмо от системы MetalStroy Invest.</small></p>
        </body>
        </html>
      `,
      ...(pdfBuffer
        ? {
            attachments: [
              {
                filename: `order-${order.orderNumber}.pdf`,
                content: pdfBuffer,
                contentType: 'application/pdf',
              },
            ],
          }
        : {}),
    };

    try {
      await this.mailService.sendMail(mailOptions);

      await this.prisma.order.update({
        where: { orderNumber },
        data: {
          clientEmailSent: true,
          clientEmailSentAt: new Date(),
        },
      });
    } catch (error) {
      this.logger.error(
        `Ошибка отправки email клиенту для заказа ${orderNumber}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async sendCompanyEmail(
    orderNumber: string,
    file?: Express.Multer.File,
  ): Promise<void> {
    const order = await this.getOrderByNumber(orderNumber);
    const companyEmail = process.env.COMPANY_EMAIL || process.env.SMTP_USER;
    const downloadUrl = this.getDownloadUrl(orderNumber);

    if (!companyEmail) {
      return;
    }

    let pdfBuffer: Buffer | null = null;
    try {
      pdfBuffer = await this.generateOrderPDF(orderNumber);
    } catch (error) {
      this.logger.error(`Ошибка генерации PDF для заказа ${orderNumber}: ${error.message}`, error.stack);
    }

    const attachments: NonNullable<SendMailOptions['attachments']> = [];

    if (pdfBuffer) {
      attachments.push({
        filename: `order-${order.orderNumber}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf',
      });
    }

    if (file) {
      let correctFilename = file.originalname;
      if (/Ð/.test(file.originalname)) {
        try {
          const buffer = Buffer.from(file.originalname, 'latin1');
          correctFilename = buffer.toString('utf-8');
        } catch {
        }
      }

      const encodedFilename = encodeURIComponent(correctFilename);
      const hasNonAscii = !/^[\x00-\x7F]*$/.test(correctFilename);

      attachments.push({
        filename: correctFilename,
        content: file.buffer,
        contentType: file.mimetype,
        headers: hasNonAscii
          ? {
              'Content-Disposition': `attachment; filename="${correctFilename.replace(
                /"/g,
                '\\"',
              )}"; filename*=UTF-8''${encodedFilename}`,
            }
          : undefined,
      } as any);
    }

    const mailOptions: SendMailOptions = {
      from: `"MetalStroy Invest" <${process.env.SMTP_USER}>`,
      to: companyEmail,
      replyTo: process.env.SMTP_USER,
      subject: `Заказ ${order.orderNumber} оформлен`,
      text: `
Заказ успешно оформлен

Номер заказа: ${order.orderNumber}
Имя клиента: ${order.clientName}
Телефон клиента: ${order.clientPhone}
Ссылка на скачивание документа: ${downloadUrl}

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
          <h2>Заказ успешно оформлен</h2>
          <p><strong>Номер заказа:</strong> ${order.orderNumber}</p>
          <p><strong>Имя клиента:</strong> ${order.clientName}</p>
          <p><strong>Телефон клиента:</strong> ${order.clientPhone}</p>
          <p><strong>Ссылка на скачивание документа:</strong> <a href="${downloadUrl}">${downloadUrl}</a></p>
          <p><small>Это автоматическое письмо от системы MetalStroy Invest.</small></p>
        </body>
        </html>
      `,
      ...(attachments.length ? { attachments } : {}),
    };

    try {
      await this.mailService.sendMail(mailOptions);

      await this.prisma.order.update({
        where: { orderNumber },
        data: {
          companyEmailSent: true,
          companyEmailSentAt: new Date(),
        },
      });
    } catch (error) {
      this.logger.error(
        `Ошибка отправки email компании для заказа ${orderNumber}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async sendOrderEmails(
    orderNumber: string,
    file?: Express.Multer.File,
  ): Promise<void> {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      this.logger.error(
        `Нельзя отправить email для заказа ${orderNumber}: SMTP настройки не найдены.`,
      );
      return;
    }

    try {
      await Promise.allSettled([
        this.sendClientEmail(orderNumber),
        this.sendCompanyEmail(orderNumber, file),
      ]);
    } catch (error) {
      this.logger.error(`Ошибка отправки email для заказа ${orderNumber}: ${error.message}`, error.stack);
      throw error;
    }
  }
}

