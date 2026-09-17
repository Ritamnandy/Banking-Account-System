import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, UseGuards, Query } from '@nestjs/common';
import { CustomersService } from './customers.service.js';
import { CreateCustomerDto } from './dto/create-customer.dto.js';
import { UpdateCustomerDto } from './dto/update-customer.dto.js';
import { Roles } from '../auth/role/role.decorator.js';
import { Role } from '../Types/types.js';
import { AuthguardsGuard } from '../auth/authguards/authguards.guard.js';
import { RoleGuard } from '../auth/role/role.guard.js';
import { UserStatus } from '../../generated/prisma/enums.js';
import { CustomerStatus } from './dto/status.dto.js';


@Controller( 'customers' )
@UseGuards( AuthguardsGuard, RoleGuard )
export class CustomersController
{
  constructor ( private readonly customersService: CustomersService ) { }

  @Post( 'create' )
  @HttpCode( HttpStatus.CREATED )
  @Roles( Role.EMPLOYEE, Role.ADMIN )
  async create ( @Body() createCustomerDto: CreateCustomerDto )
  {
    const response = await this.customersService.create( createCustomerDto );
    return {
      message: 'Customer created successfully ',
      customer: response
    };
  }

  @Get()
  @HttpCode( HttpStatus.OK )
  @Roles( Role.EMPLOYEE, Role.ADMIN )
  async findAll ()
  {
    return await this.customersService.findAll();
  }

  @Get( ':id' )
  @HttpCode( HttpStatus.OK )
  @Roles( Role.EMPLOYEE, Role.ADMIN )
  async findOne ( @Param( 'id' ) id: string )
  {
    return await this.customersService.findOne( id );
  }

  @Patch( ':id' )
  @HttpCode( HttpStatus.OK )
  @Roles( Role.EMPLOYEE, Role.ADMIN )
  async update ( @Param( 'id' ) id: string, @Body() updateCustomerDto: UpdateCustomerDto )
  {
    return await this.customersService.update( id, updateCustomerDto );
  }

  @Delete( ':id' )
  @HttpCode( HttpStatus.OK )
  @Roles( Role.ADMIN )
  remove ( @Param( 'id' ) id: string )
  {
    return this.customersService.remove( id );
  }

  @Patch( 'status/:id' )
  @HttpCode( HttpStatus.OK )
  @Roles( Role.ADMIN, Role.EMPLOYEE )
  setStatus ( @Param( 'id' ) id: string, @Body() status: UserStatus )
  {
    return this.customersService.setCustomerStatus( id, status );
  }

  @Patch( 'inactive' )
  @HttpCode( HttpStatus.OK )
  @Roles( Role.ADMIN, Role.EMPLOYEE )
  deactivate ( @Body() ids: string )
  {
    return this.customersService.inActiveCustomer( ids );
  }

  @Get( 'status' )
  @HttpCode( HttpStatus.OK )
  @Roles( Role.ADMIN, Role.EMPLOYEE )
  async findCustomerByStatus ( @Query( 'status' ) status: CustomerStatus )
  {
    return this.customersService.findCustomerByStatus( status.status );
  }

}
