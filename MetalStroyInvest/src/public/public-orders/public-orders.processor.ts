import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { OrdersService } from './public-orders.service';

type SerializedUpload = {
  originalname: string;
  mimetype: string;
  encoding?: string;
  size?: number;
  bufferBase64: string;
};

type MailJobPayload = {
  orderNumber: string;
  file?: SerializedUpload;
};

type BitrixJobPayload = {
  orderNumber: string;
};

@Processor('orders-processing')
export class PublicOrdersProcessor extends WorkerHost {
  private readonly logger = new Logger(PublicOrdersProcessor.name);

  constructor(private readonly ordersService: OrdersService) {
    super();
  }

  async process(job: Job<MailJobPayload | BitrixJobPayload>): Promise<void> {
    if (job.name === 'send-order-emails') {
      const payload = job.data as MailJobPayload;
      await this.ordersService.sendOrderEmails(
        payload.orderNumber,
        payload.file ? this.deserializeFile(payload.file) : undefined,
      );
      return;
    }

    if (job.name === 'send-bitrix-lead') {
      const payload = job.data as BitrixJobPayload;
      await this.ordersService.sendBitrixLead(payload.orderNumber);
      return;
    }

    this.logger.warn(`Получено неизвестное имя job: ${job.name}`);
  }

  private deserializeFile(file: SerializedUpload): Express.Multer.File {
    const buffer = Buffer.from(file.bufferBase64, 'base64');
    return {
      fieldname: 'file',
      originalname: file.originalname,
      encoding: file.encoding || '7bit',
      mimetype: file.mimetype,
      size: file.size ?? buffer.length,
      destination: '',
      filename: file.originalname,
      path: '',
      buffer,
      stream: null as any,
    };
  }
}
