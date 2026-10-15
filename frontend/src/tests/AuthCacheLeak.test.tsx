import React from 'react';
import { render, waitFor, act } from '@testing-library/react-native';
import * as SecureStore from 'expo-secure-store';
import authStore from '../store/authStore';
import localStorage from '../services/localStorage';
import { SavedPostsProvider, useSavedPosts } from '../context/SavedPostsContext';
import { AuthContext } from '../context/auth/AuthContext';
import api from '../services/api';

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

jest.mock('../services/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('Evitar vazamento de caches no logout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('authStore.clearSession', () => {
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

  describe('SavedPostsProvider', () => {
    function ConsumerComponent({ onValues }: { onValues: (ids: Set<string>) => void }) {
      const { savedPostIds } = useSavedPosts();
      onValues(savedPostIds);
      return null;
    }

    it('deve limpar savedPostIds ao deslogar (loggedId torna-se null)', async () => {
      (api.get as jest.Mock).mockResolvedValueOnce({
        data: {
          data: [{ id: 'post-1' }, { id: 'post-2' }],
          meta: { page: 1, lastPage: 1 },
        },
      });

      let currentSavedIds = new Set<string>();
      const handleValues = (ids: Set<string>) => {
        currentSavedIds = ids;
      };

      const authValue1: any = {
        loggedId: 'user-1',
        isLoading: false,
        login: jest.fn(),
        logout: jest.fn(),
      };

      const { rerender } = render(
        <AuthContext.Provider value={authValue1}>
          <SavedPostsProvider>
            <ConsumerComponent onValues={handleValues} />
          </SavedPostsProvider>
        </AuthContext.Provider>,
      );

      await waitFor(() => {
        expect(currentSavedIds.has('post-1')).toBe(true);
        expect(currentSavedIds.has('post-2')).toBe(true);
      });

      // Simula o logout mudando loggedId para null
      const authValueLoggedOut: any = {
        loggedId: null,
        isLoading: false,
        login: jest.fn(),
        logout: jest.fn(),
      };

      await act(async () => {
        rerender(
          <AuthContext.Provider value={authValueLoggedOut}>
            <SavedPostsProvider>
              <ConsumerComponent onValues={handleValues} />
            </SavedPostsProvider>
          </AuthContext.Provider>,
        );
      });

      expect(currentSavedIds.size).toBe(0);
    });

    it('não deve vazar posts de uma conta para a outra durante login subsequente', async () => {
      (api.get as jest.Mock).mockResolvedValueOnce({
        data: {
          data: [{ id: 'post-user-1' }],
          meta: { page: 1, lastPage: 1 },
        },
      });

      let currentSavedIds = new Set<string>();
      const handleValues = (ids: Set<string>) => {
        currentSavedIds = ids;
      };

      const authUser1: any = {
        loggedId: 'user-1',
        isLoading: false,
        login: jest.fn(),
        logout: jest.fn(),
      };

      const { rerender } = render(
        <AuthContext.Provider value={authUser1}>
          <SavedPostsProvider>
            <ConsumerComponent onValues={handleValues} />
          </SavedPostsProvider>
        </AuthContext.Provider>,
      );

      await waitFor(() => {
        expect(currentSavedIds.has('post-user-1')).toBe(true);
      });

      // Nova conta loga com novos posts
      (api.get as jest.Mock).mockResolvedValueOnce({
        data: {
          data: [{ id: 'post-user-2' }],
          meta: { page: 1, lastPage: 1 },
        },
      });

      const authUser2: any = {
        loggedId: 'user-2',
        isLoading: false,
        login: jest.fn(),
        logout: jest.fn(),
      };

      await act(async () => {
        rerender(
          <AuthContext.Provider value={authUser2}>
            <SavedPostsProvider>
              <ConsumerComponent onValues={handleValues} />
            </SavedPostsProvider>
          </AuthContext.Provider>,
        );
      });

      await waitFor(() => {
        expect(currentSavedIds.has('post-user-1')).toBe(false);
        expect(currentSavedIds.has('post-user-2')).toBe(true);
      });
    });
  });
});
