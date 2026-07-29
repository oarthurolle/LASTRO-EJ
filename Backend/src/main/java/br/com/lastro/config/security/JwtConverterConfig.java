package br.com.lastro.config.security;

import br.com.lastro.entity.UserApprovalStatus;
import br.com.lastro.repository.UserRepository;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;

import java.util.LinkedHashSet;

@Configuration
public class JwtConverterConfig {

    @Bean
    public Converter<Jwt, ? extends AbstractAuthenticationToken> jwtAuthenticationConverter(
            UserRepository userRepository
    ) {
        return jwt -> {
            if (!"access".equals(jwt.getClaimAsString("typ"))) {
                throw new BadCredentialsException("Tipo de token inválido.");
            }

            Long userId;
            try {
                userId = Long.valueOf(jwt.getSubject());
            } catch (RuntimeException exception) {
                throw new BadCredentialsException("Token inválido.", exception);
            }

            var user = userRepository.findById(userId)
                    .orElseThrow(() -> new BadCredentialsException("Usuário não encontrado."));

            if (user.getApprovalStatus() != UserApprovalStatus.APPROVED) {
                throw new DisabledException("Usuário sem acesso aprovado.");
            }

            var authorities = new LinkedHashSet<SimpleGrantedAuthority>();
            if (user.getRoles() != null) {
                user.getRoles().forEach(role -> {
                    authorities.add(new SimpleGrantedAuthority("ROLE_" + role.getName()));
                    if (role.getPrivileges() != null) {
                        role.getPrivileges().forEach(privilege ->
                                authorities.add(new SimpleGrantedAuthority(privilege.getName()))
                        );
                    }
                });
            }

            var principal = new UsuarioPrincipal(user, authorities);
            return new UsernamePasswordAuthenticationToken(
                    principal,
                    jwt.getTokenValue(),
                    authorities
            );
        };
    }
}
