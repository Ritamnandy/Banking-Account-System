import { Module } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthRepository } from './aut.repository.js';
import { AuthguardsGuard } from './authguards/authguards.guard.js';

@Module( {
  imports: [ PrismaModule ],
  providers: [ AuthService, JwtService, ConfigService, AuthRepository, AuthguardsGuard ],
  controllers: [ AuthController ],
  exports: [ AuthguardsGuard ]
} )
export class AuthModule { }
