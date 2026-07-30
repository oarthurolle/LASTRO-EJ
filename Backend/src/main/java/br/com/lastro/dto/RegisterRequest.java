package br.com.lastro.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank
    @Email
    @Size(max = 255)
    @Schema(example = "usuario@usuario.com", description = "E-mail do usuário", requiredMode = Schema.RequiredMode.REQUIRED)
    private String email;
    @NotBlank
    @Size(min = 8, max = 64)
    @Schema(example = "senha123", description = "Senha do usuário", requiredMode = Schema.RequiredMode.REQUIRED)
    private String password;

    @NotBlank
    @Size(min = 3, max = 150)
    @Schema(example = "Maria Oliveira", description = "Nome de apresentação do usuário", requiredMode = Schema.RequiredMode.REQUIRED)
    private String presentationName;
}
