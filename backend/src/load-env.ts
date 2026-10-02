import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

const rootEnv = resolve(__dirname, '../../.env');

if (existsSync(rootEnv)) {
  const vars: Record<string, string> = {};

  for (const line of readFileSync(rootEnv, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=(.*)$/);
    if (!match) continue;

    const key = match[1];
    if (process.env[key] !== undefined) continue;

    let value = match[2].trim();
    if (value.startsWith('"') || value.startsWith("'")) {
      value = value.slice(1, -1);
    } else {
      const comment = value.indexOf(' #');
      if (comment !== -1) {
        value = value.slice(0, comment).trim();
      }
    }
    vars[key] = value;
  }

  const expand = (value: string, depth: number): string => {
    if (depth > 5) return value;
    return value.replace(
      /\$\{([^}]+)\}|\$([A-Za-z_][A-Za-z0-9_]*)/g,
      (whole, braced: string | undefined, bare: string | undefined) => {
        const name = braced ?? bare;
        const target = vars[name] ?? process.env[name];
        if (target === undefined) return whole;
        return expand(target, depth + 1);
      },
    );
  };

  for (const key of Object.keys(vars)) {
    process.env[key] = expand(vars[key], 0);
  }
}
