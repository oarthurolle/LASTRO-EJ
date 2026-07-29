package br.com.lastro.service.auth;

import br.com.lastro.dto.LoginResponse;
import br.com.lastro.dto.RefreshTokenCreationDto;
import br.com.lastro.dto.mfa.MfaDisableRequest;
import br.com.lastro.dto.mfa.MfaSetupResponse;
import br.com.lastro.dto.mfa.MfaVerifyRequest;
import br.com.lastro.entity.User;
import br.com.lastro.entity.UserApprovalStatus;
import br.com.lastro.exception.exceptions.ApiException;
import br.com.lastro.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.Duration;

@Service
@RequiredArgsConstructor
public class MfaService {

    private final JwtDecoder jwtDecoder;
    private final MfaTokenManager mfaTokenManager;
    private final UserRepository userRepository;
    private final AcessTokenService acessTokenService;
    private final RefreshTokenService refreshTokenService;
    private final MfaSecretProtectionService mfaSecretProtectionService;
    private final BCryptPasswordEncoder passwordEncoder;
    private final BruteforceProtectionService bruteforceProtectionService;

    @Value("${jwt.token.expires.in}")
    private Long expiresIn;

    @Transactional
    public MfaSetupResponse mfaSetupForUser(Long userId) {
        requireProtectedMfaStorage();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BadCredentialsException("Usuário não encontrado"));

        if (user.isMfaEnabled()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Usuário ja possui o mfa habilitado!");
        }

        // se não tem secret por algum motivo, gere
        if (user.getSecret() == null || user.getSecret().isBlank()) {
            user.setSecret(mfaSecretProtectionService.protect(mfaTokenManager.generateSecretKey()));
        } else {
            migrateSecretIfNeeded(user);
        }

        MfaSetupResponse resp = new MfaSetupResponse();
        resp.setMfaEnabled(user.isMfaEnabled());
        resp.setQrCodeDataUri(mfaTokenManager.generateQrCode(user.getEmail(), revealSecret(user)));

        return resp;
    }

    @Transactional
    public void confirmMfa(Long userId, String code) {
        requireProtectedMfaStorage();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BadCredentialsException("Usuário não encontrado"));

        if (user.isMfaEnabled()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Usuário ja possui o mfa habilitado!");
        }

        if (user.getSecret() == null || user.getSecret().isBlank()) {
            throw new BadCredentialsException("MFA não iniciado");
        }

        String rawSecret = revealSecret(user);
        migrateSecretIfNeeded(user);

        if (!mfaTokenManager.verifyTotp(code, rawSecret)) {
            throw new BadCredentialsException("Código MFA inválido!");
        }

        user.setMfaEnabled(true);
        refreshTokenService.revokeAllByUser(user);
    }

    @Transactional
    public LoginResponse verifyMfa(MfaVerifyRequest req) {
        Jwt jwt = null;
        try{
            jwt = jwtDecoder.decode(req.getMfaToken());
        } catch (Exception e) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Token MFA inválido ou expirado");
        }

        // valida claims
        if (!"mfa_challenge".equals(jwt.getClaimAsString("typ")) ||
                !"pending".equals(jwt.getClaimAsString("mfa"))) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Token MFA inválido!");
        }

        Long userId = Long.valueOf(jwt.getSubject());
        String rateLimitKey = "mfa_verify:" + userId;
        bruteforceProtectionService.assertNotBlocked(rateLimitKey);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Token MFA inválido!"));

        if (user.getApprovalStatus() != UserApprovalStatus.APPROVED || !user.isEmailVerified()) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Usuário sem acesso aprovado.");
        }

        if (!user.isMfaEnabled()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "MFA não habilitado!");
        }

        String rawSecret = revealSecret(user);
        migrateSecretIfNeeded(user);

        if (!mfaTokenManager.verifyTotp(req.getMfaCode(), rawSecret)) {
            bruteforceProtectionService.onLoginFailure(rateLimitKey);
            throw new ApiException(HttpStatus.BAD_REQUEST, "Código MFA inválido!");
        }
        bruteforceProtectionService.onLoginSuccess(rateLimitKey);

        // emite JWT final
        var jwtFinal = acessTokenService.getAcessToken(user, true);
        RefreshTokenCreationDto refreshTokenDto = refreshTokenService.create(user, Duration.ofDays(7), true);

        LoginResponse resp = new LoginResponse();
        resp.setAuthenticated(true);
        resp.setMfaRequired(false);
        resp.setToken(jwtFinal);
        resp.setRefreshToken(refreshTokenDto.getRawToken());
        resp.setExpiresInSeconds(expiresIn);
        return resp;
    }

    @Transactional
    public void disableMfa(Long userId, MfaDisableRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BadCredentialsException("Usuário não encontrado"));

        if (!user.isMfaEnabled()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "MFA não está habilitado para este usuário.");
        }

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadCredentialsException("Senha atual inválida.");
        }

        String rawSecret = revealSecret(user);
        if (!mfaTokenManager.verifyTotp(request.getCode(), rawSecret)) {
            throw new BadCredentialsException("Código MFA inválido!");
        }

        user.setMfaEnabled(false);
        user.setSecret(null);
        refreshTokenService.revokeAllByUser(user);
    }

    private String revealSecret(User user) {
        if (!StringUtils.hasText(user.getSecret())) {
            throw new BadCredentialsException("MFA não iniciado");
        }

        return mfaSecretProtectionService.reveal(user.getSecret());
    }

    private void migrateSecretIfNeeded(User user) {
        if (!mfaSecretProtectionService.requiresMigration(user.getSecret())) {
            return;
        }

        user.setSecret(mfaSecretProtectionService.protect(user.getSecret()));
    }

    private void requireProtectedMfaStorage() {
        if (!mfaSecretProtectionService.isProtectionEnabled()) {
            throw new ApiException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "O MFA está indisponível até que a chave de criptografia seja configurada."
            );
        }
    }
}
