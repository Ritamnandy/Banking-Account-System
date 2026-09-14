import { Module } from '@nestjs/common';
import { MailService } from './mail.service.js';
import { MailProcessor } from './mail.proccesser.js';
import { BullModule } from '@nestjs/bullmq';
import { EMAIL_QUEUE } from './constants.js';

@Module( {
  imports: [
    BullModule.registerQueue( {
      name: EMAIL_QUEUE
    } )
  ],
  providers: [ MailService, MailProcessor ],
  exports: [ MailService ]
} )
export class MailModule { }
