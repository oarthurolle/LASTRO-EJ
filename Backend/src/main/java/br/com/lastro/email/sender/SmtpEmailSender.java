package br.com.lastro.email.sender;

import br.com.lastro.email.config.MailProperties;
import br.com.lastro.email.model.TransactionalEmail;
import br.com.lastro.entity.SmtpConfig;
import br.com.lastro.service.SmtpConfigService;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;

import java.util.Properties;

@Component
@Slf4j
@RequiredArgsConstructor
public class SmtpEmailSender implements EmailSender {

    private final SmtpConfigService smtpConfigService;
    private final MailProperties mailProperties;

    private volatile CachedSender cached;
    private volatile boolean noConfigLogged = false;

    @Override
    public void send(TransactionalEmail email) {
        if (!mailProperties.isEnabled()) {
            return;
        }

        SmtpConfig config = smtpConfigService.getActiveConfig();
        if (config == null) {
            logMissingActiveConfig();
            return;
        }

        JavaMailSenderImpl sender = resolveSender(config);
        MimeMessage mimeMessage = sender.createMimeMessage();

        try {
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            helper.setTo(email.getTo());
            helper.setFrom(config.getFromAddress(), config.getFromName());
            helper.setSubject(email.getSubject());
            helper.setText(email.getTextBody(), email.getHtmlBody());
            sender.send(mimeMessage);
        } catch (Exception ex) {
            throw new IllegalStateException("Falha ao enviar email SMTP", ex);
        }
    }

    private JavaMailSenderImpl resolveSender(SmtpConfig config) {
        String key = config.getId() + ":" + config.getUpdatedAt();
        CachedSender current = cached;
        if (current != null && key.equals(current.key)) {
            return current.sender;
        }

        JavaMailSenderImpl sender = new JavaMailSenderImpl();
        sender.setHost(config.getHost());
        sender.setPort(config.getPort());
        sender.setUsername(config.getUsername());
        sender.setPassword(config.getPassword());

        Properties props = sender.getJavaMailProperties();
        props.put("mail.smtp.auth", String.valueOf(Boolean.TRUE.equals(config.getAuth())));
        props.put("mail.smtp.starttls.enable", String.valueOf(Boolean.TRUE.equals(config.getStarttls())));
        props.put("mail.smtp.connectiontimeout", "5000");
        props.put("mail.smtp.timeout", "5000");
        props.put("mail.smtp.writetimeout", "5000");

        cached = new CachedSender(key, sender);
        return sender;
    }

    private void logMissingActiveConfig() {
        if (!noConfigLogged) {
            noConfigLogged = true;
            log.info("Nenhuma configuração SMTP ativa cadastrada; envio de e-mail ignorado silenciosamente.");
        }
    }

    private record CachedSender(String key, JavaMailSenderImpl sender) {
    }
}