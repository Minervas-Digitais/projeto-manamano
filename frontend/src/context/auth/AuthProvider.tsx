/* eslint-disable import/prefer-default-export */
import React, { useCallback, useEffect, useMemo, useRef, useSyncExternalStore } from 'react';
import { AppState } from 'react-native';
import api, { refreshAccessToken } from '../../services/api';
import authStore from '../../store/authStore';
import { AuthContext } from './AuthContext';

// Backoff curto para falhas transitórias ao restaurar a sessão salva.
const RETRY_DELAYS_MS = [2000, 5000, 15000];

export function AuthProvider({ children }: any) {
  const state = useSyncExternalStore(authStore.subscribe, authStore.getState);

  const hasStoredSession = useRef(false);
  const retryAttempt = useRef(0);
  const retryTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const restoreRunId = useRef(0);
  const restoreRef = useRef<() => Promise<void>>(async () => {});

  const clearScheduledRetry = useCallback(() => {
    if (retryTimeout.current) {
      clearTimeout(retryTimeout.current);
      retryTimeout.current = null;
    }
  }, []);

  const canRestoreSession = useCallback(() => {
    const { accessToken, loggedId, sessionExpired } = authStore.getState();
    return hasStoredSession.current && Boolean(loggedId) && !accessToken && !sessionExpired;
  }, []);

  const scheduleRetry = useCallback(() => {
    const delay = RETRY_DELAYS_MS[retryAttempt.current];
    if (delay === undefined) return;

    retryAttempt.current += 1;
    clearScheduledRetry();
    retryTimeout.current = setTimeout(() => {
      void restoreRef.current();
    }, delay);
  }, [clearScheduledRetry]);

  /**
   * Tenta renovar a sessão guardada no aparelho. Falha transitória agenda novas
   * tentativas; rejeição do servidor já encerrou a sessão, então não insiste.
   */
  const tryRestoreSession = useCallback(async () => {
    const runId = ++restoreRunId.current;

    clearScheduledRetry();

    if (!canRestoreSession()) return;

    const accessToken = await refreshAccessToken();

    // Uma tentativa mais nova (ex.: app voltou ao foreground) assumiu o fluxo.
    if (runId !== restoreRunId.current) return;

    if (accessToken) {
      retryAttempt.current = 0;
      return;
    }

    if (!canRestoreSession()) return;

    scheduleRetry();
  }, [canRestoreSession, clearScheduledRetry, scheduleRetry]);

  useEffect(() => {
    restoreRef.current = tryRestoreSession;
  }, [tryRestoreSession]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const storedSession = await authStore.loadSession();
      if (!storedSession || cancelled) return;

      hasStoredSession.current = true;

      const accessToken = await refreshAccessToken();
      if (cancelled) return;

      if (!accessToken) {
        // Falha transitória (rede/timeout/erro de servidor): a sessão continua
        // guardada no aparelho, então liberamos a interface e seguimos tentando
        // em background, em vez de deslogar silenciosamente.
        authStore.finishLoading();
        retryAttempt.current = 0;
        scheduleRetry();
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [scheduleRetry]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState !== 'active') return;

      // Ao voltar ao primeiro plano damos uma nova rodada completa de tentativas.
      retryAttempt.current = 0;
      void restoreRef.current();
    });

    return () => {
      subscription.remove();
      clearScheduledRetry();
    };
  }, [clearScheduledRetry]);

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
