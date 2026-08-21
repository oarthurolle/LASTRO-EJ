package br.com.lastro.service;

import br.com.lastro.dto.contact.ContactRequestDTO;
import br.com.lastro.email.service.ApplicationEmailService;
import br.com.lastro.entity.ContactMessage;
import br.com.lastro.exception.exceptions.RateLimitException;
import br.com.lastro.repository.ContactMessageRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class ContactServiceTest {

    @Mock
    private ContactMessageRepository repository;

    @Mock
    private ApplicationEmailService applicationEmailService;

    @InjectMocks
    private ContactService service;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(service, "maxPerWindow", 3);
        ReflectionTestUtils.setField(service, "windowSeconds", 600L);
        service.initRateLimiter();
    }

    @Test
    void submitShouldPersistMessageAndEnqueueEmail() {
        ContactRequestDTO dto = new ContactRequestDTO();
        dto.setName("  Carlos Eduardo  ");
        dto.setEmail("  carlos.leads@gmail.com  ");
        dto.setPhone("");
        dto.setSubject(" Solicitação de Orçamento ");
        dto.setMessage(" Tenho interesse em um diagnóstico financeiro. ");

        service.submit(dto, "10.0.0.1");

        ArgumentCaptor<ContactMessage> captor = ArgumentCaptor.forClass(ContactMessage.class);
        verify(repository).save(captor.capture());
        ContactMessage saved = captor.getValue();

        assertEquals("Carlos Eduardo", saved.getName());
        assertEquals("carlos.leads@gmail.com", saved.getEmail());
        assertNull(saved.getPhone());
        assertEquals("Solicitação de Orçamento", saved.getSubject());
        assertEquals("Tenho interesse em um diagnóstico financeiro.", saved.getMessage());
        verify(applicationEmailService).sendContactMessage(saved);
    }

    @Test
    void submitShouldRejectWhenRateLimitPerIpIsExceeded() {
        ContactRequestDTO dto = new ContactRequestDTO();
        dto.setName("Carlos Eduardo");
        dto.setEmail("carlos.leads@gmail.com");
        dto.setSubject("Orçamento");
        dto.setMessage("Quero um diagnóstico financeiro para a minha empresa.");

        service.submit(dto, "10.0.0.2");
        service.submit(dto, "10.0.0.2");
        service.submit(dto, "10.0.0.2");

        assertThrows(RateLimitException.class, () -> service.submit(dto, "10.0.0.2"));
    }

    @Test
    void rateLimitShouldNotApplyAcrossDistinctIps() {
        ContactRequestDTO dto = new ContactRequestDTO();
        dto.setName("Carlos Eduardo");
        dto.setEmail("carlos.leads@gmail.com");
        dto.setSubject("Orçamento");
        dto.setMessage("Quero um diagnóstico financeiro para a minha empresa.");

        service.submit(dto, "10.0.0.3");
        service.submit(dto, "10.0.0.3");
        service.submit(dto, "10.0.0.3");

        // IP distinto não é afetado pelo limite do IP anterior
        service.submit(dto, "10.0.0.4");
        verify(repository, org.mockito.Mockito.atLeastOnce()).save(any(ContactMessage.class));
    }

    @Test
    void failedSubmissionShouldNotConsumeOrRecordTheIpBudget() {
        ContactRequestDTO dto = new ContactRequestDTO();
        dto.setName("Carlos Eduardo");
        dto.setEmail("carlos.leads@gmail.com");
        dto.setSubject("Orçamento");
        dto.setMessage("Quero um diagnóstico financeiro para a minha empresa.");

        // Falha ao persistir na primeira tentativa
        org.mockito.Mockito.doThrow(new RuntimeException("db down"))
                .doAnswer(invocation -> invocation.getArgument(0))
                .when(repository).save(any(ContactMessage.class));

        assertThrows(RuntimeException.class, () -> service.submit(dto, "10.0.0.6"));
        verify(applicationEmailService, never()).sendContactMessage(any(ContactMessage.class));

        // O contador do IP não foi incrementado: a tentativa seguinte ainda é aceita
        service.submit(dto, "10.0.0.6");
        verify(applicationEmailService).sendContactMessage(any(ContactMessage.class));
    }
}