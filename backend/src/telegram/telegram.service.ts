import { Injectable, Logger } from '@nestjs/common';
import { Telegram } from 'telegraf';
import * as path from 'path';

@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);
  private readonly telegram: Telegram;
  private readonly chatId: string;

  private readonly TELEGRAM_MESSAGE_LIMIT = 4096; // Максимальная длина текста
  private readonly CAPTION_LIMIT = 1024; // Максимальная длина caption для media

  constructor() {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token) {
      throw new Error('TELEGRAM_BOT_TOKEN не установлен');
    }
    if (!chatId) {
      throw new Error('TELEGRAM_CHAT_ID не установлен');
    }

    this.telegram = new Telegram(token);
    this.chatId = chatId;
  }

  async sendMediaGroupAndText(files?: Express.Multer.File[], text?: string): Promise<void> {
    const hasFiles = Array.isArray(files) && files.length > 0;
    const hasText = typeof text === 'string' && text.trim().length > 0;

    try {
      if (hasFiles) {
        const { mediaGroup, documents } = this.splitFiles(files);

        if (mediaGroup.length > 0) {
          // Если текст есть и подходит под caption, добавим его в первый элемент mediaGroup
          if (hasText && text.trim().length <= this.CAPTION_LIMIT) {
            mediaGroup[0].caption = text.trim();
            mediaGroup[0].parse_mode = 'MarkdownV2';
            // Отправляем медиа с caption
            await this.telegram.sendMediaGroup(this.chatId, mediaGroup);
            // Текст уже отправлен в caption, больше отправлять не нужно
            if (documents.length > 0) {
              for (const doc of documents) {
                await this.telegram.sendDocument(this.chatId, {
                  source: doc.buffer,
                  filename: doc.originalname,
                });
              }
            }
            return;
          } else {
            // Отправляем только медиа без caption
            await this.telegram.sendMediaGroup(this.chatId, mediaGroup);
          }
        }

        // Отправляем документы (без caption, документы нельзя смешивать с медиа)
        if (documents.length > 0) {
          for (const doc of documents) {
            await this.telegram.sendDocument(this.chatId, {
              source: doc.buffer,
              filename: doc.originalname,
            });
          }
        }
      }

      // Если есть текст и он не был отправлен как caption, разбиваем и отправляем отдельными сообщениями
      if (hasText) {
        await this.splitAndSendText(text.trim());
      }
    } catch (error) {
      this.logger.error('Ошибка при отправке в Telegram:', error);
      throw error;
    }
  }

  private splitFiles(files: Express.Multer.File[]) {
    const videoExt = ['.mp4', '.mov', '.avi'];
    const docExt = ['.pdf', '.docx', '.xlsx', '.txt'];

    const mediaGroup: Array<any> = [];
    const documents: Express.Multer.File[] = [];

    for (const file of files) {
      const ext = path.extname(file.originalname).toLowerCase();

      if (docExt.includes(ext)) {
        documents.push(file);
      } else {
        const type = videoExt.includes(ext) ? 'video' : 'photo';
        mediaGroup.push({
          type,
          media: { source: file.buffer },
        });
      }
    }

    return { mediaGroup, documents };
  }

  private async splitAndSendText(text: string): Promise<void> {
    const parts = this.splitText(text, this.TELEGRAM_MESSAGE_LIMIT);

    for (const part of parts) {
      // Отправляем с Markdown-разметкой и поддержкой emoji
      await this.telegram.sendMessage(this.chatId, part, { parse_mode: 'MarkdownV2' });
    }
  }

  private splitText(text: string, limit: number): string[] {
    const result: string[] = [];

    while (text.length > limit) {
      let sliceIndex = limit;

      // Пытаемся разорвать по пробелу или переносу строки
      const lastSpace = text.lastIndexOf(' ', limit);
      const lastNewline = text.lastIndexOf('\n', limit);
      const breakPoint = Math.max(lastSpace, lastNewline);

      if (breakPoint > 0) {
        sliceIndex = breakPoint;
      }

      result.push(text.slice(0, sliceIndex).trim());
      text = text.slice(sliceIndex).trim();
    }

    if (text.length > 0) {
      result.push(text);
    }

    return result;
  }
}
