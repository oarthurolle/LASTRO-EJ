package br.com.lastro.service.auth;

import br.com.lastro.dto.RefreshTokenCreationDto;
import br.com.lastro.dto.TokenPairDTO;
import br.com.lastro.entity.RefreshToken;
import br.com.lastro.entity.User;
import br.com.lastro.entity.UserApprovalStatus;
import br.com.lastro.repository.RefreshTokenRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.apache.commons.codec.digest.DigestUtils;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final AcessTokenService acessTokenService;
    private final SecureRandom secureRandom;

    public RefreshTokenCreationDto create(User user, Duration duration, boolean mfaVerified) {
        String rawToken = generateSecureToken();

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUser(user);
        refreshToken.setTokenHash(hashToken(rawToken));
        refreshToken.setCreatedAt(Instant.now());
        refreshToken.setExpiresAt(Instant.now().plus(duration));
        refreshToken.setExpired(false);
        refreshToken.setMfaVerified(mfaVerified);

        refreshTokenRepository.save(refreshToken);
        return new RefreshTokenCreationDto(rawToken, refreshToken.getExpiresAt());
    }

    public RefreshToken validateAndGetToken(String rawToken) {
        RefreshToken token = refreshTokenRepository.findByTokenHash(hashToken(rawToken))
                .orElseThrow(() -> new BadCredentialsException("Refresh token inválido"));
        validateActive(token);
        return token;
    }

    public void revoke(String rawToken) {
        refreshTokenRepository.findByTokenHash(hashToken(rawToken)).ifPresent(token -> {
            token.setExpired(true);
            token.setExpiredAt(Instant.now());
            refreshTokenRepository.save(token);
        });
    }

    @Transactional
    public void revokeOwnedToken(User owner, String rawToken) {
        RefreshToken token = validateAndGetToken(rawToken);
        if (!token.getUser().getId().equals(owner.getId())) {
            throw new BadCredentialsException("Refresh token inválido");
        }

        token.setExpired(true);
        token.setExpiredAt(Instant.now());
        refreshTokenRepository.save(token);
    }

    @Transactional
    public TokenPairDTO refresh(String rawRefreshToken) {
        RefreshToken persistedToken = refreshTokenRepository
                .findByTokenHashForUpdate(hashToken(rawRefreshToken))
                .orElseThrow(() -> new BadCredentialsException("Refresh token inválido"));
        validateActive(persistedToken);

        User user = persistedToken.getUser();
        if (user.getApprovalStatus() != UserApprovalStatus.APPROVED || !user.isEmailVerified()) {
            throw new BadCredentialsException("Usuário sem acesso aprovado.");
        }
        if (user.isMfaEnabled() && !Boolean.TRUE.equals(persistedToken.getMfaVerified())) {
            throw new BadCredentialsException(
                    "Sessão inválida para a política atual de MFA. Faça login novamente."
            );
        }

        persistedToken.setExpired(true);
        persistedToken.setExpiredAt(Instant.now());
        refreshTokenRepository.save(persistedToken);

        boolean mfaVerified = Boolean.TRUE.equals(persistedToken.getMfaVerified());
        var newRefreshToken = create(user, Duration.ofDays(7), mfaVerified);
        String newJwt = acessTokenService.getAcessToken(user, mfaVerified);
        return new TokenPairDTO(newJwt, newRefreshToken.getRawToken());
    }

    @Transactional
    public void revokeAllByUser(User user) {
        refreshTokenRepository.deleteAllByUser(user);
    }

    private void validateActive(RefreshToken token) {
        if (token.getExpired()) {
            throw new BadCredentialsException("Refresh token revogado");
        }
        if (token.getExpiresAt().isBefore(Instant.now())) {
            throw new BadCredentialsException("Refresh token expirado");
        }
    }

    private String generateSecureToken() {
        byte[] bytes = new byte[64];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String hashToken(String rawToken) {
        return DigestUtils.sha256Hex(rawToken);
    }
}
