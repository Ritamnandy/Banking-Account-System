import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import type { RegisterDto } from './dto/register.dto.js';
import type { VerifyEmail } from './dto/verifyEmail.dto.js';
import type { LoginDto } from './dto/login.dto.js';
import type { Response } from 'express';
import type { ResendOtpDto } from './dto/resendotp.dto.js';
import type { RefreshTokenDto } from './dto/refreshtoken.dto.js';
import type { AuthenticatedRequest } from './types/authenticated-request..types.js';
import type { ResetPasswordDto } from './dto/resetPassword.dto.js';
import { AuthguardsGuard } from './authguards/authguards.guard.js';

@Controller( 'auth' )
export class AuthController
{
    private setAuthCookies(
    res: Response,
    accessToken: string,
    refreshToken: string,
  ): void {
    const isProd = process.env.NODE_ENV === 'production';

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: isProd, // must be true in prod (HTTPS); false locally over http
      sameSite: 'strict',
      maxAge: 1 * 60 * 60 * 1000, // 1 hour — match access token expiry
      path: '/',
    });

    res.cookie('accessToken', refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'strict',
      maxAge: 10 * 24 * 60 * 60 * 1000, // 10 days — match refresh token expiry
      path: '/auth/refresh', // scope it — only sent on the refresh endpoint, reduces exposure
    });
  }
    constructor ( private readonly authService: AuthService )
    { 
        
    }
    @Post( 'register' )
        @HttpCode( HttpStatus.ACCEPTED )
    async registerUser (@Body() data: RegisterDto )
    {
        const result = await this.authService.registerUser( data );
        return {
            message: 'User data accepted',
        };
    }

    @Post('resend-otp')
    @HttpCode(HttpStatus.OK)
    async resendOtp ( @Body() data: ResendOtpDto )
    {
        await this.authService.resendOtpCode( data );
        return {
            message: 'OTP resent successfully',
        };
    }


    @Post('verify')
    @HttpCode(HttpStatus.CREATED)
    async verifyUser(@Body() data: VerifyEmail, @Res() res: Response)
    {
        const result = await this.authService.verifyEmail( data );
        this.setAuthCookies(res, result.accessToken, result.refreshToken);
        return {
            message: 'User verified successfully',
            user : result
        };
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body() data: LoginDto, @Res() res: Response)
    {
        const result = await this.authService.loginUser( data );
        this.setAuthCookies(res, result.accessToken, result.refreshToken);
        return {
            message: 'User logged in successfully',
            user : result
        };
    }

    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    async refreshAccessToken ( @Body() data: RefreshTokenDto, @Res() res: Response )
    {
        const result = await this.authService.refreshAccessToken( data.refreshToken );
        this.setAuthCookies(res, result.accessToken, result.refreshToken);
        return {
            message: 'Access token refreshed successfully',
            user : result
        };
    }

    @Post('logout')
    @HttpCode(HttpStatus.OK)
    async logout ( @Res() res: Response,@Req() req:AuthenticatedRequest )
    {
        const response = await this.authService.logoutUser(req.user.id);
        res.clearCookie('accessToken');
        res.clearCookie( 'refreshToken' );
        
        return {
            message: 'User logged out successfully',
        };
    }

    @Post('forgot-password')
    @HttpCode(HttpStatus.OK)
    async forgotPassword (@Body() data: ResendOtpDto)
    {
        const result = await this.authService.forgotPassword(data);
        return {
            message: 'Password reset email sent successfully',
            user : result
        };
    }

    @Post('reset-password')
    @HttpCode(HttpStatus.OK)
    async resetPassword (@Body() data: ResetPasswordDto)
    {
        const result = await this.authService.resetPassword(data);
        return {
            message: 'Password reset successfully',
            user : result
        };
    }

 

    @Get('profile')
    @HttpCode( HttpStatus.OK )
    @UseGuards(AuthguardsGuard)
    async getUserProfile (@Req() req: AuthenticatedRequest)
    {
        const user = await this.authService.getCurrentUser(req.user.id);
        return {
            message: 'User profile retrieved successfully',
            user,
        };
    }

}
