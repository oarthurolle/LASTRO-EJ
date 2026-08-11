package br.com.lastro.controller;

import br.com.lastro.dto.smtp.SmtpConfigCreateDTO;
import br.com.lastro.dto.smtp.SmtpConfigResponseDTO;
import br.com.lastro.dto.smtp.SmtpConfigUpdateDTO;
import br.com.lastro.service.SmtpConfigService;
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
@RequestMapping("/api/admin/smtp-configs")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('PRIV_COMPANY_INFO_ADMIN')")
@Tag(name = "Administração - SMTP", description = "Perfis SMTP usados no envio de e-mails do site")
public class AdminSmtpConfigController {

    private final SmtpConfigService service;

    @GetMapping
    public ResponseEntity<List<SmtpConfigResponseDTO>> getAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SmtpConfigResponseDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PostMapping
    public ResponseEntity<SmtpConfigResponseDTO> create(@Valid @RequestBody SmtpConfigCreateDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SmtpConfigResponseDTO> update(@PathVariable Long id, @Valid @RequestBody SmtpConfigUpdateDTO dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/activate")
    public ResponseEntity<SmtpConfigResponseDTO> activate(@PathVariable Long id) {
        return ResponseEntity.ok(service.activate(id));
    }
}