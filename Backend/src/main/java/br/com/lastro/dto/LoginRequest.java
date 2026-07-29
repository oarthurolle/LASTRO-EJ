package br.com.lastro.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class LoginRequest {
    @NotEmpty(message = "O email não pode estar vazio!")
    @Email(message = "Formato de email inválido")
    @Size(max = 255, message = "O email deve ter no máximo 255 caracteres")
    @Schema(example = "admin@admin.com", description = "E-mail do usuário")
    private String email;
    @NotEmpty(message = "A senha não deve estar vazia")
    @Size(max = 128, message = "A senha deve ter no máximo 128 caracteres")
    @Schema(example = "Admin@123", description = "Senha do usuário")
    private String password;
}
