import { isAxiosError } from 'axios';
import Toast from 'react-native-toast-message';

const GENERIC_ERROR = 'Não foi possível concluir a solicitação. Tente novamente em instantes.';

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

export function isBadRequest(error: unknown) {
  return isAxiosError(error) && error.response?.status === 400;
}
