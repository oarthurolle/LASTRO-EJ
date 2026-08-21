package br.com.lastro.dto.smtp;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SmtpConfigCreateDTO {

    @NotBlank(message = "O nome é obrigatório")
    private String name;

    @NotBlank(message = "O host é obrigatório")
    private String host;

    @NotNull(message = "A porta é obrigatória")
    @Min(value = 1, message = "A porta deve ser um valor positivo")
    @Max(value = 65535, message = "A porta deve estar entre 1 e 65535")
    private Integer port;

    private String username;

    private String password;

    private String fromName;

    @NotBlank(message = "O e-mail remetente é obrigatório")
    private String fromAddress;

    private String contactRecipient;

    private Boolean auth;

    private Boolean starttls;
}