package br.com.lastro.service;

import br.com.lastro.dto.casestudy.CaseCardResponseDTO;
import br.com.lastro.dto.casestudy.CaseDetailResponseDTO;
import br.com.lastro.dto.casestudy.CaseRequestDTO;
import br.com.lastro.dto.casestudy.CaseResponseDTO;
import br.com.lastro.entity.CaseStatus;
import br.com.lastro.entity.CaseStudy;
import br.com.lastro.exception.exceptions.ApiException;
import br.com.lastro.exception.exceptions.NotFoundException;
import br.com.lastro.repository.CaseStudyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class CaseStudyService {

    private final CaseStudyRepository repository;

    private static final Set<String> ADMIN_SORT_FIELDS = Set.of(
            "id", "clientName", "serviceCategory", "projectDate", "status"
    );

    @Transactional
    public CaseResponseDTO create(CaseRequestDTO dto) {
        CaseStudy caseStudy = new CaseStudy();
        copyRequest(dto, caseStudy);
        caseStudy.setStatus(dto.getStatus() != null ? dto.getStatus() : CaseStatus.DRAFT);
        return mapToResponseDTO(repository.save(caseStudy));
    }

    @Transactional(readOnly = true)
    public Page<CaseResponseDTO> findAll(Pageable pageable) {
        validateSort(pageable);
        Pageable safePageable = pageable.getSort().isUnsorted()
                ? PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(),
                Sort.by(Sort.Direction.DESC, "id"))
                : pageable;
        return repository.findAll(safePageable).map(this::mapToResponseDTO);
    }

    @Transactional(readOnly = true)
    public CaseResponseDTO findById(Long id) {
        return mapToResponseDTO(findByIdOrThrow(id));
    }

    @Transactional
    public CaseResponseDTO update(Long id, CaseRequestDTO dto) {
        CaseStudy caseStudy = findByIdOrThrow(id);
        CaseStatus currentStatus = caseStudy.getStatus();
        copyRequest(dto, caseStudy);
        caseStudy.setStatus(dto.getStatus() != null ? dto.getStatus() : currentStatus);
        return mapToResponseDTO(repository.save(caseStudy));
    }

    @Transactional
    public void delete(Long id) {
        CaseStudy caseStudy = findByIdOrThrow(id);
        repository.delete(caseStudy);
    }

    @Transactional(readOnly = true)
    public List<CaseCardResponseDTO> listPublic() {
        return repository.findAllByStatusOrderByProjectDateDescIdDesc(CaseStatus.PUBLISHED)
                .stream()
                .map(this::mapToCardResponseDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public CaseDetailResponseDTO getPublicById(Long id) {
        CaseStudy caseStudy = repository.findByIdAndStatus(id, CaseStatus.PUBLISHED)
                .orElseThrow(() -> new NotFoundException("Case não encontrado"));
        return mapToDetailResponseDTO(caseStudy);
    }

    private CaseStudy findByIdOrThrow(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Case não encontrado"));
    }

    private void copyRequest(CaseRequestDTO dto, CaseStudy caseStudy) {
        caseStudy.setClientName(dto.getClientName().trim());
        caseStudy.setServiceCategory(normalizeOptional(dto.getServiceCategory()));
        caseStudy.setProblem(dto.getProblem().trim());
        caseStudy.setSolution(dto.getSolution().trim());
        caseStudy.setResult(dto.getResult().trim());
        caseStudy.setCoverImageUrl(normalizeOptional(dto.getCoverImageUrl()));
        caseStudy.setTestimonial(normalizeOptional(dto.getTestimonial()));
        caseStudy.setProjectDate(dto.getProjectDate());
    }

    private String normalizeOptional(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private CaseResponseDTO mapToResponseDTO(CaseStudy entity) {
        return new CaseResponseDTO(
                entity.getId(),
                entity.getClientName(),
                entity.getServiceCategory(),
                entity.getProblem(),
                entity.getSolution(),
                entity.getResult(),
                entity.getCoverImageUrl(),
                entity.getTestimonial(),
                entity.getProjectDate(),
                entity.getStatus()
        );
    }

    private CaseDetailResponseDTO mapToDetailResponseDTO(CaseStudy entity) {
        return new CaseDetailResponseDTO(
                entity.getId(),
                entity.getClientName(),
                entity.getServiceCategory(),
                entity.getProblem(),
                entity.getSolution(),
                entity.getResult(),
                entity.getCoverImageUrl(),
                entity.getTestimonial(),
                entity.getProjectDate()
        );
    }

    private CaseCardResponseDTO mapToCardResponseDTO(CaseStudy entity) {
        return new CaseCardResponseDTO(
                entity.getId(),
                entity.getClientName(),
                entity.getServiceCategory(),
                entity.getCoverImageUrl(),
                entity.getProjectDate()
        );
    }

    private void validateSort(Pageable pageable) {
        boolean invalid = pageable.getSort().stream()
                .anyMatch(order -> !ADMIN_SORT_FIELDS.contains(order.getProperty()));
        if (invalid) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Campo de ordenação inválido.");
        }
    }
}