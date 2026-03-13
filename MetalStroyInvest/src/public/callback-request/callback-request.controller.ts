import {
  Controller,
  Post,
  Body,
  UploadedFile,
  UseInterceptors,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CallbackRequestService } from './callback-request.service';
import { CreateCallbackRequestDto } from './dto/create-callback-request.dto';

@Controller('public/callback-request')
export class CallbackRequestController {
  constructor(private readonly callbackRequestService: CallbackRequestService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  async createCallbackRequest(
    @Body() createDto: CreateCallbackRequestDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file) {
      const allowedMimeTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
        'application/msword',
      ];
      
      if (!allowedMimeTypes.includes(file.mimetype)) {
        throw new BadRequestException(
          'Недопустимый формат файла. Разрешены только файлы PDF и DOCX',
        );
      }

      // Проверка размера файла (максимум 10 мб)
      const maxSize = 10 * 1024 * 1024; // 10 мб в байтах
      if (file.size > maxSize) {
        throw new BadRequestException(
          'Размер файла превышает допустимый лимит (10 МБ)',
        );
      }
    }

    await this.callbackRequestService.sendCallbackRequest(
      createDto.name,
      createDto.phone,
      file,
    );

    return {
      message: 'Заявка успешно отправлена',
    };
  }
}

