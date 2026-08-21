package br.com.lastro.controller;

import br.com.lastro.dto.casestudy.CaseRequestDTO;
import br.com.lastro.dto.casestudy.CaseResponseDTO;
import br.com.lastro.service.CaseStudyService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/cases")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('PRIV_CASES_ADMIN')")
@Tag(name = "Administração - Cases", description = "Gestão administrativa dos cases de sucesso")
public class AdminCaseController {

    private final CaseStudyService caseStudyService;

    @PostMapping
    public ResponseEntity<CaseResponseDTO> create(@RequestBody @Valid CaseRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(caseStudyService.create(dto));
    }

    @GetMapping
    public ResponseEntity<Page<CaseResponseDTO>> findAll(Pageable pageable) {
        return ResponseEntity.ok(caseStudyService.findAll(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CaseResponseDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(caseStudyService.findById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CaseResponseDTO> update(
            @PathVariable Long id,
            @RequestBody @Valid CaseRequestDTO dto
    ) {
        return ResponseEntity.ok(caseStudyService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        caseStudyService.delete(id);
        return ResponseEntity.noContent().build();
    }
}