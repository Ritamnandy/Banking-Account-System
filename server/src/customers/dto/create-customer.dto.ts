import { IsDate, IsEmail, IsNotEmpty, IsPhoneNumber, IsString, Length, Matches } from "class-validator";

export class CreateCustomerDto
{
    @IsNotEmpty()
    @IsString()
    @Length( 5, 40 )
    name: string;

    @IsNotEmpty()
    @IsString()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsString()
    @IsPhoneNumber( 'IN' )
    phoneNo: string;

    @IsNotEmpty()
    @IsString()
    @Length( 12, 12 )
    @Matches( /^[0-9]{12}$/, {
        message: 'Aadhaar number must contain exactly 12 digits',
    } )
    aadhaarNo: string;

    @IsNotEmpty()
    @IsString()
    @Length( 10, 10 )
    @Matches( /^[A-Z]{5}[0-9]{4}[A-Z]$/, {
        message: 'PAN number must be in valid format',
    } )
    panNo: string;

    @IsNotEmpty()
    @IsDate()
    dateOfBirth: Date;

    @IsNotEmpty()
    @IsString()
    @Length( 6, 6 )
    pinCode: string;

    @IsNotEmpty()
    @IsString()
    @Length( 10, 200 )
    address: string;

    @IsNotEmpty()
    @IsString()
    @Length( 5, 40 )
    branchName: string;
}
