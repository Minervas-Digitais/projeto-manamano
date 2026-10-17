import * as SecureStore from 'expo-secure-store';
import authStore from '../store/authStore';
import localStorage from '../services/localStorage';

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

jest.mock('../services/localStorage', () => ({
  __esModule: true,
  default: {
    clearAll: jest.fn(),
    getString: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('authStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('clearSession', () => {
    it('deve limpar as chaves de sessão no SecureStore e limpar o localStorage (MMKV)', async () => {
      await authStore.clearSession();

      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('refreshToken');
      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('loggedId');
      expect(localStorage.clearAll).toHaveBeenCalled();

      const state = authStore.getState();
      expect(state.accessToken).toBeNull();
      expect(state.loggedId).toBeNull();
    });
  });
});
