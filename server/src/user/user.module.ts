import { Module } from '@nestjs/common';
import { UserService } from './user.service.js';
import { UserController } from './user.controller.js';
import { AuthModule } from '../auth/auth.module.js';
import { AuthRepository } from '../repositories/auth.repository.js';

@Module( {
  imports: [ AuthModule,AuthRepository ],
  controllers: [ UserController ],
  providers: [ UserService, AuthRepository ],
} )
export class UserModule { }
