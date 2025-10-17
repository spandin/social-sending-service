import {
  Controller,
  Post,
  UploadedFiles,
  Body,
  UseInterceptors,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiResponse } from '@nestjs/swagger';

import { TelegramService } from './telegram.service';

import { SendMediaDto } from './dto/send-media.dto';

@ApiTags('Telegram')
@Controller('telegram')
export class TelegramController {
  constructor(private readonly telegramService: TelegramService) {}

  @Post('send')
  @ApiOperation({ summary: 'Отправка медиагруппы и текста в Telegram' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Файлы и текст для отправки',
    type: SendMediaDto,
  })
  @ApiResponse({ status: 200, description: 'Успешная отправка' })
  @ApiResponse({ status: 400, description: 'Файлы и текст не предоставлены' })
  @UseInterceptors(FileFieldsInterceptor([{ name: 'files', maxCount: 10 }]))
  async sendToTelegram(
    @UploadedFiles() files: { files?: Express.Multer.File[] },
    @Body('text') text: string,
  ) {
    const hasFiles = files?.files && files.files.length > 0;
    const hasText = text && text.trim().length > 0;

    if (!hasFiles && !hasText) {
      throw new HttpException(
        'Необходимо отправить хотя бы один файл или текстовое сообщение',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.telegramService.sendMediaGroupAndText(files.files, text);
    return { status: 'ok' };
  }
}
