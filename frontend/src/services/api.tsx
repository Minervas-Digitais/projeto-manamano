import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import authStore from '../store/authStore';

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const api = axios.create({
  baseURL: BASE_URL,
  validateStatus: (status) => status < 400,
});

const refreshClient = axios.create({
  baseURL: BASE_URL,
});

let refreshPromise: Promise<string | null> | null = null;

async function doRefresh() {
  const refreshToken = await authStore.getRefreshToken();

  if (!refreshToken) {
    await authStore.clearSession();
    return null;
  }

  try {
    const response = await refreshClient.post('/auth/refresh', { refreshToken });
    await authStore.updateTokens(response.data.accessToken, response.data.refreshToken);
    return response.data.accessToken;
  } catch (error) {
    await authStore.clearSession();
    return null;
  }
}

export async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = doRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

function isAuthEndpoint(url?: string) {
  return Boolean(url && (url.includes('/auth/login') || url.includes('/auth/refresh')));
}

api.interceptors.request.use((config) => {
  const { accessToken } = authStore.getState();

  if (accessToken && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;
    const status = error.response?.status;

    if (
      !originalRequest ||
      status !== 401 ||
      isAuthEndpoint(originalRequest.url) ||
      originalRequest._retry
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    const newAccessToken = await refreshAccessToken();

    if (!newAccessToken) {
      return Promise.reject(error);
    }

    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
    return api(originalRequest);
  },
);

export default api;
