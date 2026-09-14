import { IsDate, IsEnum, IsNotEmpty, IsPhoneNumber, IsString, Length } from "class-validator";
import { AccountType } from "../constants.js";

export class CreateAccountDto
{
    @IsNotEmpty()
    @IsString()
    @Length( 10, 100 )
    name: string;

    @IsNotEmpty()
    @IsString()
    email: string;

    @IsNotEmpty()
    @IsString()
    @IsPhoneNumber( 'IN' )
    phone: string;

    @IsNotEmpty()
    @IsDate()
    dateOfBirth: Date;

    @IsNotEmpty()
    @IsString()
    @IsEnum( AccountType )
    accountType: string;
}
