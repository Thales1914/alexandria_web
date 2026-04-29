import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
    const error = new Error(data?.message || 'Nao foi possivel concluir a requisicao.');
    error.status = err.response?.status;
    error.data = data;
    throw error;
  }
}
