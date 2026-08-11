package br.com.lastro.email.service;

import br.com.lastro.email.config.MailProperties;
import br.com.lastro.email.model.EmailType;
import br.com.lastro.email.model.TransactionalEmail;
import br.com.lastro.email.queue.EmailQueuePort;
import br.com.lastro.email.template.EmailTemplateRenderer;
import br.com.lastro.email.template.RenderedEmailTemplate;
import br.com.lastro.entity.ContactMessage;
import br.com.lastro.entity.SmtpConfig;
import br.com.lastro.entity.User;
import br.com.lastro.service.SmtpConfigService;
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
    private final SmtpConfigService smtpConfigService;

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

    public void sendContactMessage(ContactMessage message) {
        SmtpConfig activeConfig = smtpConfigService.getActiveConfig();
        if (activeConfig == null || activeConfig.getContactRecipient() == null
                || activeConfig.getContactRecipient().isBlank()) {
            return;
        }
        queueTemplateEmail(
                activeConfig.getContactRecipient(),
                EmailType.CONTACT,
                Map.of(
                        "name", escapeHtml(message.getName()),
                        "email", escapeHtml(message.getEmail()),
                        "phone", escapeHtml(message.getPhone() == null ? "" : message.getPhone()),
                        "subject", escapeHtml(message.getSubject()),
                        "message", escapeHtml(message.getMessage()),
                        "appName", appName
                ),
                "contact:" + message.getId()
        );
    }

    private String escapeHtml(String value) {
        if (value == null || value.isBlank()) {
            return "";
        }
        return value
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
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
