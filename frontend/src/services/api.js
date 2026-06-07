import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const AUTH_STORAGE_KEYS = ['token', 'userName', 'userEmail', 'userId'];
export const AUTH_CHANGED_EVENT = 'alexandria:auth-changed';

function clearStoredAuth() {
  AUTH_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}

export async function apiRequest(path, options = {}) {
  const { method = 'GET', body, headers = {}, token } = options;

  try {
    const response = await apiClient.request({
      url: path,
      method,
      data: body,
      headers: {
        ...headers,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    return response.data;
  } catch (err) {
    const data = err.response?.data;
    const status = err.response?.status;
    const isAuthError = token && (status === 401 || status === 403);

    if (isAuthError) {
      clearStoredAuth();
    }

    const error = new Error(
      data?.message
        || (isAuthError
          ? 'Sua sessão expirou. Entre novamente.'
          : 'Não foi possível concluir a requisição.'),
    );
    error.status = status;
    error.data = data;
    throw error;
  }
}
