import { useEffect } from 'react';
import Toast from 'react-native-toast-message';
import { navigationRef } from '../../navigation/navigationRef';
import { useAuth } from './useAuth';

/**
 * Reage ao encerramento da sessão disparado pelo serviço de API (refresh token
 * rejeitado pelo servidor). Mostra uma mensagem clara e leva a pessoa de volta
 * ao login, evitando telas em branco sem explicação.
 */
export function SessionExpiredHandler() {
  const { sessionExpired, acknowledgeSessionExpired } = useAuth();

  useEffect(() => {
    if (!sessionExpired) return;

    Toast.show({
      type: 'info',
      text1: 'Sessão encerrada',
      text2: 'Sua sessão expirou ou foi encerrada em outro dispositivo. Entre novamente.',
    });

    if (navigationRef.isReady()) {
      navigationRef.reset({ index: 0, routes: [{ name: 'SignIn' }] });
    }

    acknowledgeSessionExpired();
  }, [sessionExpired, acknowledgeSessionExpired]);

  return null;
}
