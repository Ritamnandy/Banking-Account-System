import { HttpException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { RedisService } from '../redis/redis.service.js';
import { MailService } from '../mail/mail.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { getOtp, otpKey, signupKey } from './constants.js';
import { AuthRepository } from './aut.repository.js';
import { ConfigService } from '@nestjs/config';
import { JsonWebTokenError, JwtService, NotBeforeError, TokenExpiredError } from '@nestjs/jwt';
import { VerifyEmail } from './dto/verifyEmail.dto.js';
import type { JwtPayLoad, RefreshTokenPayload } from './types/payload.types.js';
import { StringValue } from 'ms';
@Injectable()
export class AuthService
{
    private readonly logger = new Logger( AuthService.name );

    constructor (
        private readonly configService: ConfigService,
        private readonly jwtService: JwtService,
        private readonly authRepository: AuthRepository,
        private readonly mailService: MailService,
        private readonly redisService: RedisService ) { }

    private createPayLoad ( payload: JwtPayLoad ): { jwt: JwtPayLoad, refresh: RefreshTokenPayload }
    {
        const jwt: JwtPayLoad = {
            id: payload.id,
            email: payload.email,
            firstName: payload.firstName,
            lastName: payload.lastName
        }
        const refresh: RefreshTokenPayload = {
            id: payload.id,
            email: payload.email
        }
        return { jwt, refresh };
    }

    private async genarateTokenPair ( jwtpayload: JwtPayLoad, refreshTokenPaload: RefreshTokenPayload ): Promise<{ accessToken: string, refreshToken: string }>
    {
        const accessToken = await this.jwtService.signAsync( jwtpayload, {
            secret: this.configService.getOrThrow<string>( 'JWT_SECRET' ),

            expiresIn: this.configService.getOrThrow<string>( 'JWT_EXPIRES_IN' ) as StringValue
        } );

        const refreshToken = await this.jwtService.signAsync( refreshTokenPaload, {
            secret: this.configService.getOrThrow<string>( 'REFRESH_TOKEN_SECRET' ),

            expiresIn: this.configService.getOrThrow<string>( 'REFRESH_TOKEN_EXPIRES_IN' ) as StringValue
        } );
        await this.authRepository.setRefreshToken( refreshToken, refreshTokenPaload.id )
        return { accessToken, refreshToken };
    }

    private decodeRefreshToken ( refreshToken: string )
    {
        try
        {
            return this.jwtService.verifyAsync( refreshToken, {
                secret: this.configService.getOrThrow<string>( 'REFRESH_TOKEN_SECRET' )
            } )
        } catch ( error )
        {
            if ( error instanceof TokenExpiredError )
            {
                throw new UnauthorizedException( 'Refresh token expired' )
            }
            if ( error instanceof JsonWebTokenError )
            {
                throw new UnauthorizedException( `Invalid refresh token` )
            }
            if ( error instanceof NotBeforeError )
            {
                throw new UnauthorizedException( `Refresh token not yet valid` )
            }
            this.logger.error( 'Error decoding refresh token:', error instanceof Error ? error.message : error )
            throw new UnauthorizedException( 'Invalid refresh token' )
        }
    }



    async registerUser ( data: RegisterDto )
    {
        const user = await this.authRepository.findByEmail( data.email )
        if ( user )
        {
            throw new HttpException( 'User already exists', 400 )
        }
        const otp = getOtp();
        await Promise.all( [
            this.redisService.set( otpKey( data.email ), otp, 60 * 10 ),
            this.redisService.set( signupKey( data.email ), JSON.stringify( data ), 60 * 20 ),
            this.mailService.sendVerifyEmailMail( data.email, otp )
        ] )
        this.logger.log( `User register data accepted and OTP sent to ${ data.email }` )
        return { message: 'OTP sent to your email ,Please verify to complete registration' }

    }

    async resendOtpCode ( data: VerifyEmail )
    {
        const signupData = await this.redisService.get( signupKey( data.email ) )
        if ( !signupData )
        {
            throw new HttpException( 'Signup data not found or Register Session expired', 400 )
        }
        const otp = getOtp();
        await Promise.all( [
            this.redisService.set( otpKey( data.email ), otp, 60 * 10 ),
            this.mailService.sendVerifyEmailMail( data.email, otp )
        ] )
        this.logger.log( `OTP resent to ${ data.email }` )
        return {
            message: 'OTP resent to your email,Please verify to complete registration'
        }
    }


}
