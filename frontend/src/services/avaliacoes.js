import { apiRequest } from './api';

export async function criarAvaliacao({ usuarioId, livroId, googleBookId, nota, resenha, token }) {
  return apiRequest('/api/avaliacoes', {
    method: 'POST',
    token,
    body: {
      usuarioId,
      livroId,
      googleBookId,
      nota,
      resenha,
    },
  });
}

export async function listarMinhasAvaliacoes(token) {
  return apiRequest('/api/avaliacoes/minhas', { token });
}

export async function listarAvaliacoesUsuario(usuarioId, token) {
  return apiRequest(`/api/avaliacoes/usuario/${usuarioId}`, { token });
}

export async function atualizarAvaliacao(id, { nota, resenha }, token) {
  return apiRequest(`/api/avaliacoes/${id}`, {
    method: 'PUT',
    token,
    body: {
      nota,
      resenha,
    },
  });
}

export async function excluirAvaliacao(id, token) {
  return apiRequest(`/api/avaliacoes/${id}`, {
    method: 'DELETE',
    token,
  });
}
