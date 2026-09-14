
import { IsEmail, IsNotEmpty, IsString, IsStrongPassword, Length } from "class-validator";

export class ResetPasswordDto
{
    @IsNotEmpty()
    @IsString()
    token: string

    @IsNotEmpty()
    @IsString()
    @IsStrongPassword()
    newPassword: string;

    @IsNotEmpty()
    @IsString()
    @IsEmail()
    @Length( 10, 100 )
    email: string;
}