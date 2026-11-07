import { normalizeIp } from '@nestjs/throttler';

type Req = Record<string, any>;

export function ipTracker(req: Req): string {
  return `ip:${normalizeIp(req.ip)}`;
}

export function accountTracker(req: Req): string {
  const email = req.body?.email;

  if (typeof email === 'string' && email.trim()) {
    return `account:${email.trim().toLowerCase()}`;
  }

  return ipTracker(req);
}
