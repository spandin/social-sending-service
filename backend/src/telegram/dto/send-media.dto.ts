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
    type: String,
    required: false,
    description: 'Текстовое сообщение',
  })
  @IsOptional()
  @IsString()
  text?: string;
}
