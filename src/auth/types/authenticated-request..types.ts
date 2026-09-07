import type { Request } from 'express';
import type { JwtPayLoad } from './payload.types.js';

export interface AuthenticatedRequest extends Request
{
    user: JwtPayLoad;
    cookies: Record<string, string | undefined>;
}