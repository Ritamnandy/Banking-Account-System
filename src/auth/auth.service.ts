import { Injectable, Logger } from '@nestjs/common';
import  { RedisService } from '../redis/redis.service.js';
import  { MailService } from '../mail/mail.service.js';
import  { RegisterDto } from './dto/register.dto.js';

@Injectable()
export class AuthService
{
    private readonly logger = new Logger(AuthService.name);
    
    constructor (
        private readonly mailService: MailService,
        private readonly redisService: RedisService ) { }
    async registerUser ( data: RegisterDto )
    {
        
    }
}
