import { Injectable } from '@nestjs/common';
import type { AuthRepository } from '../repositories/auth.repository.js';
import type { Role, UserStatus } from '../Types/types.js';
import type { RedisService } from '../redis/redis.service.js';


@Injectable()
export class UserService
{
  constructor (
    private readonly redisService: RedisService,
    private readonly authRepocitory: AuthRepository ) { }

  //TODO: Allow users and admins to view any user's data
  async getCurrentuser ( userId: string )
  {
    const cachedUser = await this.redisService.get( `user:${ userId }` );
    if ( cachedUser )
    {
      return JSON.parse( cachedUser );
    }
    const user = await this.authRepocitory.findById( userId );
    this.redisService.set( `user:${ userId }`, JSON.stringify( user ), 60 * 5 );
    return user;
  }

  // TODO: Allow admins to update,delete and retrived any user's data
  async updateUserStatus ( userId: string, data: UserStatus )
  {
    return this.authRepocitory.updateStatus( userId, data );
  }

  async getAllUsers ()
  {
    return this.authRepocitory.getAllUsers();
  }

  async deleteUser ( userId: string )
  {
    return this.authRepocitory.deleteUser( userId );
  }

  async updateRole ( userId: string, role: Role )
  {
    return this.authRepocitory.updateRole( userId, role );
  }

} 
