/* eslint-disable import/prefer-default-export */
import React, { useEffect, useMemo, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import api from '../../services/api';
import { AuthContext } from './AuthContext';

export function AuthProvider({ children }: any) {
  const [token, setToken] = useState<string | null>(null); // AccessToken
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    loadSession();
  }, []);

  async function loadSession() {
    const refreshToken = await SecureStore.getItemAsync('refreshToken');
    const storedId = await SecureStore.getItemAsync('loggedId');

    if (!refreshToken) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.post('/auth/refresh', {
        refreshToken,
      });

      setToken(response.data.accessToken);
      setUserId(storedId);

      await SecureStore.setItemAsync('refreshToken', response.data.refreshToken);
    } catch (err) {
      await SecureStore.deleteItemAsync('refreshToken');
      await SecureStore.deleteItemAsync('loggedId');
      setToken(null);
      setUserId(null);
    } finally {
      setIsLoading(false);
    }
  }

  async function login(email: string, password: string) {
    const response = await api.post('/auth/login', {
      email,
      password,
    });

    const { accessToken, refreshToken, loggedId } = response.data;

    setToken(accessToken);
    setUserId(loggedId);

    await SecureStore.setItemAsync('refreshToken', refreshToken);
    await SecureStore.setItemAsync('loggedId', loggedId);

    return accessToken;
  }

  async function logout() {
    const refreshToken = await SecureStore.getItemAsync('refreshToken');

    try {
      await api.post('/auth/logout', { refreshToken });
    } catch (err) {
      /* empty */
    }

    await SecureStore.deleteItemAsync('refreshToken');
    await SecureStore.deleteItemAsync('loggedId');

    setToken(null);
    setUserId(null);
  }

  const value = useMemo(
    () => ({
      accessToken: token,
      loggedId: userId,
      isLoading,
      login,
      logout,
    }),
    [token, isLoading, userId],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
