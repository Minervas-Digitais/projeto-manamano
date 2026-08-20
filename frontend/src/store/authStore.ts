import * as SecureStore from 'expo-secure-store';

type AuthState = {
  accessToken: string | null;
  loggedId: string | null;
  isLoading: boolean;
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
};

const listeners = new Set<Listener>();

function setState(patch: Partial<AuthState>) {
  state = { ...state, ...patch };
  listeners.forEach((listener) => listener());
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
    setState({ accessToken, loggedId, isLoading: false });
  },

  async updateTokens(accessToken: string, refreshToken: string) {
    await SecureStore.setItemAsync(STORAGE_KEYS.refreshToken, refreshToken);
    setState({ accessToken, isLoading: false });
  },

  async clearSession() {
    await SecureStore.deleteItemAsync(STORAGE_KEYS.refreshToken);
    await SecureStore.deleteItemAsync(STORAGE_KEYS.loggedId);
    setState({ accessToken: null, loggedId: null, isLoading: false });
  },
};

export default authStore;
