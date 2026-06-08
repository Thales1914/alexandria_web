package com.alexandria.dto;

public record GamificacaoHistoricoItem(
        String acao,
        Integer xp,
        String label,
        Object timestamp
) {
}
