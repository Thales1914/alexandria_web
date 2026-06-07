package com.alexandria.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ComunidadePostRequest(
        @NotBlank(message = "O conteúdo é obrigatório")
        @Size(min = 5, max = 1000, message = "A publicação deve ter entre 5 e 1000 caracteres")
        String content
) {
}
