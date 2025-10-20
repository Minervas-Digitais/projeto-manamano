import { BASE_MESSAGES } from './base.messages';

export const COMMENT_MESSAGES = {
  ...BASE_MESSAGES,
  NOT_FOUND: 'Comentário não encontrado.',
  POST_NOT_FOUND: 'Post relacionado ao comentário não encontrado.',
  UNAUTHORIZED_CREATE: 'Você não pode comentar em nome de outro usuário.',
  UNAUTHORIZED_DELETE: 'Você não tem permissão para deletar este comentário.',
  SENDER_NOT_FOUND: 'Usuário remetente não encontrado.'
};
