import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  BadRequestException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { memoryStorage } from 'multer';
import { extname } from 'path';
import { randomUUID } from 'crypto';
import { S3Service } from '../../shared/s3/s3.service';

@UseGuards(JwtAuthGuard)
@Controller('admin/upload')
export class UploadController {
  constructor(private readonly s3Service: S3Service) {}

  @Post('image')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: memoryStorage(),
      limits: {
        fileSize: 5 * 1024 * 1024, // 5 МБ максимум
      },
      fileFilter: (req, file, cb) => {
        // Разрешаем только изображения
        const allowedMimeTypes = [
          'image/jpeg',
          'image/jpg',
          'image/png',
          'image/gif',
          'image/webp',
          'image/svg+xml',
        ];

        if (allowedMimeTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException(
              'Недопустимый формат файла. Разрешены только изображения (JPEG, PNG, GIF, WebP, SVG)',
            ),
            false,
          );
        }
      },
    }),
  )
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Файл не был загружен');
    }

    const key = `images/${randomUUID()}${extname(file.originalname)}`;

    if (!file.buffer) {
      throw new BadRequestException('Не удалось прочитать содержимое файла');
    }

    const { url } = await this.s3Service.uploadObject(
      key,
      file.buffer,
      file.mimetype,
    );

    return {
      imageUrl: url,
      key,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
    };
  }

  @Post('document')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FileInterceptor('document', {
      storage: memoryStorage(),
      limits: {
        fileSize: 15 * 1024 * 1024, // 15 МБ максимум
      },
      fileFilter: (req, file, cb) => {
        const allowedMimeTypes = [
          'application/pdf',
          'application/msword', // .doc
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
          'application/vnd.ms-excel', // .xls
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
          'text/plain',
          'text/csv',
          'application/zip',
          'application/x-rar-compressed',
          'application/vnd.rar',
        ];

        if (allowedMimeTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException(
              'Недопустимый формат. Разрешены: PDF, DOC, DOCX, XLS, XLSX, TXT, CSV, ZIP, RAR',
            ),
            false,
          );
        }
      },
    }),
  )
  async uploadDocument(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Файл не был загружен');
    }

    const key = `documents/${randomUUID()}${extname(file.originalname)}`;

    if (!file.buffer) {
      throw new BadRequestException('Не удалось прочитать содержимое файла');
    }

    const { url } = await this.s3Service.uploadObject(
      key,
      file.buffer,
      file.mimetype,
    );

    return {
      fileUrl: url,
      key,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
    };
  }
}

