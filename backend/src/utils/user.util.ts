import { User } from '@prisma/client';

export function omitHash(user: User): Omit<User, 'hash'> {
  const { hash, ...userWithoutHash } = user;
  return userWithoutHash;
}
