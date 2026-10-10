import { BASE_MESSAGES } from './base.messages';

export const PARTICIPANT_MESSAGES = {
  ...BASE_MESSAGES,
  INVALID_INVITE_CODE: 'Código de convite inválido.',
  ALREADY_IN_GROUP: 'Você já está neste grupo.',
  NOT_FOUND: 'Participante não encontrado.',
  DELETE_SUCCESS: 'Usuário removido com sucesso.',
  INVALID_ID_FORMAT: 'Formato do id invalido.',
  REMOVE_LAST_INSTRUCTOR: 'Não é possível remover o último instrutor.',
};
