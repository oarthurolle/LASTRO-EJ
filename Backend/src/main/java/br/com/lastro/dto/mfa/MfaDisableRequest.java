package br.com.lastro.dto.mfa;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class MfaDisableRequest {

    @NotBlank
    private String currentPassword;

    @NotBlank
    private String code;
}
