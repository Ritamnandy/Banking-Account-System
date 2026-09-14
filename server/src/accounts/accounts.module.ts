import { Module } from '@nestjs/common';
import { AccountsService } from './accounts.service.js';
import { AccountsController } from './accounts.controller.js';
import { AuthModule } from '../auth/auth.module.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { AccountRepository } from './account.repository.js';
import { RedisModule } from '../redis/redis.module.js';

@Module( {
  imports: [ AuthModule, PrismaModule,RedisModule ],
  controllers: [ AccountsController ],
  providers: [ AccountsService, AccountRepository ],
} )
export class AccountsModule { }
