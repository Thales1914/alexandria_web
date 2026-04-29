package com.alexandria.dto;

import com.alexandria.model.StatusLeitura;
import jakarta.validation.constraints.NotNull;

public record StatusLeituraRequest(
        @NotNull(message = "O status de leitura e obrigatorio")
        StatusLeitura statusLeitura
) {
}
