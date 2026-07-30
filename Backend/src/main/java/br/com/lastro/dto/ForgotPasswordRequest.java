package br.com.lastro.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import jakarta.validation.constraints.Size;

@Data
public class ForgotPasswordRequest {
    @NotBlank(message = "O email não pode estar vazio!")
    @Email(message = "Formato de email inválido")
    @Size(max = 255, message = "O email deve ter no máximo 255 caracteres")
    private String email;
}
