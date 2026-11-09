export function resolveTrustProxy(value = process.env.TRUST_PROXY): boolean | number | string {
  if (value === undefined || value === '' || value === 'false' || value === '0') return false;
  if (value === 'true') return true;

  const numeric = Number(value);
  if (Number.isInteger(numeric) && numeric >= 0) return numeric;

  return value;
}
