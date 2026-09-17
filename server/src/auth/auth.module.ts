import { Module } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { AuthguardsGuard } from './authguards/authguards.guard.js';
import { RedisModule } from '../redis/redis.module.js';
import { MailModule } from '../mail/mail.module.js';
import { AuthRepository } from '../repositories/auth.repository.js';
import { RoleGuard } from './role/role.guard.js';

@Module( {
  imports: [ PrismaModule, RedisModule, MailModule, AuthRepository ],
  providers: [ AuthService, JwtService, ConfigService, AuthguardsGuard, AuthRepository ],
  controllers: [ AuthController ],
  exports: [ AuthguardsGuard, RoleGuard ]
} )
export class AuthModule { }
