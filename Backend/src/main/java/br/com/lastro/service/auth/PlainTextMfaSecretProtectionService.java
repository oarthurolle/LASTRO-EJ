package br.com.lastro.service.auth;

import lombok.extern.slf4j.Slf4j;

@Slf4j
public class PlainTextMfaSecretProtectionService implements MfaSecretProtectionService {

    public PlainTextMfaSecretProtectionService() {
        log.warn("Chave de criptografia do MFA não encontrada. Novas configurações de MFA permanecerão bloqueadas.");
    }

    @Override
    public String protect(String rawSecret) {
        return rawSecret;
    }

    @Override
    public String reveal(String storedSecret) {
        return storedSecret;
    }

    @Override
    public boolean isProtectionEnabled() {
        return false;
    }
}
