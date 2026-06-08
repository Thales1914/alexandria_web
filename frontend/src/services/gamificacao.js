import { apiRequest } from './api';

const STORAGE_KEY = 'alexandria.gamificacao';
const USER_STORAGE_PREFIX = 'alexandria.gamificacao.user.';

// ── Ações que concedem XP ─────────────────────────────────────────────────────
export const ACOES_XP = {
  ADICIONAR_LIVRO:      { xp: 10, label: 'Livro adicionado à biblioteca' },
  MARCAR_LENDO:         { xp: 5,  label: 'Leitura iniciada' },
  MARCAR_LIDO:          { xp: 25, label: 'Leitura concluída!' },
  AVALIAR_LIVRO:        { xp: 15, label: 'Avaliação registrada' },
  FAVORITAR_LIVRO:      { xp: 5,  label: 'Livro favoritado' },
  PUBLICAR_COMUNIDADE:  { xp: 5,  label: 'Post publicado na comunidade' },
};

// ── Níveis ────────────────────────────────────────────────────────────────────
export const NIVEIS = [
  { numero: 1, label: 'Leitor Iniciante', minXP: 0, maxXP: 100 },
  { numero: 2, label: 'Leitor Curioso', minXP: 100, maxXP: 300 },
  { numero: 3, label: 'Leitor Constante', minXP: 300, maxXP: 600 },
  { numero: 4, label: 'Leitor Experiente', minXP: 600, maxXP: 1000 },
  { numero: 5, label: 'Mestre das Letras', minXP: 1000, maxXP: 3000 },
  { numero: 6, label: 'Guardião de Alexandria', minXP: 3000, maxXP: Infinity },
];

// ── Conquistas ────────────────────────────────────────────────────────────────
export const LISTA_CONQUISTAS = [
  {
    id: 'primeiro_livro',
    titulo: 'Primeiro Passo',
    descricao: 'Adicione seu primeiro livro à biblioteca',
    icone: '📖',
    xpBonus: 20,
    verificar: (stats) => stats.totalLivros >= 1,
  },
  {
    id: 'primeira_leitura',
    titulo: 'Leitor Estreante',
    descricao: 'Conclua sua primeira leitura',
    icone: '✅',
    xpBonus: 30,
    verificar: (stats) => stats.livrosLidos >= 1,
  },
  {
    id: 'cinco_leituras',
    titulo: 'Maratonista',
    descricao: 'Leia 5 livros',
    icone: '🏃',
    xpBonus: 50,
    verificar: (stats) => stats.livrosLidos >= 5,
  },
  {
    id: 'dez_leituras',
    titulo: 'Devorador',
    descricao: 'Leia 10 livros',
    icone: '🔥',
    xpBonus: 100,
    verificar: (stats) => stats.livrosLidos >= 10,
  },
  {
    id: 'critico',
    titulo: 'Crítico Literário',
    descricao: 'Registre 3 avaliações',
    icone: '✍️',
    xpBonus: 40,
    verificar: (stats) => stats.avaliacoes >= 3,
  },
  {
    id: 'colecionador',
    titulo: 'Colecionador',
    descricao: 'Tenha 20 livros na biblioteca',
    icone: '📚',
    xpBonus: 80,
    verificar: (stats) => stats.totalLivros >= 20,
  },
  {
    id: 'curador',
    titulo: 'Curador',
    descricao: 'Favorite 5 livros',
    icone: '⭐',
    xpBonus: 25,
    verificar: (stats) => stats.favoritos >= 5,
  },
  {
    id: 'voz_comunidade',
    titulo: 'Voz da Comunidade',
    descricao: 'Publique 5 posts na comunidade',
    icone: '💬',
    xpBonus: 30,
    verificar: (stats) => stats.posts >= 5,
  },
  {
    id: 'mestre',
    titulo: 'Mestre Alexandria',
    descricao: 'Alcance o nível Mestre das Letras',
    icone: '🦉',
    xpBonus: 200,
    verificar: (stats) => stats.xp >= 1000,
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
export function getNivel(xp) {
  return [...NIVEIS].reverse().find((n) => xp >= n.minXP) ?? NIVEIS[0];
}

export function getProgresso(xp) {
  const nivel = getNivel(xp);
  if (nivel.maxXP === Infinity) return 100;
  const range = nivel.maxXP - nivel.minXP;
  return Math.min(100, Math.round(((xp - nivel.minXP) / range) * 100));
}

// ── Persistência ──────────────────────────────────────────────────────────────
export const ESTADO_INICIAL = {
  xp: 0,
  conquistasDesbloqueadas: [],
  historico: [],
  stats: {
    totalLivros: 0,
    livrosLidos: 0,
    avaliacoes: 0,
    favoritos: 0,
    posts: 0,
    abandonados: 0,
    queroLer: 0,
    lendo: 0,
  },
};

export function criarEstadoInicial() {
  return {
    ...ESTADO_INICIAL,
    conquistasDesbloqueadas: [],
    historico: [],
    stats: { ...ESTADO_INICIAL.stats },
  };
}

export function normalizarEstado(estado) {
  const base = criarEstadoInicial();
  if (!estado || typeof estado !== 'object') return base;

  return {
    ...base,
    xp: Math.max(0, Number(estado.xp) || 0),
    conquistasDesbloqueadas: Array.isArray(estado.conquistasDesbloqueadas)
      ? [...new Set(estado.conquistasDesbloqueadas.filter(Boolean))]
      : [],
    historico: Array.isArray(estado.historico)
      ? estado.historico
          .filter((item) => item && item.label && item.timestamp)
          .slice(0, 50)
      : [],
    stats: {
      ...base.stats,
      ...(estado.stats || {}),
    },
  };
}

function getUserStorageKey(userKey) {
  return `${USER_STORAGE_PREFIX}${userKey}`;
}

export function limparEstadoLegado() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore storage access failures
  }
}

export function carregarEstadoLocal(userKey) {
  if (!userKey) return criarEstadoInicial();

  try {
    const raw = localStorage.getItem(getUserStorageKey(userKey));
    if (!raw) return criarEstadoInicial();
    return normalizarEstado(JSON.parse(raw));
  } catch {
    return criarEstadoInicial();
  }
}

export function salvarEstadoLocal(userKey, estado) {
  if (!userKey) return;

  try {
    localStorage.setItem(getUserStorageKey(userKey), JSON.stringify(normalizarEstado(estado)));
  } catch {
    // falha silenciosa — storage pode estar cheio
  }
}

export async function buscarEstadoGamificacao(token) {
  const estado = await apiRequest('/api/gamificacao', { token });
  return normalizarEstado(estado);
}

export async function salvarEstadoGamificacao(estado, token) {
  const salvo = await apiRequest('/api/gamificacao', {
    method: 'PUT',
    token,
    body: normalizarEstado(estado),
  });
  return normalizarEstado(salvo);
}
