package com.alexandria.dto;

import com.alexandria.model.StatusLeitura;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record BibliotecaRequest(
        @NotNull(message = "O usuário é obrigatório")
        Long usuarioId,

        @NotBlank(message = "O identificador do livro é obrigatório")
        String googleBookId,

        StatusLeitura statusLeitura
) {
}
