package com.alexandria.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProfileRequest {

    @NotBlank(message = "O nome e obrigatorio")
    @Size(min = 2, max = 120, message = "O nome deve ter entre 2 e 120 caracteres")
    private String name;

    @NotBlank(message = "O email e obrigatorio")
    @Email(message = "Formato de email invalido")
    private String email;
}
