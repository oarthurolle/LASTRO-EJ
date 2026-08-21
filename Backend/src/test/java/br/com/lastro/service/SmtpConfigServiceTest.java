package br.com.lastro.service;

import br.com.lastro.dto.smtp.SmtpConfigCreateDTO;
import br.com.lastro.dto.smtp.SmtpConfigUpdateDTO;
import br.com.lastro.entity.SmtpConfig;
import br.com.lastro.exception.exceptions.NotFoundException;
import br.com.lastro.repository.SmtpConfigRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SmtpConfigServiceTest {

    @Mock
    private SmtpConfigRepository repository;

    @InjectMocks
    private SmtpConfigService service;

    private SmtpConfigCreateDTO exampleCreate() {
        SmtpConfigCreateDTO dto = new SmtpConfigCreateDTO();
        dto.setName("Gmail Diretoria");
        dto.setHost("smtp.gmail.com");
        dto.setPort(587);
        dto.setUsername("contato@email.com");
        dto.setPassword("segredo");
        dto.setFromName("LASTRO");
        dto.setFromAddress("contato@email.com");
        dto.setContactRecipient("kaykymarcelo2411@gmail.com");
        dto.setAuth(true);
        dto.setStarttls(true);
        return dto;
    }

    private SmtpConfig savedConfig(Long id, boolean active) {
        SmtpConfig config = new SmtpConfig();
        config.setId(id);
        config.setName("Gmail Diretoria");
        config.setHost("smtp.gmail.com");
        config.setPort(587);
        config.setUsername("contato@email.com");
        config.setPassword("segredo");
        config.setFromName("LASTRO");
        config.setFromAddress("contato@email.com");
        config.setContactRecipient("kaykymarcelo2411@gmail.com");
        config.setAuth(true);
        config.setStarttls(true);
        config.setActive(active);
        return config;
    }

    @Test
    void createShouldAutoActivateWhenNoActiveExists() {
        when(repository.existsByActiveTrue()).thenReturn(false);
        when(repository.save(any(SmtpConfig.class))).thenAnswer(invocation -> {
            SmtpConfig config = invocation.getArgument(0);
            config.setId(1L);
            return config;
        });

        var response = service.create(exampleCreate());

        ArgumentCaptor<SmtpConfig> captor = ArgumentCaptor.forClass(SmtpConfig.class);
        verify(repository).save(captor.capture());

        assertTrue(captor.getValue().getActive());
        assertTrue(response.getActive());
        assertEquals("smtp.gmail.com", response.getHost());
        assertEquals("kaykymarcelo2411@gmail.com", response.getContactRecipient());
    }

    @Test
    void createShouldRemainInactiveWhenAnActiveConfigExists() {
        when(repository.existsByActiveTrue()).thenReturn(true);
        when(repository.save(any(SmtpConfig.class))).thenAnswer(invocation -> {
            SmtpConfig config = invocation.getArgument(0);
            config.setId(2L);
            return config;
        });

        var response = service.create(exampleCreate());

        assertFalse(response.getActive());
    }

    @Test
    void activateShouldDeactivateOthersThenSetActive() {
        SmtpConfig config = savedConfig(1L, false);
        when(repository.findById(1L)).thenReturn(Optional.of(config));
        when(repository.save(any(SmtpConfig.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var response = service.activate(1L);

        verify(repository).deactivateAll();
        assertTrue(config.getActive());
        assertTrue(response.getActive());
    }

    @Test
    void updateShouldPreserveActiveFlag() {
        SmtpConfig config = savedConfig(1L, true);
        when(repository.findById(1L)).thenReturn(Optional.of(config));
        when(repository.save(any(SmtpConfig.class))).thenAnswer(invocation -> invocation.getArgument(0));

        SmtpConfigUpdateDTO request = new SmtpConfigUpdateDTO();
        request.setName("Outlook");
        request.setHost("smtp.office365.com");
        request.setPort(587);
        request.setFromAddress("novo@email.com");

        var response = service.update(1L, request);

        assertTrue(response.getActive());
        assertEquals("Outlook", config.getName());
        assertEquals("smtp.office365.com", config.getHost());
    }

    @Test
    void findByIdShouldThrowWhenNotFound() {
        when(repository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> service.findById(99L));
    }

    @Test
    void deleteShouldThrowWhenNotFound() {
        when(repository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> service.delete(99L));
    }

    @Test
    void activateShouldThrowWhenNotFound() {
        when(repository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> service.activate(99L));
    }
}