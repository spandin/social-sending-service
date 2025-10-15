import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { HttpModule } from '@nestjs/axios';

import { PingService } from './ping/ping.service';

@Module({
  imports: [
    HttpModule,
    ConfigModule.forRoot({
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
  ],
  providers: [PingService],
})
export class AppModule {}
