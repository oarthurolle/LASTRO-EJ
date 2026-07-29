package br.com.lastro.controller;

import br.com.lastro.dto.partner.PartnerAdminResponseDTO;
import br.com.lastro.dto.partner.PartnerRequestDTO;
import br.com.lastro.service.PartnerService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
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

import java.util.List;

@RestController
@RequestMapping("/api/admin/partners")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('PRIV_PARTNERS_ADMIN')")
@Tag(name = "Administração - Parceiros", description = "Gestão administrativa de parceiros")
public class AdminPartnerController {

    private final PartnerService partnerService;

    @PostMapping
    public ResponseEntity<PartnerAdminResponseDTO> create(
            @RequestBody @Valid PartnerRequestDTO request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(partnerService.create(request));
    }

    @GetMapping
    public ResponseEntity<List<PartnerAdminResponseDTO>> findAll() {
        return ResponseEntity.ok(partnerService.findAllAdmin());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PartnerAdminResponseDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(partnerService.findByIdAdmin(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PartnerAdminResponseDTO> update(
            @PathVariable Long id,
            @RequestBody @Valid PartnerRequestDTO request
    ) {
        return ResponseEntity.ok(partnerService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        partnerService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
