import { Module } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';
import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './auth/auth.module.js';
import { RedisModule } from './redis/redis.module.js';
import { ConfigModule } from '@nestjs/config';
import { MailModule } from './mail/mail.module.js';
import { JwtModule } from '@nestjs/jwt';
import { BullModule } from '@nestjs/bullmq';
import type { RedisService } from './redis/redis.service.js';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module( {
  imports: [
    ConfigModule.forRoot( {
      isGlobal: true
    } ),

    BullModule.forRootAsync( {
      imports: [ RedisModule ],
      useFactory: ( redis: RedisService ) => ( {
        connection: redis.getClient()
      } )
    } ),
    JwtModule.register( {
      global: true
    } ),
    PrismaModule,

    AuthModule,

    RedisModule,



    MailModule
  ],
  controllers: [],
  providers: [],
} )
export class AppModule { }
