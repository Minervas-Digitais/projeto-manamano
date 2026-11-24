// 0, negativos e NaN caem no default para não desligar a expiração por acidente.
function envNumber(name: string, fallback: number): number {
  const value = Number(process.env[name]);

  return Number.isFinite(value) && value > 0 ? value : fallback;
}

export const INVITE_TTL_DAYS = envNumber('INVITE_EXPIRES_IN_DAYS', 7);
export const INVITE_TTL_MS = INVITE_TTL_DAYS * 24 * 60 * 60 * 1000;
