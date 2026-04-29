package com.alexandria.dto;

import java.time.LocalDateTime;

public record AvaliacaoResponse(
        Long id,
        Long usuarioId,
        Long livroId,
        Integer nota,
        String resenha,
        LocalDateTime dataAvaliacao
) {
}
