import React from 'react';
import { AppState } from 'react-native';
import { act, renderHook } from '@testing-library/react-native';
import * as SecureStore from 'expo-secure-store';
import { AuthProvider } from '../context/auth/AuthProvider';
import { useAuth } from '../context/auth/useAuth';
import authStore from '../store/authStore';
import { refreshAccessToken } from '../services/api';

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
  default: { post: jest.fn(), get: jest.fn() },
  refreshAccessToken: jest.fn(),
}));

const mockedRefreshAccessToken = refreshAccessToken as jest.MockedFunction<
  typeof refreshAccessToken
>;
const mockedGetItemAsync = SecureStore.getItemAsync as jest.MockedFunction<
  typeof SecureStore.getItemAsync
>;

const appStateListeners: ((state: string) => void)[] = [];

async function flushPromises() {
  await act(async () => {
    await Promise.resolve();
  });
}

async function advanceTime(ms: number) {
  await act(async () => {
    jest.advanceTimersByTime(ms);
  });
  await flushPromises();
}

function renderAuthProvider() {
  return renderHook(() => useAuth(), { wrapper: AuthProvider });
}

describe('AuthProvider', () => {
  beforeEach(async () => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    appStateListeners.length = 0;

    jest.spyOn(AppState, 'addEventListener').mockImplementation(((type, handler) => {
      if (type === 'change') appStateListeners.push(handler as (state: string) => void);
      return { remove: jest.fn() };
    }) as typeof AppState.addEventListener);

    mockedGetItemAsync.mockImplementation(async (key) =>
      key === 'refreshToken' ? 'refresh-token' : 'user-id',
    );

    await authStore.clearSession();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('deve tentar restaurar a sessão novamente após falha transitória', async () => {
    mockedRefreshAccessToken
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce('new-access-token');

    renderAuthProvider();
    await flushPromises();

    expect(mockedRefreshAccessToken).toHaveBeenCalledTimes(1);
    expect(authStore.getState().isLoading).toBe(false);

    await advanceTime(2000);
    expect(mockedRefreshAccessToken).toHaveBeenCalledTimes(2);

    await advanceTime(5000);
    expect(mockedRefreshAccessToken).toHaveBeenCalledTimes(3);

    await advanceTime(30000);
    expect(mockedRefreshAccessToken).toHaveBeenCalledTimes(3);
  });

  it('não deve tentar novamente quando a sessão foi encerrada pelo servidor', async () => {
    mockedRefreshAccessToken.mockResolvedValue(null);

    renderAuthProvider();
    await flushPromises();

    await act(async () => {
      await authStore.expireSession();
    });

    await advanceTime(30000);

    expect(authStore.getState().sessionExpired).toBe(true);
    expect(mockedRefreshAccessToken).toHaveBeenCalledTimes(1);
  });

  it('deve tentar novamente ao voltar para o primeiro plano', async () => {
    mockedRefreshAccessToken.mockResolvedValue(null);

    renderAuthProvider();
    await flushPromises();

    await advanceTime(2000);
    await advanceTime(5000);
    await advanceTime(15000);
    expect(mockedRefreshAccessToken).toHaveBeenCalledTimes(4);

    await act(async () => {
      appStateListeners.forEach((listener) => listener('active'));
    });
    await flushPromises();

    expect(mockedRefreshAccessToken).toHaveBeenCalledTimes(5);
  });
});
