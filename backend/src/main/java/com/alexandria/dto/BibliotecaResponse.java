package com.alexandria.dto;

import com.alexandria.model.StatusLeitura;
import java.time.LocalDateTime;

public record BibliotecaResponse(
        Long id,
        LivroResponse livro,
        StatusLeitura statusLeitura,
        boolean favorito,
        LocalDateTime dataAdicao
) {
}
