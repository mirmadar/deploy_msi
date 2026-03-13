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
      subject: `Новая заявка на звонок от ${name}`,
      text: `
Новая заявка на звонок

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
          <h2>Новая заявка на звонок</h2>
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
      this.logger.log(`Заявка на звонок успешно отправлена. Имя: ${name}, Телефон: ${phone}`);
    } catch (error) {
      this.logger.error(`Ошибка отправки заявки на звонок: ${error.message}`, error.stack);
      throw new HttpException(
        'Ошибка отправки заявки. Попробуйте позже.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
