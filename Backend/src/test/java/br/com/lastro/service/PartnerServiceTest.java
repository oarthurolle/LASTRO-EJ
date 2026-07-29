package br.com.lastro.service;

import br.com.lastro.dto.partner.PartnerRequestDTO;
import br.com.lastro.entity.Partner;
import br.com.lastro.repository.PartnerRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PartnerServiceTest {

    @Mock
    private PartnerRepository repository;

    @InjectMocks
    private PartnerService service;

    @Test
    void createShouldNormalizeInputAndPreserveVisibility() {
        PartnerRequestDTO request = new PartnerRequestDTO();
        request.setName("  Parceiro LASTRO  ");
        request.setLogoUrl("  https://example.com/logo.png  ");
        request.setExternalLink("   ");
        request.setSortOrder(2);
        request.setActive(true);

        when(repository.save(any(Partner.class))).thenAnswer(invocation -> {
            Partner partner = invocation.getArgument(0);
            partner.setId(7L);
            return partner;
        });

        var response = service.create(request);

        ArgumentCaptor<Partner> captor = ArgumentCaptor.forClass(Partner.class);
        verify(repository).save(captor.capture());
        Partner saved = captor.getValue();

        assertEquals("Parceiro LASTRO", saved.getName());
        assertEquals("https://example.com/logo.png", saved.getLogoUrl());
        assertNull(saved.getExternalLink());
        assertEquals(2, response.getSortOrder());
        assertTrue(response.getActive());
    }

    @Test
    void publicListShouldUseActiveSortedRepositoryQuery() {
        Partner first = Partner.builder()
                .id(1L)
                .name("Primeiro")
                .logoUrl("https://example.com/1.png")
                .sortOrder(1)
                .active(true)
                .build();
        Partner second = Partner.builder()
                .id(2L)
                .name("Segundo")
                .logoUrl("https://example.com/2.png")
                .sortOrder(2)
                .active(true)
                .build();
        when(repository.findAllByActiveTrueOrderBySortOrderAscIdAsc())
                .thenReturn(List.of(first, second));

        var response = service.findAllPublic();

        assertEquals(List.of("Primeiro", "Segundo"),
                response.stream().map(item -> item.getName()).toList());
        verify(repository).findAllByActiveTrueOrderBySortOrderAscIdAsc();
    }
}
