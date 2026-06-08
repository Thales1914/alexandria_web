package com.alexandria.dto;

import java.util.List;

public record GamificacaoStateRequest(
        Integer xp,
        List<String> conquistasDesbloqueadas,
        List<GamificacaoHistoricoItem> historico,
        GamificacaoStatsDto stats
) {
}
