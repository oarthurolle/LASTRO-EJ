package br.com.lastro.config.security;

import br.com.lastro.entity.User;
import br.com.lastro.entity.UserApprovalStatus;
import br.com.lastro.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.oauth2.jwt.Jwt;

import java.time.Instant;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class JwtConverterConfigTest {

    @Test
    void shouldRejectMfaChallengeAsAccessToken() {
        UserRepository repository = mock(UserRepository.class);
        var converter = new JwtConverterConfig().jwtAuthenticationConverter(repository);

        assertThrows(
                BadCredentialsException.class,
                () -> converter.convert(jwt("mfa_challenge"))
        );
    }

    @Test
    void shouldRejectAccessTokenWhenUserIsNotApproved() {
        UserRepository repository = mock(UserRepository.class);
        User user = new User();
        user.setId(1L);
        user.setEmail("pending@example.com");
        user.setRoles(Set.of());
        user.setApprovalStatus(UserApprovalStatus.PENDING);
        when(repository.findById(1L)).thenReturn(Optional.of(user));

        var converter = new JwtConverterConfig().jwtAuthenticationConverter(repository);
        assertThrows(DisabledException.class, () -> converter.convert(jwt("access")));
    }

    private Jwt jwt(String type) {
        Instant now = Instant.now();
        return Jwt.withTokenValue("token")
                .header("alg", "RS256")
                .subject("1")
                .claim("typ", type)
                .issuedAt(now)
                .expiresAt(now.plusSeconds(300))
                .build();
    }
}
