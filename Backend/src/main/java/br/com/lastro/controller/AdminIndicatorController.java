package br.com.lastro.controller;

import br.com.lastro.dto.indicator.IndicatorCreateDTO;
import br.com.lastro.dto.indicator.IndicatorResponseDTO;
import br.com.lastro.dto.indicator.IndicatorUpdateDTO;
import br.com.lastro.service.SiteIndicatorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/admin/indicators")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('PRIV_INDICATORS_ADMIN')")
public class AdminIndicatorController {

    private final SiteIndicatorService service;

    @GetMapping
    public ResponseEntity<List<IndicatorResponseDTO>> getAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<IndicatorResponseDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PostMapping
    public ResponseEntity<IndicatorResponseDTO> create(@Valid @RequestBody IndicatorCreateDTO dto) {
        IndicatorResponseDTO created = service.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<IndicatorResponseDTO> update(@PathVariable Long id, @Valid @RequestBody IndicatorUpdateDTO dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
