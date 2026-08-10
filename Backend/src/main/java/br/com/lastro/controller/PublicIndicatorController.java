package br.com.lastro.controller;

import br.com.lastro.dto.indicator.IndicatorResponseDTO;
import br.com.lastro.service.SiteIndicatorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/api/public/indicators")
@RequiredArgsConstructor
public class PublicIndicatorController {

    private final SiteIndicatorService service;

    @GetMapping
    public ResponseEntity<List<IndicatorResponseDTO>> getAll() {
        return ResponseEntity.ok(service.findAll());
    }
}
