package br.com.lastro.controller;

import br.com.lastro.dto.contact.ContactRequestDTO;
import br.com.lastro.service.ContactService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/public/contact")
@RequiredArgsConstructor
@Tag(name = "Público - Contato", description = "Recebimento de mensagens do formulário de contato")
public class PublicContactController {

    private final ContactService contactService;

    @PostMapping
    public ResponseEntity<Map<String, String>> submit(
            @RequestBody @Valid ContactRequestDTO dto,
            HttpServletRequest request
    ) {
        contactService.submit(dto, resolveClientIp(request));
        return ResponseEntity.status(HttpStatus.ACCEPTED)
                .body(Map.of("message", "Mensagem recebida com sucesso."));
    }

    private String resolveClientIp(HttpServletRequest request) {
        String forwardedFor = request.getHeader("X-Forwarded-For");
        if (forwardedFor != null && !forwardedFor.isBlank()) {
            return forwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}