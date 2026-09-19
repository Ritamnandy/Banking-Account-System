import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, Logger, NotFoundException } from "@nestjs/common";
import type { PrismaService } from "../prisma/prisma.service.js";
import { PrismaClientKnownRequestError, PrismaClientValidationError } from "@prisma/client/runtime/client";
import { CreateAccountDto } from "./dto/create-account.dto.js";

import { AccountStatus } from "../../generated/prisma/enums.js";

@Injectable()
export class AccountRepository
{
    private readonly logger = new Logger( AccountRepository.name )
    constructor ( private readonly prisma: PrismaService ) { }

    private handlePrismaError ( error: unknown, context: string, notfound: string = 'Resource not found' ): never
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
                    throw new NotFoundException( notfound );

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

    async createAccount ( data: CreateAccountDto,  accountNumber: string )
    {
        try
        {
            return await this.prisma.accounts.create( {
                data: {
                    accountNumber,
                    customerId: data.customerId,
                    accountType: data.accountType,

                },
                select: {
                    accountId: true,
                    accountNumber: true,
                    accountType: true,
                    balance: true,
                    status: true
                }
            } );
        } catch ( error )
        {
            this.handlePrismaError( error, 'createAccount' );
        }
    }

    async setBallance ( accountId: string, balance: number )
    {
        try
        {
            return await this.prisma.accounts.update( {
                where: { accountId },
                data: { balance },
                select: {
                    accountId: true,
                    accountNumber: true,
                    accountType: true,
                    balance: true,
                    status: true
                }
            } );
        } catch ( error )
        {
            this.handlePrismaError( error, 'setBallance' );
        }
    }

    async getAccountStatusByAccountId ( accountId: string )
    {
        try
        {
            return await this.prisma.accounts.findUnique( {
                where: { accountId },
                select: {
                    accountId: true,
                    accountNumber: true,
                    accountType: true,
                    balance: true,
                    status: true
                }
            } );
        } catch ( error )
        {
            this.handlePrismaError( error, 'getAccountStatusByAccountId' );
        }
    }

    async updateAccountStatus ( accountId: string, status: AccountStatus )
    {
        try
        {
            return await this.prisma.accounts.update( {
                where: { accountId },
                data: { status },
                select: {
                    accountId: true,
                    accountNumber: true,
                    accountType: true,
                    balance: true,
                    status: true
                }
            } );
        } catch ( error )
        {
            this.handlePrismaError( error, 'updateAccountStatus' );
        }
    }

    async getAccountByAccountNumber ( accountNumber: string )
    {
        try
        {
            return await this.prisma.accounts.findUnique( {
                where: { accountNumber },
                select: {
                    accountId: true,
                    accountNumber: true,
                    accountType: true,
                    balance: true,
                    status: true
                }
            } );
        } catch ( error )
        {
            this.handlePrismaError( error, 'getAccountByAccountNumber' );
        }
    }

    async getAllAccountByCustomerId ( customerId: string )
    {
        try
        {
            return await this.prisma.accounts.findMany( {
                where: { customerId },
                select: {
                    accountId: true,
                    accountNumber: true,
                    accountType: true,
                    balance: true,
                    status: true
                }
            } );
        } catch ( error )
        {
            this.handlePrismaError( error, 'getAccountByCustomerId' );
        }
    }

    async getAccountByAccountId ( accountId: string )
    {
        try
        {
            return await this.prisma.accounts.findUnique( {
                where: { accountId },
                select: {
                    accountId: true,
                    accountNumber: true,
                    accountType: true,
                    balance: true,
                    status: true
                }
            } );
        } catch ( error )
        {
            this.handlePrismaError( error, 'getAccountByAccountId' );
        }
    }

    async withDrawBlance ( accountId: string, amount: number )
    {
        try
        {
            return await this.prisma.accounts.update( {
                where: { accountId },
                data: { balance: { decrement: amount } },
                select: {
                    accountId: true,
                    accountNumber: true,
                    accountType: true,
                    balance: true,
                    status: true
                }
            } );
        } catch ( error )
        {
            this.handlePrismaError( error, 'withDrawBlance' );
        }
    }

    async disableAccount ( accountId: string )
    {
        try
        {
            return await this.prisma.accounts.update( {
                where: { accountId },
                data: { status: AccountStatus.INACTIVE }
            } );
        } catch ( error )
        {
            this.handlePrismaError( error, 'disableAccount' );
        }
    }

    async enableAccount ( accountId: string )
    {
        try
        {
            return await this.prisma.accounts.update( {
                where: { accountId },
                data: { status: AccountStatus.ACTIVE }
            } );
        } catch ( error )
        {
            this.handlePrismaError( error, 'enableAccount' );
        }
    }

} 
