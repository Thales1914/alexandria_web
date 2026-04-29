import { apiRequest } from './api';

const DEFAULT_COVER = 'https://placehold.co/300x460/112240/64ffda?text=Sem+Capa';

const WEAK_DESCRIPTION_VALUES = new Set([
  'descricao nao disponivel.',
  'descrição não disponível.',
  'descricao indisponivel.',
  'sem descricao.',
  'sem descrição.',
]);

const STOP_WORDS = new Set(['a', 'as', 'o', 'os', 'e', 'de', 'da', 'do', 'das', 'dos', 'the', 'and', 'of']);

const SECONDARY_MATERIAL_TERMS = [
  'analysis',
  'analise',
  'companion',
  'critical',
  'critica',
  'criticism',
  'education',
  'essay',
  'essays',
  'guide',
  'handbook',
  'literary criticism',
  'literary collections',
  'perspectives',
  'study guide',
];

function normalizeBackendBook(book) {
  return {
    id: book.identificador,
    databaseId: book.id,
    title: book.titulo || 'Titulo indisponivel',
    subtitle: '',
    authors: book.autor || 'Autor desconhecido',
    categories: book.categoria ? [book.categoria] : [],
    thumbnail: book.capa || DEFAULT_COVER,
    description: book.descricao || 'Descricao nao disponivel.',
    publishedDate: book.dataPublicacao || 'Data nao informada',
    pageCount: book.numeroPaginas || null,
    averageRating: null,
    ratingsCount: null,
    language: 'n/d',
    publisher: book.editora || 'Editora nao informada',
    previewLink: null,
    infoLink: null,
    raw: book,
  };
}

function normalizeText(value) {
  return (value || '')
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9:\s]/g, ' ')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

function getQueryTokens(query) {
  return normalizeText(query)
    .replace(/subject:[a-z]+/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 1 && !STOP_WORDS.has(token));
}

function buildSearchTerm(query) {
  return (query || '').trim();
}

function hasRealCover(book) {
  return Boolean(book.thumbnail) && book.thumbnail !== DEFAULT_COVER && !book.thumbnail.includes('placehold.co');
}

function hasUsefulDescription(book) {
  const normalizedDescription = normalizeText(book.description);
  return normalizedDescription.length >= 80 && !WEAK_DESCRIPTION_VALUES.has(normalizedDescription);
}

function hasKnownAuthor(book) {
  return normalizeText(book.authors) !== 'autor desconhecido';
}

function hasStrongQueryMatch(book, query) {
  const tokens = getQueryTokens(query);
  if (tokens.length === 0) {
    return true;
  }

  const title = normalizeText(book.title);
  const authors = normalizeText(book.authors);
  const titleAndAuthor = `${title} ${authors}`;
  const normalizedQuery = normalizeText(query);

  if (title.includes(normalizedQuery) || authors.includes(normalizedQuery)) {
    return true;
  }

  if (tokens.length === 1) {
    return titleAndAuthor.includes(tokens[0]);
  }

  return tokens.every((token) => title.includes(token)) || tokens.every((token) => authors.includes(token));
}

function isSecondaryMaterial(book, query) {
  const queryTokens = getQueryTokens(query);
  const searchableText = normalizeText(`${book.title} ${book.categories.join(' ')} ${book.publisher}`);

  return SECONDARY_MATERIAL_TERMS.some((term) => {
    const normalizedTerm = normalizeText(term);
    return searchableText.includes(normalizedTerm) && !queryTokens.includes(normalizedTerm);
  });
}

function getRelevanceScore(book, query) {
  const tokens = getQueryTokens(query);
  const normalizedQuery = normalizeText(query);
  const title = normalizeText(book.title);
  const authors = normalizeText(book.authors);
  const categories = normalizeText(book.categories.join(' '));
  let score = 0;

  if (title === normalizedQuery) {
    score += 120;
  } else if (title.includes(normalizedQuery)) {
    score += 95;
  }

  if (tokens.length > 0 && tokens.every((token) => title.includes(token))) {
    score += 70;
  }

  if (tokens.length > 0 && tokens.every((token) => authors.includes(token))) {
    score += 50;
  }

  if (tokens.length > 0 && tokens.some((token) => title.includes(token))) {
    score += 20;
  }

  if (categories.includes('juvenile fiction') || categories.includes('fiction')) {
    score += 12;
  }

  if (isSecondaryMaterial(book, query)) {
    score -= 90;
  }

  return score;
}

function dedupeBooks(books) {
  const seen = new Set();

  return books.filter((book) => {
    const key = `${normalizeText(book.title)}|${normalizeText(book.authors)}`;
    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function orderBooks(books, orderBy, query) {
  if (orderBy !== 'newest') {
    return [...books].sort((first, second) => getRelevanceScore(second, query) - getRelevanceScore(first, query));
  }

  return [...books].sort((first, second) => {
    const firstYear = Number.parseInt(first.publishedDate, 10) || 0;
    const secondYear = Number.parseInt(second.publishedDate, 10) || 0;
    return secondYear - firstYear;
  });
}

function filterBooks(books, quality, query) {
  if (quality === 'all') {
    return books;
  }

  return books.filter(
    (book) =>
      hasRealCover(book) &&
      hasUsefulDescription(book) &&
      hasKnownAuthor(book) &&
      !isSecondaryMaterial(book, query) &&
      (quality !== 'precise' || hasStrongQueryMatch(book, query)),
  );
}

export async function searchBooks({
  query = '',
  subject = 'Todos',
  orderBy = 'relevance',
  startIndex = 0,
  maxResults = 12,
  quality = 'precise',
  token,
}) {
  const searchTerm = buildSearchTerm(query);
  const params = new URLSearchParams({
    termo: searchTerm,
    categoria: subject,
    ordem: orderBy,
    qualidade: quality,
  });
  const data = await apiRequest(`/api/livros/buscar?${params.toString()}`, { token });
  const normalizedBooks = (data || []).map(normalizeBackendBook);
  const curatedBooks = orderBooks(filterBooks(dedupeBooks(normalizedBooks), quality, query), orderBy, query);
  const paginatedBooks = curatedBooks.slice(startIndex, startIndex + maxResults);

  return {
    items: paginatedBooks,
    totalItems: curatedBooks.length,
  };
}

export async function getBookDetails(id, token) {
  const data = await apiRequest(`/api/livros/google/${encodeURIComponent(id)}`, { token });
  return normalizeBackendBook(data);
}
