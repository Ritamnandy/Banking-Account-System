import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import Mailgen from 'mailgen';
import Nodemailer, { Transporter} from 'nodemailer';
import
    {
        ChangedPasswordConfirmation,
        WellcomeMail,
        ResetPassword,
        VerifyEmail,
    } from './types/mail.types.js';
import { EMAIL_QUEUE } from './constants.js';
import { Logger } from '@nestjs/common';

@Processor( EMAIL_QUEUE )
export class MailProcessor extends WorkerHost
{
    private readonly transporter: Transporter;
    private readonly mailgen: Mailgen;
    private readonly logger = new Logger( MailProcessor.name );
    constructor ()
    {
        super();
        this.transporter = Nodemailer.createTransport( {
            service: 'gmail',
            auth: {
                user: process.env.MAIL_USER as string,
                pass: process.env.MAIL_PASSWORD as string,
            },
        } );
        this.mailgen = new Mailgen( {
            theme: 'default',
            product: {
                name: 'NestJS',
                link: 'https://nestjs.com',
            },
        } );
    }

    async process ( job: Job )
    {
        this.logger.log(
            `Processing job "${ job.name }" (id: ${ job.id }) for ${ job.data ?? 'unknown' }`,
        );

        try
        {
            let result;

            switch ( job.name )
            {
                case 'sendWelcomeEmail':
                    result = await this.sendWelcomeEmail( job );
                    break;
                case 'sendVerifyEmailMail':
                    result = await this.sendVerifyEmailMail( job );
                    break;
                case 'sendResetPasswordMail':
                    result = await this.sendResetPasswordMail( job );
                    break;
                case 'sendPasswordChangedMail':
                    result = await this.sendPasswordChangedMail( job );
                    break;
                default:
                    throw new Error( `Unknown mail job: ${ job.name }` );
            }

            this.logger.log(
                `Job "${ job.name }" (id: ${ job.id }) sent — messageId: ${ result.messageId }`,
            );
            return result;
        } catch ( err )
        {
            this.logger.error(
                `Job "${ job.name }" (id: ${ job.id }) failed: ${ ( err as Error ).message }`,
                ( err as Error ).stack,
            );
            throw err; // re-throw so BullMQ still marks it failed & retries per your Options
        }
    }

    private async sendMail (
        to: string,
        subject: string,
        emailBody: Mailgen.Content,
    )
    {
        const html = this.mailgen.generate( emailBody ) as string;
        const text = this.mailgen.generatePlaintext( emailBody ) as string;
        this.logger.log( 'Sending email', { to: to } );
        return await this.transporter.sendMail( {
            from: process.env.APP_EMAIL,
            to,
            subject,
            html,
            text,
        } );
    }

    private async sendWelcomeEmail (
        job: Job,
    )
    {
        const { email, name } = job.data as WellcomeMail;

        return this.sendMail( email, 'Welcome to My App', {
            body: {
                name,
                intro: 'Welcome to My App!',
                action: {
                    instructions: 'You can now start using your account.',
                    button: {
                        text: 'Visit My App',
                        link: 'https://example.com',
                    },
                },
                outro: 'If you have any questions, feel free to contact us.',
            },
        } );
    }

    private async sendVerifyEmailMail (
        job: Job,
    )
    {
        const { email, otp } = job.data as VerifyEmail;

        return this.sendMail( email, 'Verify your email address', {
            body: {
                name: email,
                intro: 'Welcome to My App!',
                action: {
                    instructions:
                        'Please verify your email address by clicking the button below:',
                    button: {
                        color: '#22BC66',
                        text: otp.toString(),
                        link: '#',
                    },
                },
                outro:
                    'If you did not create this account, you can safely ignore this email.',
            },
        } );
    }

    private async sendResetPasswordMail (
        job: Job,
    )
    {
        const { email, link } = job.data as ResetPassword;

        return this.sendMail( email, 'Reset your password', {
            body: {
                name: email,
                intro: 'We received a request to reset your password.',
                action: {
                    instructions: 'Click the button below to create a new password:',
                    button: {
                        color: '#22BC66',
                        text: 'Reset Password',
                        link,
                    },
                },
                outro:
                    'If you did not request a password reset, you can safely ignore this email.',
            },
        } );
    }

    private async sendPasswordChangedMail (
        job: Job,
    )
    {
        const { email } = job.data as ChangedPasswordConfirmation;

        return this.sendMail( email, 'Your password was changed', {
            body: {
                name: email,
                intro: 'Your password has been changed successfully.',
                outro:
                    'If you did not make this change, please contact support immediately.',
            },
        } );
    }
}