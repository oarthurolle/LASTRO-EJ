package br.com.lastro.dto.contact;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ContactRequestDTO {

    @NotBlank(message = "O nome é obrigatório")
    @Size(max = 255, message = "O nome deve ter no máximo 255 caracteres")
    private String name;

    @NotBlank(message = "O e-mail é obrigatório")
    @Size(max = 255, message = "O e-mail deve ter no máximo 255 caracteres")
    @Email(
            regexp = "^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$",
            message = "O e-mail informado não é válido"
    )
    private String email;

    @Size(max = 50, message = "O telefone deve ter no máximo 50 caracteres")
    @Pattern(regexp = "^$|^[0-9()\\s+.-]+$", message = "O telefone informado não é válido")
    private String phone;

    @NotBlank(message = "O assunto é obrigatório")
    @Size(max = 255, message = "O assunto deve ter no máximo 255 caracteres")
    private String subject;

    @NotBlank(message = "A mensagem é obrigatória")
    @Size(max = 5000, message = "A mensagem deve ter no máximo 5000 caracteres")
    private String message;
}