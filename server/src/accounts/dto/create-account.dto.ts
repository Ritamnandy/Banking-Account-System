import { IsEnum, IsNotEmpty, IsString } from "class-validator";
import { AccountType } from "../constants.js";

export class CreateAccountDto
{
    @IsNotEmpty()
    @IsString()
    customerId: string

    @IsNotEmpty()
    @IsString()
    @IsEnum( AccountType )
    accountType: AccountType;
}
