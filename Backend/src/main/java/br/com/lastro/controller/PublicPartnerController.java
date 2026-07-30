package br.com.lastro.controller;

import br.com.lastro.dto.partner.PartnerPublicResponseDTO;
import br.com.lastro.service.PartnerService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/public/partners")
@RequiredArgsConstructor
@Tag(name = "Público - Parceiros", description = "Listagem pública de parceiros ativos")
public class PublicPartnerController {

    private final PartnerService partnerService;

    @GetMapping
    public ResponseEntity<List<PartnerPublicResponseDTO>> findAll() {
        return ResponseEntity.ok(partnerService.findAllPublic());
    }
}
