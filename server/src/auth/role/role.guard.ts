import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import type { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { ROLES_KEY } from './role.decorator.js';
import type { Role } from '../../Types/types.js';
import type { AuthenticatedRequest } from '../types/authenticated-request..types.js';

@Injectable()
export class RoleGuard implements CanActivate
{
  constructor ( private readonly reflector: Reflector ) { }

  canActivate (
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean>
  {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>( ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ] );

    // No @Roles() decorator means route is open to any authenticated user
    if ( !requiredRoles )
    {
      return true;
    }
    const { user } = context.switchToHttp().getRequest<AuthenticatedRequest>();

    return requiredRoles.some( ( role ) => user.role?.includes( role ) );
  }
}
