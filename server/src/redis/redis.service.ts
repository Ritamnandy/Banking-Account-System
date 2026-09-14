import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy
{
    private readonly logger = new Logger( RedisService.name )
    private readonly redis: Redis
    constructor ( private readonly configService: ConfigService )
    {
        this.redis = new Redis( {
            host: this.configService.getOrThrow( 'REDIS_HOST' ),
            port: this.configService.getOrThrow( 'REDIS_PORT' ),
            maxRetriesPerRequest: null,
        } )
        this.redis.on( 'connect', () => this.logger.log( 'Redis connected' ) )
        this.redis.on( 'error', ( err ) => this.logger.error( 'Redis error', err ) );
    }

    async get ( key: string ): Promise<string | null>
    {
        return await this.redis.get( key )
    }

    async set ( key: string, data: string, ttl: number ): Promise<string | null>
    {
        return await this.redis.set( key, data, 'EX', ttl )
    }
    async delete ( key: string ): Promise<void>
    {
        await this.redis.del( key )
    }
    getClient (): Redis
    {
        return this.redis;
    }
    async onModuleDestroy ()
    {
        await this.redis.quit()
        this.logger.warn( 'Redis disconnect' )
    }
    
}
