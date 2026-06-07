package com.alexandria.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ComunidadeComentarioRequest(
        @NotBlank(message = "O comentário é obrigatório")
        @Size(min = 2, max = 500, message = "O comentário deve ter entre 2 e 500 caracteres")
        String content
) {
}
