import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, IsStrongPassword, Length } from "class-validator";
import { Role } from "../../Types/types.js";

export class RegisterDto
{
    @IsNotEmpty()
    @IsString()
    @Length( 3, 30 )
    firstName: string

    @IsNotEmpty()
    @IsString()
    @Length( 3, 30 )
    lastName: string

    @IsNotEmpty()
    @IsString()
    @IsEmail()
    @Length( 10, 100 )
    email: string;

    @IsNotEmpty()
    @IsString()
    @IsStrongPassword()
    password!: string;

    @IsOptional()
    @IsString()
    @IsEnum( Role )
    role: Role;
}
