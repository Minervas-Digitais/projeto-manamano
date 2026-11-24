import { randomBytes } from 'crypto';

export const INVITE_CODE_LENGTH = 8;
export const INVITE_CODE_MAX_ATTEMPTS = 5;

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

// 256 não é múltiplo de 62: descartar bytes >= 248 evita viés de módulo.
const MAX_UNBIASED_BYTE = Math.floor(256 / ALPHABET.length) * ALPHABET.length;

/**
 * Gera um código de convite com entropia criptográfica.
 * Mantém o formato de 8 caracteres alfanuméricos usado pelo produto.
 */
export function generateInviteCode(length: number = INVITE_CODE_LENGTH): string {
  let code = '';

  while (code.length < length) {
    for (const byte of randomBytes(length * 2)) {
      if (byte >= MAX_UNBIASED_BYTE) continue;

      code += ALPHABET[byte % ALPHABET.length];

      if (code.length === length) break;
    }
  }

  return code;
}
