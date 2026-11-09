import { normalizeIp } from '@nestjs/throttler';

type Req = Record<string, any>;

export function ipTracker(req: Req): string {
  return `ip:${normalizeIp(req.ip)}`;
}

// Guards executam antes do ValidationPipe, então normalizamos aqui da mesma
// forma que CreateUserDto/LoginDto e o banco (e-mail sempre em minúsculas).
export function accountTracker(req: Req): string {
  const email = req.body?.email;

  if (typeof email === 'string' && email.trim()) {
    return `account:${email.trim().toLowerCase()}`;
  }

  return ipTracker(req);
}
