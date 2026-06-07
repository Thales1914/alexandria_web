import { apiRequest } from './api';

export async function listarPublicacoesComunidade(token) {
  return apiRequest('/api/comunidade/posts', { token });
}

export async function criarPublicacaoComunidade(content, token) {
  return apiRequest('/api/comunidade/posts', {
    method: 'POST',
    token,
    body: { content },
  });
}

export async function alternarCurtidaPublicacao(id, token) {
  return apiRequest(`/api/comunidade/posts/${id}/like`, {
    method: 'POST',
    token,
  });
}

export async function criarComentarioComunidade(id, content, token) {
  return apiRequest(`/api/comunidade/posts/${id}/comentarios`, {
    method: 'POST',
    token,
    body: { content },
  });
}

export async function removerComentarioComunidade(postId, comentarioId, token) {
  return apiRequest(`/api/comunidade/posts/${postId}/comentarios/${comentarioId}`, {
    method: 'DELETE',
    token,
  });
}

export async function removerPublicacaoComunidade(id, token) {
  return apiRequest(`/api/comunidade/posts/${id}`, {
    method: 'DELETE',
    token,
  });
}
