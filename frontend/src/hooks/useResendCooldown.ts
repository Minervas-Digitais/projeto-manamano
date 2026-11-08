import { useEffect, useState } from 'react';

const MINUTE_MS = 60 * 1000;

// Espera após cada envio do código. Precisa caber no limite do backend (6 envios por hora).
const RESEND_INTERVALS_MS = [1, 2, 5, 10, 10].map((minutes) => minutes * MINUTE_MS);
const MAX_SENDS = RESEND_INTERVALS_MS.length + 1;
const RESET_AFTER_MS = 60 * MINUTE_MS;

type ResendState = { sends: number; firstSentAt: number; availableAt: number };

// Em memória e fora da tela: sobrevive à navegação, assim voltar à tela de e-mail não zera a espera.
const resendStates = new Map<string, ResendState>();

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function getState(email: string) {
  const key = normalizeEmail(email);
  const state = resendStates.get(key);
  if (!state) return null;
  if (Date.now() - state.firstSentAt > RESET_AFTER_MS) {
    resendStates.delete(key);
    return null;
  }
  return state;
}

export function registerCodeSent(email: string) {
  const key = normalizeEmail(email);
  const now = Date.now();
  const previous = getState(key);
  const sends = (previous?.sends ?? 0) + 1;

  const firstSentAt = previous?.firstSentAt ?? now;

  resendStates.set(key, {
    sends,
    firstSentAt,
    // Ao atingir o limite, a próxima janela abre quando a janela de 60 min fecha.
    availableAt:
      sends < MAX_SENDS ? now + RESEND_INTERVALS_MS[sends - 1] : firstSentAt + RESET_AFTER_MS,
  });
}

export function isResendBlocked(email: string) {
  const state = getState(email);
  return Boolean(state && state.availableAt > Date.now());
}

export function clearResendCooldown(email?: string) {
  if (email) {
    resendStates.delete(normalizeEmail(email));
    return;
  }
  resendStates.clear();
}

export function useResendCooldown(email: string) {
  const [remainingMs, setRemainingMs] = useState(0);
  const [limitReached, setLimitReached] = useState(false);

  useEffect(() => {
    const update = () => {
      const state = getState(email);
      setLimitReached(Boolean(state && state.sends >= MAX_SENDS));
      setRemainingMs(state ? Math.max(0, state.availableAt - Date.now()) : 0);
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [email]);

  return {
    limitReached,
    remainingMs,
    registerSent: () => {
      registerCodeSent(email);
      const state = getState(email);
      setLimitReached(Boolean(state && state.sends >= MAX_SENDS));
      setRemainingMs(state ? Math.max(0, state.availableAt - Date.now()) : 0);
    },
  };
}
