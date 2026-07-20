package br.com.lastro.dto.mfa;

import lombok.Data;

@Data
public class MfaSetupResponse {
    private boolean mfaEnabled;
    private String qrCodeDataUri;
}
