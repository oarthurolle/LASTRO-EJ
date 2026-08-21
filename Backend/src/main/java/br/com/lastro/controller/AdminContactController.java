package br.com.lastro.controller;

import br.com.lastro.dto.contact.ContactMessageResponseDTO;
import br.com.lastro.service.ContactService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/contacts")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('PRIV_CONTACTS_VIEW')")
@Tag(name = "Administração - Contatos", description = "Leitura das mensagens recebidas pelo formulário de contato")
public class AdminContactController {

    private final ContactService contactService;

    @GetMapping
    public ResponseEntity<Page<ContactMessageResponseDTO>> findAll(Pageable pageable) {
        return ResponseEntity.ok(contactService.findAll(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ContactMessageResponseDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(contactService.findById(id));
    }
}