import { IsDecimal, IsEnum, IsNotEmpty, IsString } from "class-validator";
import { AccountType } from "../constants.js";

export class CreateAccountDto
{
    @IsNotEmpty()
    @IsDecimal()
    balance:number

    @IsNotEmpty()
    @IsString()
    @IsEnum( AccountType )
    accountType: AccountType;
}
