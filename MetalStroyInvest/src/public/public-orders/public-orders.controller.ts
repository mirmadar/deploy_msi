import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Req,
  Res,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request, Response } from 'express';
import { OrdersService } from './public-orders.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Controller('public/orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  private isPdf(buffer: Buffer): boolean {
    return (
      buffer.length >= 5 &&
      buffer[0] === 0x25 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x44 &&
      buffer[3] === 0x46 &&
      buffer[4] === 0x2d
    );
  }

  private isDocx(buffer: Buffer): boolean {
    // DOCX — это ZIP контейнер с сигнатурой PK..
    return (
      buffer.length >= 4 &&
      buffer[0] === 0x50 &&
      buffer[1] === 0x4b &&
      (buffer[2] === 0x03 || buffer[2] === 0x05 || buffer[2] === 0x07) &&
      (buffer[3] === 0x04 || buffer[3] === 0x06 || buffer[3] === 0x08)
    );
  }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async createOrder(
    @Body() createOrderDto: CreateOrderDto,
    @UploadedFile() file: Express.Multer.File | undefined,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    if (file) {
      const allowedMimeTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ];

      if (!allowedMimeTypes.includes(file.mimetype)) {
        throw new BadRequestException(
          'Недопустимый формат файла. Разрешены только файлы PDF и DOCX',
        );
      }

      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        throw new BadRequestException(
          'Размер файла превышает допустимый лимит (10 МБ)',
        );
      }

      const original = file.originalname.toLowerCase();
      const hasPdfExt = original.endsWith('.pdf');
      const hasDocxExt = original.endsWith('.docx');

      if (!hasPdfExt && !hasDocxExt) {
        throw new BadRequestException(
          'Недопустимое расширение файла. Разрешены только .pdf и .docx',
        );
      }

      const bySignature = hasPdfExt
        ? this.isPdf(file.buffer)
        : this.isDocx(file.buffer);
      if (!bySignature) {
        throw new BadRequestException(
          'Файл не прошел проверку сигнатуры. Загрузите корректный PDF или DOCX.',
        );
      }
    }

    const cartToken = req.cookies?.cartToken;
    const order = await this.ordersService.createOrder(
      cartToken,
      createOrderDto,
      file,
    );

    return res.json({
      success: true,
      order: {
        orderNumber: order.orderNumber,
        clientName: order.clientName,
        createdAt: order.createdAt,
      },
    });
  }

  @Get(':orderNumber/download')
  async downloadOrderPDF(
    @Param('orderNumber') orderNumber: string,
    @Res() res: Response,
  ) {
    const pdfBuffer = await this.ordersService.generateOrderPDF(orderNumber);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="order-${orderNumber}.pdf"`,
    );
    res.setHeader('Content-Length', pdfBuffer.length.toString());

    return res.send(pdfBuffer);
  }
}


