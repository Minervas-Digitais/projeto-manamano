import { Injectable, UnauthorizedException } from '@nestjs/common';
import { RouteThrottlerGuard } from './route-throttler.guard';

@Injectable()
export class UserThrottlerGuard extends RouteThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    const userId = req.user?.id;

    if (!userId) {
      throw new UnauthorizedException('Usuário não autenticado.');
    }

    return `user:${userId}`;
  }
}
