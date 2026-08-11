package br.com.lastro.email.sender;

import br.com.lastro.email.config.MailProperties;
import br.com.lastro.email.model.EmailType;
import br.com.lastro.email.model.TransactionalEmail;
import br.com.lastro.entity.SmtpConfig;
import br.com.lastro.service.SmtpConfigService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SmtpEmailSenderTest {

    @Mock
    private SmtpConfigService smtpConfigService;

    @Mock
    private MailProperties mailProperties;

    @InjectMocks
    private SmtpEmailSender sender;

    @Test
    void sendWithoutActiveConfigShouldFailSilently() {
        when(mailProperties.isEnabled()).thenReturn(true);
        when(smtpConfigService.getActiveConfig()).thenReturn(null);

        assertDoesNotThrow(() ->
                sender.send(buildEmail()));
    }

    @Test
    void sendWhenMailDisabledShouldDoNothing() {
        when(mailProperties.isEnabled()).thenReturn(false);

        assertDoesNotThrow(() ->
                sender.send(buildEmail()));

        verify(smtpConfigService, never()).getActiveConfig();
    }

    private TransactionalEmail buildEmail() {
        return TransactionalEmail.builder()
                .to("destino@example.com")
                .subject("Assunto teste")
                .textBody("Corpo texto")
                .htmlBody("<p>Corpo html</p>")
                .type(EmailType.CONTACT)
                .idempotencyKey("key:1")
                .build();
    }
}