import { BASE_MESSAGES } from './base.messages';

export const POST_MESSAGES = {
  ...BASE_MESSAGES,
  NOT_FOUND: 'Publicação não encontrada.',
  NO_POST_IN_LIST: 'Nenhuma publicação encontrada.',
  NO_POST_IN_GROUP: 'Nenhuma publicação encontrada neste grupo.',
  NO_POST_IN_CATEGORY: 'Nenhuma publicação encontrada nesta categoria.',
  NO_POST_IN_USER: 'Nenhuma publicação encontrada para este usuário.',
  CANNOT_SAVE_OWN: 'Você não pode salvar sua própria publicação.',
  NO_SAVED_POSTS: 'Nenhuma publicação salva',
  ALREADY_SAVED: 'Post já está salvo.',
  POST_NOT_SAVED: 'Post não está salvo.',
  POST_PINNED_STATUS_UNCHANGED: 'O post já está com esse status.'
};
