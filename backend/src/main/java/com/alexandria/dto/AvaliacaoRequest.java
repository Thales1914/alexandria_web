package com.alexandria.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record AvaliacaoRequest(
        @NotNull(message = "O usuario e obrigatorio")
        Long usuarioId,

        @NotNull(message = "O livro e obrigatorio")
        Long livroId,

        @NotNull(message = "A nota e obrigatoria")
        @Min(value = 1, message = "A nota minima e 1")
        @Max(value = 5, message = "A nota maxima e 5")
        Integer nota,

        @Size(max = 5000, message = "A resenha deve ter no maximo 5000 caracteres")
        String resenha
) {
}
