import { IsEmail, IsNotEmpty, IsString, Length } from "class-validator";

export class VerifyEmail
{ 
    @IsNotEmpty()
    @IsString()
    @IsEmail()
    @Length( 10, 100 )
    email: string;
}