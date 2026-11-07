import { ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { getOptionsToken, getStorageToken, ThrottlerGuard } from '@nestjs/throttler';
import type { ThrottlerModuleOptions, ThrottlerStorage } from '@nestjs/throttler';
import { ipTracker } from './throttle-trackers';

@Injectable()
export class AppThrottlerGuard extends ThrottlerGuard {
  constructor(
    @Inject(getOptionsToken()) options: ThrottlerModuleOptions,
    @Inject(getStorageToken()) storage: ThrottlerStorage,
    reflector: Reflector,
    private readonly jwtService: JwtService,
  ) {
    super(options, storage, reflector);
  }

  async onModuleInit(): Promise<void> {
    await super.onModuleInit();
    this.throttlers = this.throttlers.filter((throttler) => throttler.name === 'global');
  }

  protected async getTracker(req: Record<string, any>): Promise<string> {
    if (typeof req.__throttleTracker === 'string') return req.__throttleTracker;

    const authorization = req.headers?.authorization;

    if (typeof authorization === 'string' && authorization.startsWith('Bearer ')) {
      try {
        const payload = await this.jwtService.verifyAsync<{ sub?: string }>(
          authorization.slice('Bearer '.length),
          { secret: process.env.JWT_ACCESS_SECRET },
        );

        if (payload?.sub) {
          req.__throttleTracker = `user:${payload.sub}`;
          return req.__throttleTracker;
        }
      } catch {
        // Token inválido/expirado: cai no limite por IP.
      }
    }

    req.__throttleTracker = ipTracker(req);
    return req.__throttleTracker;
  }

  protected generateKey(context: ExecutionContext, tracker: string, name: string): string {
    if (name === 'global') return `global:${tracker}`;

    return super.generateKey(context, tracker, name);
  }
}
