package com.alexandria.dto;

import java.util.List;

public record GamificacaoStateResponse(
        Integer xp,
        List<String> conquistasDesbloqueadas,
        List<GamificacaoHistoricoItem> historico,
        GamificacaoStatsDto stats
) {
}
