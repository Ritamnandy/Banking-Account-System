import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthguardsGuard } from '../auth/authguards/authguards.guard.js';
import { RoleGuard } from '../auth/role/role.guard.js';
import  { UserService } from './user.service.js';
import type { AuthenticatedRequest } from '../auth/types/authenticated-request..types.js';
import { Roles } from '../auth/role/role.decorator.js';
import { Role,  UserStatus } from '../Types/types.js';


@Controller( 'user' )
@UseGuards( AuthguardsGuard, RoleGuard )
export class UserController
{
  constructor ( private readonly userService: UserService ) { }

  @Get( 'me' )
  @HttpCode( HttpStatus.OK )
  @Roles( Role.ADMIN, Role.USER )
  getMe ( @Req() req: AuthenticatedRequest )
  {
    return this.userService.getCurrentuser( req.user.id );
  }

  @Get()
  @HttpCode( HttpStatus.OK )
  @Roles( Role.ADMIN )
  async findAll ()
  {
    const response = await this.userService.getAllUsers();
    return {
      message: 'Users retrieved successfully',
      data: response
    }
  }

  @Get( ':id' )
  @HttpCode( HttpStatus.OK )
  @Roles( Role.ADMIN )
  async getUserById ( @Param( 'id' ) id: string )
  {
    return this.userService.getCurrentuser( id );
  }

  @Patch( ':id/status' )
  @HttpCode( HttpStatus.OK )
  @Roles( Role.ADMIN )
  async updateUserStatus ( @Param( 'id' ) id: string, @Body() body: { status: UserStatus } )
  {
    return this.userService.updateUserStatus( id, body.status );
  }

}
