import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { AccountsService } from './accounts.service.js';
import { CreateAccountDto } from './dto/create-account.dto.js';

import { AuthguardsGuard } from '../auth/authguards/authguards.guard.js';
import { SetBallanceDto } from './dto/setBallance.dto.js';


@Controller( 'accounts' )
@UseGuards( AuthguardsGuard )
export class AccountsController
{
  constructor ( private readonly accountsService: AccountsService ) { }

  @Post( ':customerId' )
  @HttpCode( HttpStatus.CREATED )
  async create (
    @Body() createAccountDto: CreateAccountDto,
    @Param( 'customerId' ) customerId: string )
  {
    const response = await this.accountsService.create( createAccountDto, customerId );
    return {
      message: 'Account created successfully',
      data: response
    }
  }

  @Post( 'accountId' )
  async setBalance ( @Param( 'accountId' ) accountId: string, @Body() setBallanceDto: SetBallanceDto )
  {
    const response = await this.accountsService.setBalance( accountId, setBallanceDto.balance );
    return {
      message: 'Balance set successfully',
      data: response
    }
  }

  @Post( ':accountId' )
  async withDrawBalance ( @Param( 'accountId' ) accountId: string, @Body() BallanceDto: SetBallanceDto )
  {
    const response = await this.accountsService.withDrawBalance( accountId, BallanceDto.balance );
    return {
      message: 'Balance withdrawn successfully',
      data: response
    }
  }

  @Get( ':accountId' )
  async getAccount ( @Param( 'accountId' ) accountId: string )
  {
    const response = await this.accountsService.getAccountStatus( accountId );
    return {
      message: 'Account status retrieved successfully',
      data: response
    }
  }

  @Delete( ':accountId' )
  async remove ( @Param( 'accountId' ) accountId: string )
  {
    const respose = await this.accountsService.disibleAccount( accountId );
    return {
      message: 'Account disabled successfully',
      data: respose
    }
  }

}
