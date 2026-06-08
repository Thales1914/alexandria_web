package com.alexandria.dto;

public record GamificacaoStatsDto(
        Integer totalLivros,
        Integer livrosLidos,
        Integer avaliacoes,
        Integer favoritos,
        Integer posts,
        Integer abandonados,
        Integer queroLer,
        Integer lendo
) {
}
