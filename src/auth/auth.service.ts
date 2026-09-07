import { Injectable, Logger } from '@nestjs/common';
import type { RedisService } from '../redis/redis.service.js';
import type { MailService } from '../mail/mail.service.js';

@Injectable()
export class AuthService
{
    private readonly logger = new Logger(AuthService.name);
    
    constructor (
        private readonly mailService: MailService,
        private readonly redisService: RedisService ) { }
}
