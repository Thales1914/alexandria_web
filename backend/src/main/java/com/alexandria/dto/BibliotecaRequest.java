package com.alexandria.dto;

import com.alexandria.model.StatusLeitura;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record BibliotecaRequest(
        @NotNull(message = "O usuario e obrigatorio")
        Long usuarioId,

        @NotBlank(message = "O identificador do livro e obrigatorio")
        String googleBookId,

        StatusLeitura statusLeitura
) {
}
