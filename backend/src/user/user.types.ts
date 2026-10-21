import { User } from '@prisma/client';

/**
 * Campos de um usuário que nunca devem sair da API.
 */
export type UserSecretFields = 'hash' | 'refreshToken' | 'pushNotifToken';

/**
 * Perfil completo do próprio usuário (ou de um administrador): inclui dados de
 * contato e papel de sistema, mas não os segredos.
 */
export type UserPrivateFields = Omit<User, UserSecretFields>;

/**
 * Projeção pública exibida quando alguém consulta o perfil de outra pessoa.
 */
export type UserPublicFields = {
  id: string;
  fullName: string;
  bio?: string | null;
  enterprise?: string | null;
  expertise?: string | null;
  neighborhood?: string | null;
  ethnicity?: string | null;
  birthday?: Date | null;
  profilePictureId?: string | null;
};
