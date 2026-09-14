import { IsDecimal, IsNotEmpty } from "class-validator";

export class SetBallanceDto
{

    @IsNotEmpty()
    @IsDecimal()
    balance: number;
}