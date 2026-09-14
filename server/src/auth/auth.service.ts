import { HttpException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { RedisService } from '../redis/redis.service.js';
import { MailService } from '../mail/mail.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { comparePassword, getOtp, hashPassword, otpKey, signupKey, rawToken, hashToken, ResetPasswordLink, resetTokenKey } from './constants.js';
import { AuthRepository } from './aut.repository.js';
import { ConfigService } from '@nestjs/config';
import { JsonWebTokenError, JwtService, NotBeforeError, TokenExpiredError } from '@nestjs/jwt';
import { VerifyEmail } from './dto/verifyEmail.dto.js';
import type { JwtPayLoad, RefreshTokenPayload } from './types/payload.types.js';
import { StringValue } from 'ms';
import { ResendOtpDto } from './dto/resendotp.dto.js';
import { LoginDto } from './dto/login.dto.js';
import type { ResetPasswordDto } from './dto/resetPassword.dto.js';
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

    private async decodeRefreshToken ( refreshToken: string ): Promise<RefreshTokenPayload>
    {
        try
        {
            const response: RefreshTokenPayload = await this.jwtService.verifyAsync( refreshToken, {
                secret: this.configService.getOrThrow<string>( 'REFRESH_TOKEN_SECRET' )
            } )
            return response
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

    async resendOtpCode ( data: ResendOtpDto )
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

    async verifyEmail ( data: VerifyEmail )
    {
        const cachedUser = await this.redisService.get( signupKey( data.email ) )
        if ( !cachedUser )
        {
            throw new HttpException( 'Signup data not found or Register Session expired', 400 )
        }
        const otp = await this.redisService.get( otpKey( data.email ) )
        if ( !otp )
        {
            throw new HttpException( 'OTP not found or OTP expired,Please request a new OTP', 400 )
        }
        if ( otp !== data.otp )
        {
            throw new HttpException( 'Invalid OTP,Please enter a valid OTP', 400 )
        }
        const user = JSON.parse( cachedUser ) as RegisterDto
        const hashpassword = await hashPassword( user.password )
        const createdUser = await this.authRepository.createUser( { ...user, password: hashpassword } )
        const { jwt, refresh } = this.createPayLoad( {
            id: createdUser.userId,
            email: createdUser.email,
            firstName: createdUser.firstName,
            lastName: createdUser.lastName
        } )
        const { accessToken, refreshToken } = await this.genarateTokenPair( jwt, refresh )
        await this.redisService.delete( signupKey( data.email ) )
        await this.redisService.delete( otpKey( data.email ) )
        this.logger.log( `User verified and created ${ data.email }` )
        return {
            message: 'User verified and created successfully',
            user: createdUser,
            accessToken: accessToken,
            refreshToken: refreshToken
        }
    }

    async loginUser ( data: LoginDto )
    {
        const existingUser = await this.authRepository.findWhenLogin( data.email )
        if ( !existingUser )
        {
            throw new HttpException( 'User not found,Please register first', 404 )
        }
        const isPasswordCurrect = await comparePassword( data.password, existingUser.password )
        if ( !isPasswordCurrect )
        {
            throw new HttpException( 'Invalid credentials,Please enter valid credentials', 400 )
        }
        const { jwt, refresh } = this.createPayLoad( {
            id: existingUser.userId,
            email: existingUser.email,
            firstName: existingUser.firstName,
            lastName: existingUser.lastName
        } )
        const { accessToken, refreshToken } = await this.genarateTokenPair( jwt, refresh )
        this.logger.log( `User logged in ${ data.email }` )
        return {
            message: 'User logged in successfully',
            user: {
                userId: existingUser.userId,
                email: existingUser.email,
                firstName: existingUser.firstName,
                lastName: existingUser.lastName,
                createdAt: existingUser.createdAt,
                updatedAt: existingUser.updatedAt
            },
            accessToken: accessToken,
            refreshToken: refreshToken
        }

    }

    async logoutUser ( userId: string )
    {
        const user = await this.authRepository.logOutUser( userId )
        this.logger.log( `User logged out ${ user.email }` )
        return {
            message: 'User logged out successfully'
        }
    }

    async refreshAccessToken ( refreshToken: string )
    {
        const decoded = await this.decodeRefreshToken( refreshToken )
        const user = await this.authRepository.findWhenLogin( decoded.email )
        if ( !user )
        {
            throw new HttpException( 'User not found', 404 )
        }
        if ( refreshToken !== user.refreshToken )
        {
            throw new HttpException( 'Invalid refresh token', 401 )
        }
        const { jwt, refresh } = this.createPayLoad( {
            id: user.userId,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName
        } )
        const { accessToken, refreshToken: newRefreshToken } = await this.genarateTokenPair( jwt, refresh )
        this.logger.log( `User refreshed access token ${ user.email }` )
        return {
            message: 'User refreshed access token successfully',
            accessToken: accessToken,
            refreshToken: newRefreshToken
        }
    }

    async forgotPassword ( data: ResendOtpDto )
    {
        const user = await this.authRepository.findByEmail( data.email )
        if ( !user )
        {
            throw new HttpException( 'User not found', 404 )
        }
        const rowtoken = rawToken()
        const hashedToken = hashToken( rowtoken )
        const link = ResetPasswordLink( hashedToken, user.email )
        await this.redisService.set( resetTokenKey( hashedToken ), user.email, 60 * 10 )
        await this.mailService.sendResetPasswordMail( user.email, link )
        this.logger.log( `Reset password link sent to ${ user.email }` )
        this.logger.log( `Reset password token: ${ rowtoken }` )
        return {
            message: 'If the email exists, a reset password link has been sent'
        }

    }

    async resetPassword ( data: ResetPasswordDto )
    {
        const hashedToken = hashToken( data.token )
        const cachedEmail = await this.redisService.get( resetTokenKey( hashedToken ) )
        if ( !cachedEmail )
        {
            throw new HttpException( 'Invalid reset token or expired', 400 )
        }
        const user = await this.authRepository.findByEmail( cachedEmail )
        if ( !user )
        {
            throw new HttpException( 'User not found', 404 )
        }

        const password = await hashPassword( data.newPassword )
        await this.authRepository.setPassword( password, user.email )
        await this.redisService.delete( resetTokenKey( hashedToken ) )
        await this.mailService.sendPasswordChangedMail( user.email )
        this.logger.log( `User reset password ${ user.email }` )
        return {
            message: 'User reset password successfully,Please login with new password'
        }
    }

    async getCurrentUser ( userId: string )
    {
        const user = await this.authRepository.findById( userId )
        if ( !user )
        {
            throw new HttpException( 'User not found', 404 )
        }
        this.logger.log( `User fetched ${ user.email }` )
        return {
            message: 'User fetched successfully',
            user: user
        }
    }
}
