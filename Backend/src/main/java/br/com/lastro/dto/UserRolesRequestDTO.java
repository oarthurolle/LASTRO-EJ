package br.com.lastro.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.Set;

@Data
public class UserRolesRequestDTO {
    @Schema(
            description = "Lista de cargos gerenciáveis a serem atribuídos ao usuário",
            example = "[\"ADMIN\"]"
    )
    @NotEmpty(message = "A lista de roles não pode estar vazia.")
    private Set<String> roles;
}
