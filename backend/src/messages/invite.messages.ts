import { BASE_MESSAGES } from './base.messages';

export const INVITE_MESSAGES = {
  ...BASE_MESSAGES,
  INVALID: 'Código de convite inválido ou expirado.',
  ALREADY_IN_GROUP: 'Você já está neste grupo.',
  REGENERATED: 'Código de convite regenerado com sucesso.',
  REVOKED: 'Código de convite revogado com sucesso.',
  FORBIDDEN: 'Você não tem permissão para gerenciar convites deste grupo.',
  GENERATION_FAILED: 'Não foi possível gerar um código de convite. Tente novamente.',
};
