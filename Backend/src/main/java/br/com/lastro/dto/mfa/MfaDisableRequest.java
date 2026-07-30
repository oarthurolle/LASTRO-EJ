package br.com.lastro.dto.mfa;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@Data
public class MfaDisableRequest {

    @NotBlank
    @Size(max = 128)
    private String currentPassword;

    @NotBlank
    @Pattern(regexp = "\\d{6}", message = "O código MFA deve conter 6 dígitos")
    private String code;
}
