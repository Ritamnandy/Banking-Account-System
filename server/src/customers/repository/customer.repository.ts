

import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, Logger, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service.js";
import { PrismaClientKnownRequestError, PrismaClientValidationError } from "@prisma/client/runtime/client";
import { CreateCustomerDto } from "../dto/create-customer.dto.js";
import { UpdateCustomerDto } from "../dto/update-customer.dto.js";
import { UserStatus } from "../../../generated/prisma/enums.js";




@Injectable()
export class CustomerRepository
{
    private readonly logger = new Logger( CustomerRepository.name );
    constructor ( private readonly prismaService: PrismaService ) { }

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



    async createCustomer ( data: CreateCustomerDto )
    {
        try
        {
            return await this.prismaService.customer.create( {
                data: data,
            } )
        } catch ( error )
        {
            this.handleError( error, 'createCustomer' )
        }

    }


    async updateCustomer ( customerId: string, data: UpdateCustomerDto )
    {
        try
        {
            return await this.prismaService.customer.update( {
                where: { customerId: customerId },
                data: data,
            } )
        } catch ( error )
        {
            this.handleError( error, 'updateCustomer' )
        }
    }

    async inActiveCustomer ( customerId: string )
    {
        try
        {
            return await this.prismaService.customer.update( {
                where: { customerId: customerId },
                data: { status: UserStatus.INACTIVE },
            } )
        } catch ( error )
        {
            this.handleError( error, 'inActiveCustomer' )
        }
    }

    async deleteCustomer ( customerId: string )
    {
        try
        {
            return await this.prismaService.customer.delete( {
                where: { customerId: customerId },
            } )
        } catch ( error )
        {
            this.handleError( error, 'deleteCustomer' )
        }
    }

    async updateCustomerStatus ( customerId: string, status: UserStatus )
    {
        try
        {
            return await this.prismaService.customer.update( {
                where: { customerId: customerId },
                data: { status: status },
            } )
        } catch ( error )
        {
            this.handleError( error, 'updateCustomerStatus' )
        }
    }


    async findCustomerById ( customerId: string )
    {
        try
        {
            return await this.prismaService.customer.findUnique( {
                where: { customerId: customerId },
            } )
        } catch ( error )
        {
            this.handleError( error, 'findCustomerById' )
        }
    }

    async findCustomerByEmail ( email: string )
    {
        try
        {
            return await this.prismaService.customer.findUnique( {
                where: { email: email },
            } )
        } catch ( error )
        {
            this.handleError( error, 'findCustomerByEmail' )
        }
    }

    async findCustomerByStatus ( status: UserStatus )
    {
        try
        {
            return await this.prismaService.customer.findMany( {
                where: { status: status },
            } )
        } catch ( error )
        {
            this.handleError( error, 'findCustomerByStatus' )
        }
    }

    async findAllCustomer ()
    {
        try
        {
            return await this.prismaService.customer.findMany()
        } catch ( error )
        {
            this.handleError( error, 'findAllCustomer' )
        }
    }

}