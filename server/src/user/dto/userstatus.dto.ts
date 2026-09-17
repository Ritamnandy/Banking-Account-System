import { IsEnum, IsNotEmpty } from "class-validator";
import { UserStatus } from "../../Types/types.js";

export class UserStatusDto
{
    @IsNotEmpty()
    @IsEnum( UserStatus )
    status: UserStatus;
}