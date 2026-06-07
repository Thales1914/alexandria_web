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

    @NotBlank(message = "O token de redefinição é obrigatório")
    private String token;

    @NotBlank(message = "A nova senha é obrigatória")
    @Size(min = 8, max = 100, message = "A nova senha deve ter no mínimo 8 caracteres")
    private String password;

    @NotBlank(message = "A confirmação da senha é obrigatória")
    private String confirmPassword;
}
