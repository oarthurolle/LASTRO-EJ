package br.com.lastro.controller;

import br.com.lastro.dto.casestudy.CaseCardResponseDTO;
import br.com.lastro.dto.casestudy.CaseDetailResponseDTO;
import br.com.lastro.service.CaseStudyService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/public/cases")
@RequiredArgsConstructor
@Validated
@Tag(name = "Público - Cases", description = "Visualização pública dos cases publicados (sem necessidade de autenticação)")
public class PublicCaseController {

    private final CaseStudyService caseStudyService;

    @GetMapping
    public ResponseEntity<List<CaseCardResponseDTO>> listPublished() {
        return ResponseEntity.ok(caseStudyService.listPublic());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CaseDetailResponseDTO> getPublishedById(@PathVariable @Positive Long id) {
        return ResponseEntity.ok(caseStudyService.getPublicById(id));
    }
}