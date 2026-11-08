import { isAxiosError } from 'axios';
import Toast from 'react-native-toast-message';

const GENERIC_ERROR = 'Não foi possível concluir a solicitação. Tente novamente em instantes.';

// Mantém o mesmo texto de AUTH_MESSAGES.INVALID_OR_EXPIRED_RESET_TOKEN no backend.
export const EXPIRED_RESET_TOKEN_MESSAGE = 'Sua solicitação expirou. Solicite um novo código.';

function getErrorMessage(error: unknown) {
  if (!isAxiosError(error)) return GENERIC_ERROR;
  if (!error.response) {
    return 'Não foi possível conectar. Verifique sua internet e tente novamente.';
  }

  const { status, data } = error.response;
  if (status === 429) return 'Muitas tentativas. Aguarde alguns minutos e tente novamente.';
  if (status >= 500) return 'Recuperação de senha indisponível no momento. Tente mais tarde.';

  const backendMessage = data?.message;
  if (Array.isArray(backendMessage)) return backendMessage.join('\n');
  return backendMessage || GENERIC_ERROR;
}

export function showForgotPasswordError(error: unknown) {
  Toast.show({ type: 'error', text1: 'Erro', text2: getErrorMessage(error) });
}

/**
 * Só trata como "solicitação expirada" o 400 específico de resetToken inválido.
 * Outros 400 (ex.: validação do DTO) devem exibir a mensagem real do backend.
 */
export function isExpiredResetToken(error: unknown) {
  if (!isAxiosError(error) || error.response?.status !== 400) return false;

  const backendMessage = error.response.data?.message;
  const message = Array.isArray(backendMessage) ? backendMessage.join('\n') : backendMessage;

  return message === EXPIRED_RESET_TOKEN_MESSAGE;
}
