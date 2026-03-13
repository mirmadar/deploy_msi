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
        'application/msword',
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


