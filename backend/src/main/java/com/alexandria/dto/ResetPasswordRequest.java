package com.alexandria.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResetPasswordRequest {

    @NotBlank(message = "O token de redefinicao e obrigatorio")
    private String token;

    @NotBlank(message = "A nova senha e obrigatoria")
    @Size(min = 8, max = 100, message = "A nova senha deve ter no minimo 8 caracteres")
    private String password;

    @NotBlank(message = "A confirmacao da senha e obrigatoria")
    private String confirmPassword;
}
