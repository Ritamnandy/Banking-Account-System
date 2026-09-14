import { IsEmail, IsNotEmpty, IsString, IsStrongPassword, Length } from "class-validator";

export class RegisterDto
{ 
    @IsNotEmpty()
    @IsString()
    @Length(3,30)
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
}