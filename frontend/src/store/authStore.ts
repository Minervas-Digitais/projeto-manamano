import * as SecureStore from 'expo-secure-store';
import localStorage from '../services/localStorage';

type AuthState = {
  accessToken: string | null;
  loggedId: string | null;
  isLoading: boolean;
  sessionExpired: boolean;
};

type Listener = () => void;

type SessionInput = {
  accessToken: string;
  refreshToken: string;
  loggedId: string;
};

const STORAGE_KEYS = {
  refreshToken: 'refreshToken',
  loggedId: 'loggedId',
} as const;

let state: AuthState = {
  accessToken: null,
  loggedId: null,
  isLoading: true,
  sessionExpired: false,
};

const listeners = new Set<Listener>();

function setState(patch: Partial<AuthState>) {
  state = { ...state, ...patch };
  listeners.forEach((listener) => listener());
}

/**
 * Remove os dados persistidos de uma sessão: tokens do armazenamento seguro e
 * caches não sensíveis do MMKV. Usado tanto no logout explícito quanto no
 * encerramento forçado pelo servidor.
 */
async function clearPersistedSession() {
  await SecureStore.deleteItemAsync(STORAGE_KEYS.refreshToken);
  await SecureStore.deleteItemAsync(STORAGE_KEYS.loggedId);

  try {
    localStorage.clearAll();
  } catch {
    /* MMKV indisponível: não impede o encerramento da sessão. */
  }
}

const authStore = {
  getState: () => state,

  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  async getRefreshToken() {
    return SecureStore.getItemAsync(STORAGE_KEYS.refreshToken);
  },

  async loadSession() {
    const [refreshToken, loggedId] = await Promise.all([
      SecureStore.getItemAsync(STORAGE_KEYS.refreshToken),
      SecureStore.getItemAsync(STORAGE_KEYS.loggedId),
    ]);

    if (!refreshToken) {
      setState({ isLoading: false });
      return false;
    }

    setState({ loggedId, isLoading: true });
    return true;
  },

  async setSession({ accessToken, refreshToken, loggedId }: SessionInput) {
    await SecureStore.setItemAsync(STORAGE_KEYS.refreshToken, refreshToken);
    await SecureStore.setItemAsync(STORAGE_KEYS.loggedId, loggedId);
    setState({ accessToken, loggedId, isLoading: false, sessionExpired: false });
  },

  async updateTokens(accessToken: string, refreshToken: string) {
    await SecureStore.setItemAsync(STORAGE_KEYS.refreshToken, refreshToken);
    setState({ accessToken, isLoading: false });
  },

  /**
   * Encerra a sessão de forma explícita (o próprio usuário saiu).
   */
  async clearSession() {
    await clearPersistedSession();
    setState({ accessToken: null, loggedId: null, isLoading: false, sessionExpired: false });
  },

  /**
   * Encerra a sessão porque o servidor rejeitou o refresh token (expirou ou foi
   * invalidado por um novo login em outro aparelho). Sinaliza para a interface
   * avisar a pessoa e levá-la de volta ao login, em vez de sumir silenciosamente.
   */
  async expireSession() {
    await clearPersistedSession();
    setState({ accessToken: null, loggedId: null, isLoading: false, sessionExpired: true });
  },

  /**
   * Falha transitória (rede/timeout) na renovação: mantém a sessão guardada e
   * apenas libera a interface, para não deslogar a pessoa sem motivo.
   */
  finishLoading() {
    if (state.isLoading) {
      setState({ isLoading: false });
    }
  },

  acknowledgeSessionExpired() {
    if (state.sessionExpired) {
      setState({ sessionExpired: false });
    }
  },
};

export default authStore;
