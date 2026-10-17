import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { isAxiosError } from 'axios';
import Toast from 'react-native-toast-message';
import api from '../services/api';
import { useAuth } from './auth/useAuth';

export const OWN_POST_SAVE_MESSAGE = 'Você não pode salvar sua própria publicação.';

type SavedPostsContextType = {
  savedPostIds: Set<string>;
  savePost: (postId: string, ownerId?: string) => Promise<void>;
  unsavePost: (postId: string) => Promise<void>;
};

const SavedPostsContext = createContext<SavedPostsContextType | undefined>(undefined);

type SavedPostsProviderProps = {
  children: React.ReactNode;
};

export function SavedPostsProvider({ children }: SavedPostsProviderProps) {
  const { loggedId } = useAuth();
  const [savedPostIds, setSavedPostIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setSavedPostIds(new Set());
    if (!loggedId) return undefined;

    let active = true;

    const fetchSavedPosts = async () => {
      try {
        const ids = new Set<string>();
        let page = 1;
        let lastPage = 1;
        do {
          // eslint-disable-next-line no-await-in-loop
          const response = await api.get('/saved-post', {
            params: { page, limit: 20 },
          });
          if (!active) return;
          const payload = response.data;
          const list = Array.isArray(payload) ? payload : (payload?.data ?? []);
          list.forEach((p: any) => {
            if (p?.id) ids.add(p.id);
          });
          lastPage = Array.isArray(payload) ? 1 : (payload?.meta?.lastPage ?? 1);
          page += 1;
        } while (page <= lastPage);
        if (active) {
          setSavedPostIds(ids);
        }
      } catch (error) {
        if (!active) return;
        Toast.show({
          type: 'error',
          text1: 'Erro',
          text2: 'Não foi possível buscar os posts salvos.',
        });
      }
    };
    fetchSavedPosts();

    return () => {
      active = false;
    };
  }, [loggedId]);

  const savePost = useCallback(
    async (postId: string, ownerId?: string) => {
      if (ownerId && loggedId && ownerId === loggedId) {
        Toast.show({
          type: 'error',
          text1: OWN_POST_SAVE_MESSAGE,
        });
        return;
      }
      setSavedPostIds((prev) => new Set(prev).add(postId));
      try {
        await api.post('/saved-post', { postId });
        Toast.show({
          type: 'success',
          text1: 'Post salvo com sucesso!',
        });
      } catch (error) {
        if (isAxiosError(error) && error.response?.status === 409) {
          // Já estava salvo
          setSavedPostIds((prev) => new Set(prev).add(postId));
          return;
        }
        setSavedPostIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(postId);
          return newSet;
        });
        const serverMessage = isAxiosError(error) ? error.response?.data?.message : undefined;
        Toast.show({
          type: 'error',
          text1: 'Erro ao salvar post',
          text2: Array.isArray(serverMessage)
            ? serverMessage[0]
            : serverMessage || 'Não foi possível salvar o post. Tente novamente.',
        });
      }
    },
    [loggedId],
  );

  const unsavePost = useCallback(async (postId: string) => {
    setSavedPostIds((prev) => {
      const newSet = new Set(prev);
      newSet.delete(postId);
      return newSet;
    });
    try {
      await api.delete(`/saved-post/${postId}`);
      Toast.show({
        type: 'success',
        text1: 'Post removido dos salvos!',
      });
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 404) {
        // Já não estava salvo.
        return;
      }
      setSavedPostIds((prev) => new Set(prev).add(postId));
      const serverMessage = isAxiosError(error) ? error.response?.data?.message : undefined;
      Toast.show({
        type: 'error',
        text1: 'Erro ao remover post dos salvos',
        text2: Array.isArray(serverMessage)
          ? serverMessage[0]
          : serverMessage || 'Não foi possível remover o post. Tente novamente.',
      });
    }
  }, []);

  const value = useMemo(
    () => ({ savedPostIds, savePost, unsavePost }),
    [savedPostIds, savePost, unsavePost],
  );

  return <SavedPostsContext.Provider value={value}>{children}</SavedPostsContext.Provider>;
}

export const useSavedPosts = () => {
  const context = useContext(SavedPostsContext);
  if (!context) throw new Error('useSavedPosts must be used within SavedPostsProvider');
  return context;
};
