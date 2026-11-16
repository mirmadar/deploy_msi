import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import type { SendMailOptions } from 'nodemailer';
import { MailService } from 'src/shared/mail/mail.service';

@Injectable()
export class CallbackRequestService {
  private readonly logger = new Logger(CallbackRequestService.name);

  constructor(private mailService: MailService) {}

  async sendCallbackRequest(
    name: string,
    phone: string,
    file?: Express.Multer.File,
  ): Promise<void> {
    const recipientEmail = process.env.CALLBACK_RECIPIENT_EMAIL || process.env.SMTP_USER;
    
    if (!recipientEmail) {
      throw new HttpException(
        'Email получателя не настроен. Установите CALLBACK_RECIPIENT_EMAIL в .env',
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
      replyTo: process.env.SMTP_USER,
      subject: `Новая заявка с сайта от ${name}`,
      text: `
Новая заявка с сайта

Имя: ${name}
Телефон: ${phone}
Дата: ${dateTime}
${file ? `Вложение: ${file.originalname}` : ''}

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
          <h2>Новая заявка с сайта</h2>
          <p><strong>Имя:</strong> ${name}</p>
          <p><strong>Телефон:</strong> <a href="tel:${phone}">${phone}</a></p>
          <p><strong>Дата:</strong> ${dateTime}</p>
          <p><small>Это автоматическое письмо от системы MetalStroy Invest.</small></p>
        </body>
        </html>
      `,
    };

    // Добавляем вложение, если файл передан
    if (file) {
      // Исправляем кодировку имени файла, если она была неправильно декодирована Multer
      let correctFilename = file.originalname;
      if (/Ð/.test(file.originalname)) {
        try {
          const buffer = Buffer.from(file.originalname, 'latin1');
          correctFilename = buffer.toString('utf-8');
        } catch {
          // Используем оригинальное имя, если не удалось исправить
        }
      }
      
      const encodedFilename = encodeURIComponent(correctFilename);
      const hasNonAscii = !/^[\x00-\x7F]*$/.test(correctFilename);
      
      mailOptions.attachments = [
        {
          filename: correctFilename,
          content: file.buffer,
          contentType: file.mimetype,
          headers: hasNonAscii
            ? {
                'Content-Disposition': `attachment; filename="${correctFilename.replace(/"/g, '\\"')}"; filename*=UTF-8''${encodedFilename}`,
              }
            : undefined,
        } as any,
      ];
    }

    try {
      await this.mailService.sendMail(mailOptions);
      this.logger.log(`Заявка с сайта успешно отправлена на почту. Имя: ${name}, Телефон: ${phone}`);
    } catch (error) {
      this.logger.error(`Ошибка отправки заявки на почту: ${error.message}`, error.stack);
      throw new HttpException(
        'Ошибка отправки заявки. Попробуйте позже.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    try {
      await this.sendBitrixLead(name, phone, file?.originalname);
    } catch (error) {
      this.logger.error(
        `Заявка ушла на почту, но не отправилась в Bitrix: ${error.message}`,
        error.stack,
      );
    }
  }

  private getBitrixWebhookBaseUrl(): string | null {
    const webhookUrl = process.env.BITRIX_WEBHOOK_URL?.trim();
    if (!webhookUrl) {
      return null;
    }

    return webhookUrl.replace(/\/+$/, '');
  }

  private getBitrixMethodUrl(method: string): string | null {
    const base = this.getBitrixWebhookBaseUrl();
    if (!base) {
      return null;
    }

    if (base.includes(`/${method}`)) {
      return base;
    }

    return `${base}/${method}.json`;
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

  private async sendBitrixLead(
    name: string,
    phone: string,
    fileName?: string,
  ): Promise<void> {
    const url = this.getBitrixMethodUrl('crm.lead.add');
    if (!url) {
      this.logger.warn(
        'BITRIX_WEBHOOK_URL не задан — заявка с сайта в Bitrix не отправлена.',
      );
      return;
    }

    const dateTime = new Date().toLocaleString('ru-RU', {
      timeZone: 'Europe/Moscow',
      dateStyle: 'short',
      timeStyle: 'short',
    });

    const comments = [
      'Источник: заявка с сайта',
      `Дата: ${dateTime}`,
      fileName
        ? `К заявке приложен файл (отправлен на почту): ${fileName}`
        : 'Файл не приложен',
    ].join('\n');

    const fields: Record<string, unknown> = {
      TITLE: `Заявка с сайта: ${name}`,
      NAME: name.trim(),
      PHONE: [{ VALUE: this.normalizePhoneForBitrix(phone), VALUE_TYPE: 'WORK' }],
      COMMENTS: comments,
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
      throw new Error(`Bitrix24 вернул HTTP ${response.status} при создании лида.`);
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

    this.logger.log(
      `Заявка с сайта отправлена в Bitrix. Lead ID: ${payload.result}, имя: ${name}`,
    );
  }
}
