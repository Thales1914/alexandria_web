const STORAGE_KEY = 'alexandria.gamificacao';

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
//EXEMPLOS
export const NIVEIS = [
  { numero: 1, label: 'THALES',   minXP: 0,    maxXP: 100  },
  { numero: 2, label: 'DAVI',     minXP: 100,  maxXP: 300  },
  { numero: 3, label: 'EDERSON',  minXP: 300,  maxXP: 600  },
  { numero: 4, label: 'LAUAN',    minXP: 600,  maxXP: 1000 },
  { numero: 5, label: 'JOÃO',     minXP: 1000, maxXP: 3000  },
  { numero: 6, label: 'Mestre de tudo e de todos', minXP: 3000, maxXP: Infinity },
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
const ESTADO_INICIAL = {
  xp: 0,
  conquistasDesbloqueadas: [],
  historico: [],
  stats: {
    totalLivros: 0,
    livrosLidos: 0,
    avaliacoes: 0,
    favoritos: 0,
    posts: 0,
  },
};

export function carregarEstado() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return ESTADO_INICIAL;
    const parsed = JSON.parse(raw);
    return {
      ...ESTADO_INICIAL,
      ...parsed,
      stats: { ...ESTADO_INICIAL.stats, ...(parsed.stats ?? {}) },
    };
  } catch {
    return ESTADO_INICIAL;
  }
}

export function salvarEstado(estado) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(estado));
  } catch {
    // falha silenciosa — storage pode estar cheio
  }
}
//obviamente como vocês viram isso aqui é muito pouco precisamos de mais conquistas.
