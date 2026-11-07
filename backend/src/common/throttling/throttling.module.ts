import { Global, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppThrottlerGuard } from './app-throttler.guard';
import { RouteThrottlerGuard } from './route-throttler.guard';
import { THROTTLE_GLOBAL_LIMIT, THROTTLE_GLOBAL_TTL_MS } from './throttling.constants';
import { UserThrottlerGuard } from './user-throttler.guard';

@Global()
@Module({
  imports: [
    JwtModule.register({}),
    ThrottlerModule.forRoot([
      {
        name: 'global',
        ttl: THROTTLE_GLOBAL_TTL_MS,
        limit: THROTTLE_GLOBAL_LIMIT,
      },
      {
        name: 'default',
        ttl: THROTTLE_GLOBAL_TTL_MS,
        limit: THROTTLE_GLOBAL_LIMIT,
      },
    ]),
  ],
  providers: [
    AppThrottlerGuard,
    RouteThrottlerGuard,
    UserThrottlerGuard,
    {
      provide: APP_GUARD,
      useClass: AppThrottlerGuard,
    },
  ],
  exports: [RouteThrottlerGuard, UserThrottlerGuard],
})
export class ThrottlingModule {}
