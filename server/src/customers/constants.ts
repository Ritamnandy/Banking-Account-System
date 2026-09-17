import crypto from 'node:crypto'

const ALGORITHM = 'aes-256-gcm'
const KEY = Buffer.from( process.env.ENCRYPTION_KEY!, 'hex' )

function encrypt ( data: string ): string
{
    const iv = crypto.randomBytes( 12 )

    const cipher = crypto.createCipheriv(
        ALGORITHM,
        KEY,
        iv
    )

    const encrypted = Buffer.concat( [
        cipher.update( data, 'utf8' ),
        cipher.final()
    ] )

    const authTag = cipher.getAuthTag()

    return [
        iv.toString( 'hex' ),
        authTag.toString( 'hex' ),
        encrypted.toString( 'hex' )
    ].join( ':' )
}

function decrypt ( data: string ): string
{
    const [ ivHex, authTagHex, encryptedHex ] = data.split( ':' )

    const decipher = crypto.createDecipheriv(
        ALGORITHM,
        KEY,
        Buffer.from( ivHex, 'hex' )
    )

    decipher.setAuthTag(
        Buffer.from( authTagHex, 'hex' )
    )

    const decrypted = Buffer.concat( [
        decipher.update( Buffer.from( encryptedHex, 'hex' ) ),
        decipher.final()
    ] )

    return decrypted.toString( 'utf8' )
}


function maskPhoneNumber ( phoneNo: string ): string
{
    return 'X'.repeat( phoneNo.length - 2 ) + phoneNo.slice( -2 )
}

function maskAadhaar ( aadhaar: string ): string
{
    return 'X'.repeat( aadhaar.length - 4 ) + aadhaar.slice( -4 )
}

function maskPan ( pan: string ): string
{
    return 'X'.repeat( pan.length - 3 ) + pan.slice( -3 )
}






export { encrypt, decrypt, maskPhoneNumber, maskAadhaar, maskPan }
