import { apiRequest } from './api';

export const STATUS_LEITURA = {
  QUERO_LER: 'Quero ler',
  LENDO: 'Lendo',
  LIDO: 'Lido',
  ABANDONADO: 'Abandonado',
};

export async function salvarNaBiblioteca({ usuarioId, googleBookId, statusLeitura = 'QUERO_LER', token }) {
  return apiRequest('/api/biblioteca', {
    method: 'POST',
    token,
    body: {
      usuarioId,
      googleBookId,
      statusLeitura,
    },
  });
}

export async function listarBiblioteca(usuarioId, token) {
  return apiRequest(`/api/biblioteca/usuario/${usuarioId}`, { token });
}

export async function atualizarStatusBiblioteca(id, statusLeitura, token) {
  return apiRequest(`/api/biblioteca/${id}/status`, {
    method: 'PUT',
    token,
    body: { statusLeitura },
  });
}

export async function atualizarFavoritoBiblioteca(id, favorito, token) {
  return apiRequest(`/api/biblioteca/${id}/favorito`, {
    method: 'PUT',
    token,
    body: { favorito },
  });
}
