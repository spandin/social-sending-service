import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PingService {
  private readonly logger = new Logger(PingService.name);
  private readonly pingUrl: string;
  private readonly pingSeconds: number;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.pingUrl = this.configService.get<string>('SELF_URL') ?? 'http://localhost:3000/';
    this.pingSeconds = this.configService.get<number>('PING_SECONDS') ?? 120;

    this.pingSelf();
    setInterval(() => {
      this.pingSelf();
    }, this.pingSeconds * 1000);
  }

  async pingSelf() {
    try {
      const response = await firstValueFrom(this.httpService.get(this.pingUrl));
      this.logger.log(`Ping success: ${response.status}`);
    } catch (error) {
      this.logger.error(`Ping failed: ${error.message}`);
    }
  }
}
