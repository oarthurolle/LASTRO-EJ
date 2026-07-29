package br.com.lastro.service.auth;

import br.com.lastro.entity.RefreshToken;
import br.com.lastro.entity.User;
import br.com.lastro.entity.UserApprovalStatus;
import br.com.lastro.repository.RefreshTokenRepository;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.BadCredentialsException;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class RefreshTokenServiceTest {

    @Test
    void shouldNotRefreshSessionForPendingUser() {
        RefreshTokenRepository repository = mock(RefreshTokenRepository.class);
        AcessTokenService acessTokenService = mock(AcessTokenService.class);
        RefreshTokenService service = new RefreshTokenService(
                repository,
                acessTokenService,
                new SecureRandom()
        );

        User user = new User();
        user.setId(4L);
        user.setApprovalStatus(UserApprovalStatus.PENDING);
        user.setEmailVerified(true);

        RefreshToken token = new RefreshToken();
        token.setUser(user);
        token.setExpired(false);
        token.setExpiresAt(Instant.now().plusSeconds(300));

        when(repository.findByTokenHashForUpdate(anyString()))
                .thenReturn(Optional.of(token));

        assertThrows(BadCredentialsException.class, () -> service.refresh("refresh-token"));
        verify(repository, never()).save(token);
    }
}
