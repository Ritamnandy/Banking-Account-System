
import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service.js';
import { PrismaClientKnownRequestError, PrismaClientValidationError } from '../../generated/prisma/internal/prismaNamespace.js';
import type { RegisterDto } from './dto/register.dto.js';

@Injectable()
export class AuthRepository
{
    constructor ( private readonly prisma: PrismaService ) { }


    private readonly logger = new Logger( AuthRepository.name )

    private readonly SelectedOption = {
        userId: true,
        firstName: true,
        lastName: true,
        email: true,
        createdAt: true,
        updatedAt: true,
    };


    private handleError ( error: unknown, context: string, notFoundMsg: string = "Resource not found" ): never
    {
        if ( error instanceof PrismaClientKnownRequestError )
        {
            switch ( error.code )
            {
                case 'p2002':
                    this.logger.warn( `[${ context }] Unique constraint violation: ${ JSON.stringify( error.meta?.target ) }`, )
                    throw new ConflictException(
                        'A record with these details already exists',
                    );
                case 'p2025':
                    this.logger.warn( `[${ context }] Record not found` );
                    throw new NotFoundException( notFoundMsg );

                default:
                    this.logger.error(
                        `[${ context }] Prisma error ${ error.code }: ${ error.message }`,
                    );
                    throw new InternalServerErrorException( 'Database operation failed' );
            }
        }
        if ( error instanceof PrismaClientValidationError )
        {
            this.logger.error(
                `[${ context }] Prisma validation error: ${ error.message }`,
            );
            throw new BadRequestException(
                'Invalid data provided to database operation',
            );
        }
        this.logger.error(
            `[${ context }] Unexpected error: ${ ( error as Error )?.message }`,
            ( error as Error )?.stack,
        );
        throw new InternalServerErrorException(
            'Something went wrong, please try again later',
        );
    }

    async createUser ( data: RegisterDto )
    {
        try
        {

            return await this.prisma.user.create( {
                data: { ...data },
                omit: {
                    password: true,
                    refreshToken: true,
                    status: true
                }
            } )


        } catch ( error )
        {
            this.handleError( error, 'createUser' )
        }
    }

    async findById ( userId: string )
    {
        try
        {

            await this.prisma.user.findUnique( {
                where: {
                    userId
                },
                select: this.SelectedOption
            } )

        } catch ( error )
        {
            this.handleError( error, 'findById' )
        }
    }

    async findByEmail ( email: string )
    {
        try
        {

            await this.prisma.user.findUnique( {
                where: {
                    email
                },
                select: this.SelectedOption
            } )

        } catch ( error )
        {
            this.handleError( error, 'findByEmail' )
        }
    }

    async setRefreshToken ( refreshToken: string, userId: string )
    {
        try
        {
            return await this.prisma.user.update( {
                where: { userId },
                data: { refreshToken }
            } )
        } catch ( error )
        {
            this.handleError( error, 'setRefreshToken' )
        }
    }

    async logOutUser ( userId: string )
    {
        try
        {
            return await this.prisma.user.update( {
                where: { userId },
                data: {
                    refreshToken: null,
                    status: 'INACTIVE'
                }
            } )
        } catch ( error )
        {
            this.handleError( error, 'logOutUser' )
        }
    }

    async findWhenLogin ( email: string )
    {
        try
        {
            await this.prisma.user.findUnique( {
                where: { email }
            } )
        } catch ( error )
        {
            this.handleError( error, 'findWhenLogin' )
        }
    }


    async setPassword ( password: string, email: string )
    {
        try
        {
            return await this.prisma.user.update( {
                where: { email },
                data: { password }
            } )
        } catch ( error )
        {
            this.handleError( error, 'setPassword' )
        }
    }

}