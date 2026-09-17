import { IsEnum, IsNotEmpty } from "class-validator";
import { UserStatus } from "../../../generated/prisma/enums.js";

export class CustomerStatus
{
    @IsNotEmpty()
    @IsEnum( UserStatus )
    status: UserStatus;
}