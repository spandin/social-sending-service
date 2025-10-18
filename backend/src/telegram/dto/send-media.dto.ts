import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class SendMediaDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    isArray: true,
    required: false,
    description: 'Медиафайлы (фото, видео, документы)',
  })
  @IsOptional()
  files?: any[];

  @ApiProperty({
    type: 'string',
    required: false,
    description: 'Текстовое сообщение',
    example: `<b>📢 Добро пожаловать в обновлённую систему уведомлений!</b><br><i>Этот текст создан для проверки длинных HTML-сообщений в Telegram через Telegram Bot API и Telegraf.</i><br>🔹 В этом сообщении будут: <br>- 💬 Много текста <br>- 💡 Разные виды <b>форматирования</b>`,
  })
  @IsOptional()
  @IsString()
  text?: string;
}
