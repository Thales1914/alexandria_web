package com.alexandria.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record AvaliacaoRequest(
        Long usuarioId,

        Long livroId,

        String googleBookId,

        @NotNull(message = "A nota é obrigatória")
        @Min(value = 1, message = "A nota mínima é 1")
        @Max(value = 5, message = "A nota máxima é 5")
        Integer nota,

        @Size(max = 5000, message = "A resenha deve ter no máximo 5000 caracteres")
        String resenha
) {
}
