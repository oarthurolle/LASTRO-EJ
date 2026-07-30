package br.com.lastro.dto.mfa;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import jakarta.validation.constraints.Pattern;

@Data
public class MfaConfirmRequest {
    @NotBlank
    @Pattern(regexp = "\\d{6}", message = "O código MFA deve conter 6 dígitos")
    private String code;
}
