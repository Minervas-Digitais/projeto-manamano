/* eslint-disable @typescript-eslint/no-unused-vars */
import { User } from '@prisma/client';
import { UserPrivateFields, UserPublicFields } from './user.types';

/**
 * Remove os campos secretos de um usuário. Usado quando o próprio usuário (ou um
 * administrador) pode ver os dados de contato, mas nunca os segredos
 */
export function toPrivateUser(user: User): UserPrivateFields {
  const { hash, refreshToken, pushNotifToken, ...userSafe } = user;
  return userSafe;
}

/**
 * Projeção pública de um usuário, exposta quando a pessoa que consulta está
 * vendo o perfil de outra pessoa.
 */
export function toPublicUser(user: User): UserPublicFields {
  return {
    id: user.id,
    fullName: user.fullName,
    bio: user.bio,
    enterprise: user.enterprise,
    expertise: user.expertise,
    neighborhood: user.neighborhood,
    ethnicity: user.ethnicity,
    birthday: user.birthday,
    profilePictureId: user.profilePictureId,
  };
}
