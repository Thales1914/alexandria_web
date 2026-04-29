import { apiRequest } from './api';

export async function criarAvaliacao({ usuarioId, livroId, nota, resenha, token }) {
  return apiRequest('/api/avaliacoes', {
    method: 'POST',
    token,
    body: {
      usuarioId,
      livroId,
      nota,
      resenha,
    },
  });
}

export async function listarAvaliacoesUsuario(usuarioId, token) {
  return apiRequest(`/api/avaliacoes/usuario/${usuarioId}`, { token });
}
