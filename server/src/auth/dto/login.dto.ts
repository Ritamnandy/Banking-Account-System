
import { IsEmail, IsNotEmpty, IsString, IsStrongPassword, Length } from "class-validator";

export class LoginDto
{

    @IsNotEmpty()
    @IsString()
    @IsEmail()
    @Length( 10, 100 )
    email: string;

    @IsNotEmpty()
    @IsString()
    @IsStrongPassword()
    password!: string;
}