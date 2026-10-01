import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import Toast from 'react-native-toast-message';
import api from '../services/api';
// import { useAuth } from './auth/useAuth';
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
    const fetchSavedPosts = async () => {
      if (!loggedId) return;
      try {
        const ids = new Set<string>();
        let page = 1;
        let lastPage = 1;
        do {
          // eslint-disable-next-line no-await-in-loop
          const response = await api.get('/saved-post', {
            params: { page, limit: 20 },
          });
          const payload = response.data;
          const list = Array.isArray(payload) ? payload : (payload?.data ?? []);
          list.forEach((p: any) => {
            if (p?.id) ids.add(p.id);
          });
          lastPage = Array.isArray(payload) ? 1 : (payload?.meta?.lastPage ?? 1);
          page += 1;
        } while (page <= lastPage);
        setSavedPostIds(ids);
      } catch (error) {
        Toast.show({
          type: 'error',
          text1: 'Erro',
          text2: 'Não foi possível buscar os posts salvos.',
        });
      }
    };
    fetchSavedPosts();
  }, [loggedId]);

  const savePost = async (postId: string, ownerId?: string) => {
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
      if (error?.response?.status === 409) {
        // Já estava salvo
        setSavedPostIds((prev) => new Set(prev).add(postId));
        return;
      }
      Toast.show({
        type: 'error',
        text1: 'Erro ao salvar post',
        text2: 'Não foi possível salvar o post. Tente novamente.',
      });
      setSavedPostIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(postId);
        return newSet;
      });
      const serverMessage = error?.response?.data?.message;
      Toast.show({
        type: 'error',
        text1: Array.isArray(serverMessage)
          ? serverMessage[0]
          : serverMessage || 'Erro ao salvar post. Tente novamente mais tarde.',
      });
    }
  };

  const unsavePost = async (postId: string) => {
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
      if (error?.response?.status === 404) {
        // Já não estava salvo.
        return;
      }
      Toast.show({
        type: 'error',
        text1: 'Erro ao remover post dos salvos',
        text2: 'Não foi possível remover o post. Tente novamente.',
      });
      setSavedPostIds((prev) => new Set(prev).add(postId));
      Toast.show({
        type: 'error',
        text1: 'Erro ao remover post dos salvos. Tente novamente.',
      });
    }
  };

  const value = useMemo(() => ({ savedPostIds, savePost, unsavePost }), [savedPostIds]);

  return <SavedPostsContext.Provider value={value}>{children}</SavedPostsContext.Provider>;
}

export const useSavedPosts = () => {
  const context = useContext(SavedPostsContext);
  if (!context) throw new Error('useSavedPosts must be used within SavedPostsProvider');
  return context;
};
