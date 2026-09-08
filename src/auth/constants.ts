
import crypto from 'node:crypto'
import bcrypt from 'bcrypt'

const getOtp = (): string =>
{
    return crypto.randomInt( 100000, 999999 ).toString()
}

async function hashPassword ( password: string ): Promise<string>
{
    return await bcrypt.hash( password, 13 )
}

async function comparePassword ( password: string, hashPassword: string ): Promise<boolean>
{
    return bcrypt.compare( password, hashPassword )
}

const signupKey = ( email: string ) =>
{
    return `signup-key:${ email }`;
};

const otpKey = ( email: string ) =>
{
    return `otp-key:${ email }`;
};

const hashToken = ( token: string ) =>
{
    return crypto.createHash( 'sha256' ).update( token ).digest( 'hex' )
}
const rawToken = () => crypto.randomBytes( 32 ).toString( 'hex' )


const resetTokenKey = ( hashtoken: string ) =>
{
    return `reset-token:${ hashtoken }`;
};

const ResetPasswordLink = ( token: string, email: string ) =>
{
    return `${ process.env.FONTEND_RESET_PASSWORD_URL as string }?token=${ token }&email=${ encodeURIComponent( email ) }`;
};

const ACCESS_TOKEN_COOKIE_NAME = 'accessToken';

export
{ 
    ACCESS_TOKEN_COOKIE_NAME,
    ResetPasswordLink,
    comparePassword,
    getOtp,
    hashPassword,
    hashToken,
    rawToken,
    resetTokenKey,
    signupKey,
    otpKey
    
}