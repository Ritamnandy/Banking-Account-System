import { Module } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';
import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './auth/auth.module.js';
import { RedisModule } from './redis/redis.module.js';
import { ConfigModule } from '@nestjs/config';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module( {
  imports: [

    PrismaModule,

    AuthModule,

    RedisModule,

    ConfigModule.forRoot( {
      isGlobal: true
    } )
  ],
  controllers: [],
  providers: [],
} )
export class AppModule { }
