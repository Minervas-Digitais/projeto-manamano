import { BASE_MESSAGES } from './base.messages';

export const AUTH_MESSAGES = {
  ...BASE_MESSAGES,
  FORGOT_PASSWORD_REQUESTED:
    'Se o e-mail informado estiver cadastrado, você receberá um código de verificação em instantes.',
  INVALID_OR_EXPIRED_CODE: 'Código inválido ou expirado. Se necessário, solicite um novo código.',
  PASSWORD_RESET_SUCCESS: 'Senha redefinida com sucesso. Faça login com a nova senha.',
  PASSWORD_RESET_NOT_CONFIGURED: 'Recuperação de senha indisponível no momento.',
};
