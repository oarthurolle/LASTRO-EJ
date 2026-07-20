package br.com.lastro.email.service;

import br.com.lastro.email.config.MailProperties;
import br.com.lastro.email.model.EmailType;
import br.com.lastro.email.model.TransactionalEmail;
import br.com.lastro.email.queue.EmailQueuePort;
import br.com.lastro.email.template.EmailTemplateRenderer;
import br.com.lastro.email.template.RenderedEmailTemplate;
import br.com.lastro.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class ApplicationEmailService {

    private final EmailTemplateRenderer templateRenderer;
    private final EmailQueuePort emailQueuePort;
    private final MailProperties mailProperties;

    @Value("${spring.application.name}")
    private String appName;

    public void sendEmailVerification(User user, String rawToken) {
        queueTemplateEmail(
                user.getEmail(),
                EmailType.EMAIL_VERIFICATION,
                Map.of(
                        "verificationUrl", mailProperties.getBaseUrl() + "/auth/verify-email?token=" + rawToken,
                        "appName", appName
                ),
                "verify:" + user.getId() + ":" + rawToken
        );
    }

    public void sendForgotPassword(User user, String rawToken) {
        queueTemplateEmail(
                user.getEmail(),
                EmailType.PASSWORD_RESET,
                Map.of(
                        "resetUrl", mailProperties.getBaseUrl() + "/auth/reset-password?token=" + rawToken,
                        "appName", appName
                ),
                "forgot:" + user.getId() + ":" + rawToken
        );
    }

    private void queueTemplateEmail(
            String recipient,
            EmailType type,
            Map<String, Object> model,
            String idempotencyKey
    ) {
        RenderedEmailTemplate template = templateRenderer.render(type, model);
        emailQueuePort.enqueue(TransactionalEmail.builder()
                .to(recipient)
                .subject(template.getSubject())
                .htmlBody(template.getHtmlBody())
                .textBody(template.getTextBody())
                .type(type)
                .idempotencyKey(idempotencyKey)
                .build());
    }
}
