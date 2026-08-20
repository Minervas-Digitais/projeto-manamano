/* eslint-disable import/prefer-default-export */
import React, { useEffect, useMemo, useSyncExternalStore } from 'react';
import api, { refreshAccessToken } from '../../services/api';
import authStore from '../../store/authStore';
import { AuthContext } from './AuthContext';

export function AuthProvider({ children }: any) {
  const state = useSyncExternalStore(authStore.subscribe, authStore.getState);

  useEffect(() => {
    (async () => {
      const hasStoredSession = await authStore.loadSession();
      if (hasStoredSession) {
        await refreshAccessToken();
      }
    })();
  }, []);

  async function login(email: string, password: string) {
    const response = await api.post('/auth/login', {
      email,
      password,
    });

    const { accessToken, refreshToken, loggedId } = response.data;

    await authStore.setSession({ accessToken, refreshToken, loggedId });
  }

  async function logout() {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      /* empty */
    }

    await authStore.clearSession();
  }

  const value = useMemo(
    () => ({
      loggedId: state.loggedId,
      isLoading: state.isLoading,
      login,
      logout,
    }),
    [state.loggedId, state.isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
