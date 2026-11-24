import { Prisma } from '@prisma/client';

/**
 * Identifica violação de constraint única do Prisma (ex.: colisão de inviteCode).
 */
export function isUniqueViolation(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
}
