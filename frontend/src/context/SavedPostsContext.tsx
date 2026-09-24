import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import Toast from 'react-native-toast-message';
import api from '../services/api';
// import { useAuth } from './auth/useAuth';
import { useAuth } from './auth/useAuth';

type SavedPostsContextType = {
  savedPostIds: Set<string>;
  savePost: (postId: string) => Promise<void>;
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
        const response = await api.get('/saved-post', {
          params: { page: 1, limit: 20 },
        });
        const data = response.data.data ?? response.data;
        const list = Array.isArray(data) ? data : [];
        setSavedPostIds(new Set(list.map((p: any) => p.id)));
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

  const savePost = async (postId: string) => {
    setSavedPostIds((prev) => new Set(prev).add(postId));
    try {
      await api.post('/saved-post', { postId });
      Toast.show({
        type: 'sucess',
        text1: 'Post salvo com sucesso!',
      })
    } catch (error) {
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
        type: 'sucess',
        text1: 'Post removido dos salvos!',
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Erro ao remover post dos salvos',
        text2: 'Não foi possível remover o post. Tente novamente.',
      });
      setSavedPostIds((prev) => new Set(prev).add(postId));
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
