package com.alexandria.dto;

import java.time.LocalDateTime;

public record AvaliacaoResponse(
        Long id,
        Long usuarioId,
        Long livroId,
        LivroResponse livro,
        Integer nota,
        String resenha,
        LocalDateTime dataAvaliacao
) {
}
