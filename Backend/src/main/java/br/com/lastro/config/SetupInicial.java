package br.com.lastro.config;

import br.com.lastro.entity.User;
import br.com.lastro.entity.UserApprovalStatus;
import br.com.lastro.repository.RoleRepository;
import br.com.lastro.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.env.Environment;
import org.springframework.core.env.Profiles;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Locale;
import java.util.Set;

@Component
@RequiredArgsConstructor
@Slf4j
public class SetupInicial implements ApplicationRunner {
    private final BCryptPasswordEncoder passwordEncoder;
    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final Environment environment;

    @Value("${server.servlet.context-path:}")
    private String contextPath;
    @Value("${springdoc.swagger-ui.path:/swagger-ui.html}")
    private String swaggerPath;
    @Value("${bootstrap.admin.email}")
    private String adminEmail;
    @Value("${bootstrap.admin.password}")
    private String adminPassword;
    @Value("${bootstrap.admin.presentation-name}")
    private String adminPresentationName;

    @Override
    public void run(ApplicationArguments args) {
        if (!userRepository.findByRole("DIRECTOR").isEmpty()) {
            log.info(
                    "Setup inicial ignorado: já existe uma conta DIRECTOR. "
                            + "As propriedades bootstrap.admin.* só são usadas na primeira criação."
            );
            return;
        }

        String normalizedEmail = requireValidEmail(adminEmail);
        String presentationName = requireNonBlank(adminPresentationName, "nome do diretor");
        if (adminPassword == null || adminPassword.length() < 8) {
            throw new IllegalStateException(
                    "bootstrap.admin.password deve possuir ao menos 8 caracteres."
            );
        }

        if (userRepository.findByEmail(normalizedEmail).isPresent()) {
            throw new IllegalStateException(
                    "O e-mail configurado para o diretor já pertence a outro usuário."
            );
        }

        var directorRole = roleRepository.findByName("DIRECTOR")
                .orElseThrow(() -> new IllegalStateException("Role DIRECTOR não encontrada."));

        User director = new User();
        director.setEmail(normalizedEmail);
        director.setPassword(passwordEncoder.encode(adminPassword));
        director.setRoles(Set.of(directorRole));
        director.setPresentationName(presentationName);
        director.setEmailVerified(true);
        director.setApprovalStatus(UserApprovalStatus.APPROVED);
        director.setMfaEnabled(false);
        userRepository.save(director);

        log.info("Setup inicial concluído: conta da diretoria geral criada.");
    }

    @EventListener(ApplicationReadyEvent.class)
    public void logSwaggerUrl() {
        if (!environment.acceptsProfiles(Profiles.of("dev"))) {
            return;
        }

        String port = environment.getProperty(
                "local.server.port",
                environment.getProperty("server.port", "8080")
        );
        String base = "http://localhost:" + port + (contextPath == null ? "" : contextPath);
        String url = swaggerPath.startsWith("/") ? base + swaggerPath : base + "/" + swaggerPath;
        log.info("Swagger UI disponível em: {}", url);
        log.info("OpenAPI JSON disponível em: {}/v3/api-docs", base);
    }

    private String requireValidEmail(String value) {
        String email = requireNonBlank(value, "e-mail do diretor").toLowerCase(Locale.ROOT);
        if (!email.matches("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$")) {
            throw new IllegalStateException("bootstrap.admin.email deve ser um e-mail válido.");
        }
        return email;
    }

    private String requireNonBlank(String value, String field) {
        if (value == null || value.isBlank()) {
            throw new IllegalStateException("Configure o " + field + " no application.properties.");
        }
        return value.trim();
    }
}
