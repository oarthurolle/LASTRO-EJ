package br.com.lastro.service;

import br.com.lastro.dto.casestudy.CaseRequestDTO;
import br.com.lastro.entity.CaseStatus;
import br.com.lastro.entity.CaseStudy;
import br.com.lastro.exception.exceptions.NotFoundException;
import br.com.lastro.repository.CaseStudyRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CaseStudyServiceTest {

    @Mock
    private CaseStudyRepository repository;

    @InjectMocks
    private CaseStudyService service;

    @Test
    void createShouldPersistRequiredFieldsAndDefaultToDraft() {
        CaseRequestDTO request = new CaseRequestDTO();
        request.setClientName("  Cliente Exemplo  ");
        request.setServiceCategory("  Plano de Negócios  ");
        request.setProblem("  Sem controle financeiro  ");
        request.setSolution("  Implantamos relatórios  ");
        request.setResult("  Redução de custos  ");
        request.setCoverImageUrl("   ");
        request.setProjectDate(LocalDate.of(2026, 5, 10));

        when(repository.save(any(CaseStudy.class))).thenAnswer(invocation -> {
            CaseStudy entity = invocation.getArgument(0);
            entity.setId(1L);
            return entity;
        });

        var response = service.create(request);

        ArgumentCaptor<CaseStudy> captor = ArgumentCaptor.forClass(CaseStudy.class);
        verify(repository).save(captor.capture());
        CaseStudy saved = captor.getValue();

        assertEquals("Cliente Exemplo", saved.getClientName());
        assertEquals("Plano de Negócios", saved.getServiceCategory());
        assertEquals("Sem controle financeiro", saved.getProblem());
        assertEquals(CaseStatus.DRAFT, saved.getStatus());
        assertEquals(LocalDate.of(2026, 5, 10), saved.getProjectDate());
        assertEquals(CaseStatus.DRAFT, response.getStatus());
    }

    @Test
    void publicListShouldReturnOnlyPublishedCaseCards() {
        CaseStudy published = CaseStudy.builder()
                .id(1L)
                .clientName("Publicado")
                .serviceCategory("Diagnóstico Financeiro")
                .problem("p")
                .solution("s")
                .result("r")
                .projectDate(LocalDate.of(2026, 6, 1))
                .status(CaseStatus.PUBLISHED)
                .build();
        CaseStudy draft = CaseStudy.builder()
                .id(2L)
                .clientName("Rascunho")
                .serviceCategory("Plano de Negócios")
                .problem("p")
                .solution("s")
                .result("r")
                .status(CaseStatus.DRAFT)
                .build();

        when(repository.findAllByStatusOrderByProjectDateDescIdDesc(CaseStatus.PUBLISHED))
                .thenReturn(List.of(published, draft));

        var response = service.listPublic();

        assertEquals(2, response.size());
        assertEquals("Diagnóstico Financeiro", response.get(0).getServiceCategory());
        verify(repository).findAllByStatusOrderByProjectDateDescIdDesc(CaseStatus.PUBLISHED);
    }

    @Test
    void getPublicByIdShouldThrowNotFoundForMissingOrNonPublishedCase() {
        when(repository.findByIdAndStatus(eq(99L), eq(CaseStatus.PUBLISHED)))
                .thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> service.getPublicById(99L));
    }

    @Test
    void updateShouldKeepCurrentStatusWhenRequestHasNone() {
        CaseRequestDTO request = new CaseRequestDTO();
        request.setClientName("Cliente Atualizado");
        request.setProblem("problema");
        request.setSolution("solução");
        request.setResult("resultado");

        CaseStudy existing = CaseStudy.builder()
                .id(1L)
                .clientName("Cliente Antigo")
                .serviceCategory("Planos")
                .problem("p")
                .solution("s")
                .result("r")
                .status(CaseStatus.PUBLISHED)
                .build();

        when(repository.findById(1L)).thenReturn(Optional.of(existing));
        when(repository.save(any(CaseStudy.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var response = service.update(1L, request);

        assertEquals(CaseStatus.PUBLISHED, response.getStatus());
        assertEquals("Cliente Atualizado", response.getClientName());
        verify(repository, never()).delete(any(CaseStudy.class));
    }
}