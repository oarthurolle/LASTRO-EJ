package br.com.lastro.service;

import br.com.lastro.dto.partner.PartnerAdminResponseDTO;
import br.com.lastro.dto.partner.PartnerPublicResponseDTO;
import br.com.lastro.dto.partner.PartnerRequestDTO;
import br.com.lastro.entity.Partner;
import br.com.lastro.exception.exceptions.NotFoundException;
import br.com.lastro.repository.PartnerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PartnerService {

    private final PartnerRepository repository;

    @Transactional
    public PartnerAdminResponseDTO create(PartnerRequestDTO request) {
        Partner partner = new Partner();
        copyRequest(request, partner);
        return toAdminResponse(repository.save(partner));
    }

    @Transactional(readOnly = true)
    public List<PartnerAdminResponseDTO> findAllAdmin() {
        return repository.findAllByOrderBySortOrderAscIdAsc().stream()
                .map(this::toAdminResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public PartnerAdminResponseDTO findByIdAdmin(Long id) {
        return toAdminResponse(findById(id));
    }

    @Transactional
    public PartnerAdminResponseDTO update(Long id, PartnerRequestDTO request) {
        Partner partner = findById(id);
        copyRequest(request, partner);
        return toAdminResponse(repository.save(partner));
    }

    @Transactional
    public void delete(Long id) {
        Partner partner = findById(id);
        repository.delete(partner);
    }

    @Transactional(readOnly = true)
    public List<PartnerPublicResponseDTO> findAllPublic() {
        return repository.findAllByActiveTrueOrderBySortOrderAscIdAsc().stream()
                .map(this::toPublicResponse)
                .toList();
    }

    private Partner findById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Parceiro não encontrado"));
    }

    private void copyRequest(PartnerRequestDTO request, Partner partner) {
        partner.setName(request.getName().trim());
        partner.setLogoUrl(request.getLogoUrl().trim());
        partner.setExternalLink(normalizeOptionalUrl(request.getExternalLink()));
        partner.setSortOrder(request.getSortOrder());
        partner.setActive(request.getActive());
    }

    private String normalizeOptionalUrl(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private PartnerAdminResponseDTO toAdminResponse(Partner partner) {
        return new PartnerAdminResponseDTO(
                partner.getId(),
                partner.getName(),
                partner.getLogoUrl(),
                partner.getExternalLink(),
                partner.getSortOrder(),
                partner.getActive()
        );
    }

    private PartnerPublicResponseDTO toPublicResponse(Partner partner) {
        return new PartnerPublicResponseDTO(
                partner.getId(),
                partner.getName(),
                partner.getLogoUrl(),
                partner.getExternalLink(),
                partner.getSortOrder()
        );
    }
}
