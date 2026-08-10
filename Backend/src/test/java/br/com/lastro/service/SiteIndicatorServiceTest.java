package br.com.lastro.service;

import br.com.lastro.dto.indicator.IndicatorCreateDTO;
import br.com.lastro.dto.indicator.IndicatorUpdateDTO;
import br.com.lastro.entity.SiteIndicator;
import br.com.lastro.exception.exceptions.NotFoundException;
import br.com.lastro.repository.SiteIndicatorRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SiteIndicatorServiceTest {

    @Mock
    private SiteIndicatorRepository repository;

    @InjectMocks
    private SiteIndicatorService service;

    @Test
    void createShouldSaveAndReturnDto() {
        IndicatorCreateDTO request = new IndicatorCreateDTO();
        request.setName("Projetos Realizados");
        request.setValue("10+");
        request.setDescription("Projetos");

        when(repository.save(any(SiteIndicator.class))).thenAnswer(invocation -> {
            SiteIndicator indicator = invocation.getArgument(0);
            indicator.setId(1L);
            return indicator;
        });

        var response = service.create(request);

        ArgumentCaptor<SiteIndicator> captor = ArgumentCaptor.forClass(SiteIndicator.class);
        verify(repository).save(captor.capture());
        SiteIndicator saved = captor.getValue();

        assertEquals("Projetos Realizados", saved.getName());
        assertEquals("10+", saved.getValue());
        assertEquals(1L, response.getId());
    }

    @Test
    void updateShouldModifyAndReturnDto() {
        SiteIndicator existing = new SiteIndicator();
        existing.setId(1L);
        existing.setName("Antigo");
        existing.setValue("10");

        when(repository.findById(1L)).thenReturn(Optional.of(existing));
        when(repository.save(any(SiteIndicator.class))).thenAnswer(i -> i.getArgument(0));

        IndicatorUpdateDTO request = new IndicatorUpdateDTO();
        request.setName("Novo Nome");
        request.setValue("20");
        request.setDescription("Nova desc");

        var response = service.update(1L, request);

        ArgumentCaptor<SiteIndicator> captor = ArgumentCaptor.forClass(SiteIndicator.class);
        verify(repository).save(captor.capture());
        SiteIndicator saved = captor.getValue();

        assertEquals("Novo Nome", saved.getName());
        assertEquals("20", saved.getValue());
        assertEquals("Nova desc", saved.getDescription());
        assertEquals("Novo Nome", response.getName());
    }

    @Test
    void updateShouldThrowWhenIdNotFound() {
        when(repository.findById(99L)).thenReturn(Optional.empty());

        IndicatorUpdateDTO request = new IndicatorUpdateDTO();
        request.setName("Teste");
        request.setValue("1");

        assertThrows(NotFoundException.class, () -> service.update(99L, request));
    }
}
