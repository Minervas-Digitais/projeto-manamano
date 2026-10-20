import React from 'react';
import { render, waitFor, act } from '@testing-library/react-native';
import { SavedPostsProvider, useSavedPosts } from '../context/SavedPostsContext';
import { AuthContext } from '../context/auth/AuthContext';
import api from '../services/api';

jest.mock('../services/api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('SavedPostsContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  function ConsumerComponent({ onValues }: { onValues: (ids: Set<string>) => void }) {
    const { savedPostIds } = useSavedPosts();
    onValues(savedPostIds);
    return null;
  }

  describe('SavedPostsProvider - Isolamento de Sessão', () => {
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
