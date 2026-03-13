import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

/** Общий сервис отправки почты. Конфиг SMTP в одном месте, логика писем остаётся в сервисах (orders, callback, services). */
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  /**
   * Отправить письмо. Опции (to, subject, text, html, attachments) формирует вызывающий сервис — логика не меняется.
   */
  async sendMail(options: nodemailer.SendMailOptions): Promise<void> {
    await this.transporter.sendMail(options);
  }
}
