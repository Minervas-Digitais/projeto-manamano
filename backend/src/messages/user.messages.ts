import { BASE_MESSAGES } from './base.messages';

export const USER_MESSAGES = {
  ...BASE_MESSAGES,
  DELETE_SUCCESS: 'Usuário deletado com sucesso.',
  REGISTRATION_CONFLICT: 'Não foi possível concluir o cadastro. Verifique os dados informados.',
  INVALID_PASSWORD: 'Senha inválida.',
  PROFILE_PICTURE_NOT_FOUND: 'Foto de perfil não encontrada.',
  SAME_PASSWORD: 'A nova senha não pode ser igual à senha antiga.',
};
