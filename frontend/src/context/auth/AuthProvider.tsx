/* eslint-disable import/prefer-default-export */
import React, { useCallback, useEffect, useMemo, useSyncExternalStore } from 'react';
import api, { refreshAccessToken } from '../../services/api';
import authStore from '../../store/authStore';
import { AuthContext } from './AuthContext';

export function AuthProvider({ children }: any) {
  const state = useSyncExternalStore(authStore.subscribe, authStore.getState);

  useEffect(() => {
    (async () => {
      const hasStoredSession = await authStore.loadSession();
      if (!hasStoredSession) return;

      const accessToken = await refreshAccessToken();

      // Falha transitória (rede/timeout/erro de servidor): a sessão continua
      // guardada no aparelho, então apenas paramos o carregamento para que a
      // pessoa possa tentar novamente em vez de ser deslogada silenciosamente.
      if (!accessToken) {
        authStore.finishLoading();
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

  const acknowledgeSessionExpired = useCallback(() => {
    authStore.acknowledgeSessionExpired();
  }, []);

  const value = useMemo(
    () => ({
      loggedId: state.loggedId,
      isLoading: state.isLoading,
      sessionExpired: state.sessionExpired,
      login,
      logout,
      acknowledgeSessionExpired,
    }),
    [state.loggedId, state.isLoading, state.sessionExpired, acknowledgeSessionExpired],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
