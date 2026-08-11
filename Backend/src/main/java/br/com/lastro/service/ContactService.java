package br.com.lastro.service;

import br.com.lastro.dto.contact.ContactMessageResponseDTO;
import br.com.lastro.dto.contact.ContactRequestDTO;
import br.com.lastro.email.service.ApplicationEmailService;
import br.com.lastro.entity.ContactMessage;
import br.com.lastro.exception.exceptions.NotFoundException;
import br.com.lastro.exception.exceptions.RateLimitException;
import br.com.lastro.repository.ContactMessageRepository;
import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;

@Service
@RequiredArgsConstructor
public class ContactService {

    private final ContactMessageRepository repository;
    private final ApplicationEmailService applicationEmailService;

    @Value("${app.contact.rate-limit.max-per-window:3}")
    private int maxPerWindow;

    @Value("${app.contact.rate-limit.window-seconds:600}")
    private long windowSeconds;

    // Contador de envios por IP, expira automaticamente após a janela
    private Cache<String, Integer> submissions;

    @jakarta.annotation.PostConstruct
    void initRateLimiter() {
        submissions = Caffeine.newBuilder()
                .expireAfterWrite(Duration.ofSeconds(windowSeconds))
                .maximumSize(200_000)
                .build();
    }

    @Transactional
    public void submit(ContactRequestDTO dto, String clientIp) {
        assertAllowed(clientIp);

        ContactMessage message = ContactMessage.builder()
                .name(dto.getName().trim())
                .email(dto.getEmail().trim())
                .phone(trimToNull(dto.getPhone()))
                .subject(dto.getSubject().trim())
                .message(dto.getMessage().trim())
                .build();

        repository.save(message);
        applicationEmailService.sendContactMessage(message);

        submissions.asMap().merge(clientIp, 1, Math::addExact);
    }

    @Transactional(readOnly = true)
    public Page<ContactMessageResponseDTO> findAll(Pageable pageable) {
        Pageable safePageable = pageable.getSort().isUnsorted()
                ? PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(),
                Sort.by(Sort.Direction.DESC, "createdAt"))
                : pageable;
        return repository.findAll(safePageable).map(this::mapToResponseDTO);
    }

    @Transactional(readOnly = true)
    public ContactMessageResponseDTO findById(Long id) {
        return repository.findById(id)
                .map(this::mapToResponseDTO)
                .orElseThrow(() -> new NotFoundException("Mensagem não encontrada"));
    }

    private void assertAllowed(String clientIp) {
        Integer count = submissions.getIfPresent(clientIp);
        if (count != null && count >= maxPerWindow) {
            throw new RateLimitException(
                    "Muitas solicitações enviadas em pouco tempo. Tente novamente mais tarde."
            );
        }
    }

    private String trimToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private ContactMessageResponseDTO mapToResponseDTO(ContactMessage entity) {
        return new ContactMessageResponseDTO(
                entity.getId(),
                entity.getName(),
                entity.getEmail(),
                entity.getPhone(),
                entity.getSubject(),
                entity.getMessage(),
                entity.getCreatedAt()
        );
    }
}