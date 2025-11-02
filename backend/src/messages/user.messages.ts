import { BASE_MESSAGES } from './base.messages';

export const USER_MESSAGES = {
  ...BASE_MESSAGES,
  DELETE_SUCCESS: 'Usuário deletado com sucesso.',
  EMPTY_LIST: 'Não há usuários cadastrados.',
  EMAIL_OR_PHONE_IN_USE: 'Email ou telefone já está em uso.',
  INVALID_PASSWORD: 'Senha inválida.',
  PROFILE_PICTURE_NOT_FOUND: 'Foto de perfil não encontrada.',
  SAME_PASSWORD: 'A nova senha não pode ser igual à senha antiga.',
};
