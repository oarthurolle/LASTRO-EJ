package br.com.lastro.service.auth;

import br.com.lastro.dto.*;
import br.com.lastro.email.service.ApplicationEmailService;
import br.com.lastro.entity.EmailTokenType;
import br.com.lastro.entity.User;
import br.com.lastro.entity.UserApprovalStatus;
import br.com.lastro.exception.exceptions.ApiException;
import br.com.lastro.exception.exceptions.ConflictException;
import br.com.lastro.exception.exceptions.EmailNotVerifiedException;
import br.com.lastro.exception.exceptions.NotFoundException;
import br.com.lastro.repository.RoleRepository;
import br.com.lastro.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.Set;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final JwtEncoder jwtEncoder;
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder bCryptPasswordEncoder;
    private final RoleRepository roleRepository;
    private final AcessTokenService acessTokenService;
    private final RefreshTokenService refreshTokenService;
    private final EmailTokenService emailTokenService;
    private final ApplicationEmailService applicationEmailService;

    private final BruteforceProtectionService bruteforceProtectionService;
    private final HttpServletRequest request;

    @Value("${jwt.token.expires.in}")
    private Long expiresIn;
    @Value("${spring.application.name}")
    private String issuer;

    public LoginResponse login(LoginRequest loginRequest) {
        String email = loginRequest.getEmail().trim().toLowerCase(Locale.ROOT);
        String ip = clientIp(request);

        String keyIp = "ip:" + ip;
        String keyIpEmail = "ip_email:" + ip + "|" + email;

        bruteforceProtectionService.assertNotBlocked(keyIp);
        bruteforceProtectionService.assertNotBlocked(keyIpEmail);

        var user = userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    bruteforceProtectionService.onLoginFailure(keyIp);
                    bruteforceProtectionService.onLoginFailure(keyIpEmail);
                    return new BadCredentialsException("Credenciais inválidas!");
                });
        if ( !passwordMatches(loginRequest.getPassword(), user.getPassword()) ) {
            bruteforceProtectionService.onLoginFailure(keyIp);
            bruteforceProtectionService.onLoginFailure(keyIpEmail);
            throw new BadCredentialsException("Credenciais inválidas!");
        }

        if (user.getApprovalStatus() == UserApprovalStatus.PENDING) {
            throw new ApiException(
                    HttpStatus.FORBIDDEN,
                    "Seu cadastro ainda aguarda aprovação da diretoria."
            );
        }

        if (user.getApprovalStatus() == UserApprovalStatus.REJECTED) {
            throw new ApiException(
                    HttpStatus.FORBIDDEN,
                    "Sua solicitação de acesso não foi aprovada. Entre em contato com a diretoria."
            );
        }

        if (!user.isEmailVerified()) {
            throw new EmailNotVerifiedException("Email não verificado. Solicite um novo link de confirmação.");
        }

        bruteforceProtectionService.onLoginSuccess(keyIp);
        bruteforceProtectionService.onLoginSuccess(keyIpEmail);

        LoginResponse loginResponse = new LoginResponse();
        // MFA habilitado
        if (user.isMfaEnabled()) {
            String mfaToken = generateMfaChallengeToken(user);

            loginResponse.setAuthenticated(false);
            loginResponse.setMfaRequired(true);
            loginResponse.setEmailVerificationRequired(false);
            loginResponse.setMfaToken(mfaToken);
            loginResponse.setExpiresInSeconds(300L);
            return loginResponse;
        }

        var jwtValue = acessTokenService.getAcessToken(user, false);
        RefreshTokenCreationDto refreshTokenDto = refreshTokenService.create(user, Duration.ofDays(7), false);

        loginResponse.setToken(jwtValue);
        loginResponse.setRefreshToken(refreshTokenDto.getRawToken());
        loginResponse.setAuthenticated(true);
        loginResponse.setMfaRequired(false);
        loginResponse.setEmailVerificationRequired(false);
        loginResponse.setExpiresInSeconds(expiresIn);

        return loginResponse;
    }

    public RegisterResponse register(RegisterRequest registerRequest) {
        consumePublicActionQuota("register");
        String normalizedEmail = registerRequest.getEmail().trim().toLowerCase(Locale.ROOT);

        // Verifica se o usuario ja existe no banco de dados
        var existingUser = userRepository.findByEmail(normalizedEmail);
        if ( existingUser.isPresent() ) {
            throw new ConflictException("E-mail já cadastrado");
        }

        var basicRole = roleRepository.findByName("BASIC")
                .orElseThrow(() -> new RuntimeException("Role não encontrada!"));

        User user = new User();
        user.setEmail(normalizedEmail);
        user.setPassword(bCryptPasswordEncoder.encode(registerRequest.getPassword()));
        user.setPresentationName(registerRequest.getPresentationName().trim());
        user.setRoles(Set.of(basicRole));
        user.setSecret(null);
        user.setMfaEnabled(false);
        user.setEmailVerified(true);
        user.setApprovalStatus(UserApprovalStatus.PENDING);

        User savedUser = userRepository.save(user);

        return RegisterResponse.builder()
                .message("Solicitação enviada. Você poderá entrar no painel após a aprovação de um diretor.")
                .email(savedUser.getEmail())
                .verificationRequired(false)
                .approvalRequired(true)
                .build();
    }

    public void logout(Long authenticatedUserId, RefreshRequest request) {
        User user = userRepository.findById(authenticatedUserId)
                .orElseThrow(() -> new NotFoundException("Usuário não encontrado."));

        refreshTokenService.revokeOwnedToken(user, request.getRefreshToken());
    }

    public GenericMessageResponse verifyEmail(String token) {
        User user = emailTokenService.consume(token, EmailTokenType.EMAIL_VERIFICATION);
        user.setEmailVerified(true);
        userRepository.save(user);
        return new GenericMessageResponse("Email verificado com sucesso!");
    }

    public GenericMessageResponse resendVerification(ResendVerificationRequest request) {
        consumePublicActionQuota("resend-verification");
        String email = request.getEmail().trim().toLowerCase(Locale.ROOT);
        userRepository.findByEmail(email)
                .filter(user -> !user.isEmailVerified())
                .ifPresent(user -> {
                    String rawToken = emailTokenService.create(user, EmailTokenType.EMAIL_VERIFICATION, Duration.ofHours(24));
                    applicationEmailService.sendEmailVerification(user, rawToken);
                });

        return new GenericMessageResponse(
                "Se o email estiver cadastrado e pendente de verificação, uma nova mensagem foi enviada."
        );
    }

    public GenericMessageResponse forgotPassword(ForgotPasswordRequest request) {
        consumePublicActionQuota("forgot-password");
        String email = request.getEmail().trim().toLowerCase(Locale.ROOT);
        userRepository.findByEmail(email)
                .filter(User::isEmailVerified)
                .ifPresent(user -> {
                    String rawToken = emailTokenService.create(user, EmailTokenType.PASSWORD_RESET, Duration.ofHours(2));
                    applicationEmailService.sendForgotPassword(user, rawToken);
                });

        return new GenericMessageResponse(
                "Se o email estiver cadastrado, enviaremos instruções para continuar a recuperação de senha."
        );
    }

    private boolean passwordMatches(String loginPassword, String userPassword) {
        return bCryptPasswordEncoder.matches(loginPassword, userPassword);
    }

    private String clientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");

        if (xForwardedFor != null && !xForwardedFor.isBlank()) {
            return xForwardedFor.split(",")[0].trim();
        }

        String realIp = request.getHeader("X-Real-IP");

        if (realIp != null && !realIp.isBlank()) {
            return realIp;
        }

        return request.getRemoteAddr();
    }

    private String generateMfaChallengeToken(User user) {
        Instant now = Instant.now();

        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer(issuer)
                .subject(user.getId().toString())
                .issuedAt(now)
                .expiresAt(now.plusSeconds(300))
                .claim("typ", "mfa_challenge")
                .claim("mfa", "pending")
                .build();

        return jwtEncoder.encode(JwtEncoderParameters.from(claims)).getTokenValue();
    }

    private void consumePublicActionQuota(String action) {
        String key = "public_action:" + action + ":" + clientIp(request);
        bruteforceProtectionService.assertNotBlocked(key);
        bruteforceProtectionService.onLoginFailure(key);
    }
}
