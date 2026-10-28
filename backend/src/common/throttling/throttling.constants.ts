function envNumber(name: string, fallback: number): number {
  const value = Number(process.env[name]);

  return Number.isFinite(value) && value > 0 ? value : fallback;
}

export const THROTTLE_GLOBAL_TTL_MS = envNumber('THROTTLE_TTL_MS', 60000);
export const THROTTLE_GLOBAL_LIMIT = envNumber('THROTTLE_LIMIT', 100);

export const THROTTLE_LOGIN_TTL_MS = envNumber('THROTTLE_LOGIN_TTL_MS', 60000);
export const THROTTLE_LOGIN_LIMIT = envNumber('THROTTLE_LOGIN_LIMIT', 5);

export const THROTTLE_REGISTER_TTL_MS = envNumber('THROTTLE_REGISTER_TTL_MS', 600000);
export const THROTTLE_REGISTER_LIMIT = envNumber('THROTTLE_REGISTER_LIMIT', 5);
