import { Injectable } from '@nestjs/common';
import { CreateAccountDto } from './dto/create-account.dto.js';
import { UpdateAccountDto } from './dto/update-account.dto.js';
import { AccountRepository } from './account.repository.js';
import { RedisService } from '../redis/redis.service.js';
import { generateAccountNumber } from './constants.js';

@Injectable()
export class AccountsService
{
  constructor (
    private readonly accountRepository: AccountRepository,
    private readonly redisService: RedisService

  ) { }


  async create ( createAccountDto: CreateAccountDto, customerId: string )
  {
    const accountNumber = generateAccountNumber()
    return this.accountRepository.createAccount( createAccountDto, accountNumber )
  }

  async setBalance ( accountId: string, balance: number )
  {
    return this.accountRepository.setBallance( accountId, balance )
  }

  async getAccountStatus ( accountId: string )
  {
    const cachedData = await this.redisService.get( `account:${ accountId }:status` )
    if ( cachedData )
    {
      return JSON.parse( cachedData )
    }
    const accountStatus = await this.accountRepository.getAccountStatusByAccountId( accountId )
    await this.redisService.set( `account:${ accountId }:status`, JSON.stringify( accountStatus ), 60 * 5 )
    return accountStatus
  }

  async withDrawBalance ( accountId: string, amount: number )
  {
    return this.accountRepository.withDrawBlance( accountId, amount )
  }

  async disibleAccount ( accountId: string )
  {
    await this.redisService.delete( `account:${ accountId }:status` )
    return this.accountRepository.disableAccount( accountId )
  }

  async enableAccount ( accountId: string )
  {
    await this.redisService.delete( `account:${ accountId }:status` )
    return this.accountRepository.enableAccount( accountId )
  }

}
