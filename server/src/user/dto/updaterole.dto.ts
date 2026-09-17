import { IsEnum, IsNotEmpty } from "class-validator";
import { Role } from "../../Types/types.js";

export class UpdateRoleDto
{
    @IsNotEmpty()
    @IsEnum( Role )
    role: Role;
}