package br.com.lastro.service;

import br.com.lastro.dto.smtp.SmtpConfigCreateDTO;
import br.com.lastro.dto.smtp.SmtpConfigResponseDTO;
import br.com.lastro.dto.smtp.SmtpConfigUpdateDTO;
import br.com.lastro.entity.SmtpConfig;
import br.com.lastro.exception.exceptions.NotFoundException;
import br.com.lastro.repository.SmtpConfigRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SmtpConfigService {

    private final SmtpConfigRepository repository;

    @Transactional(readOnly = true)
    public List<SmtpConfigResponseDTO> findAll() {
        return repository.findAll().stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SmtpConfigResponseDTO findById(Long id) {
        return toResponseDTO(getEntityById(id));
    }

    @Transactional(readOnly = true)
    public SmtpConfig getActiveConfig() {
        return repository.findByActiveTrue().orElse(null);
    }

    @Transactional
    public SmtpConfigResponseDTO create(SmtpConfigCreateDTO dto) {
        SmtpConfig config = SmtpConfig.builder()
                .name(dto.getName().trim())
                .host(dto.getHost().trim())
                .port(dto.getPort())
                .username(trimToNull(dto.getUsername()))
                .password(trimToNull(dto.getPassword()))
                .fromName(trimToNull(dto.getFromName()))
                .fromAddress(dto.getFromAddress().trim())
                .contactRecipient(trimToNull(dto.getContactRecipient()))
                .auth(Boolean.TRUE.equals(dto.getAuth()))
                .starttls(Boolean.TRUE.equals(dto.getStarttls()))
                .active(!repository.existsByActiveTrue())
                .build();

        config = repository.save(config);
        return toResponseDTO(config);
    }

    @Transactional
    public SmtpConfigResponseDTO update(Long id, SmtpConfigUpdateDTO dto) {
        SmtpConfig config = getEntityById(id);
        config.setName(dto.getName().trim());
        config.setHost(dto.getHost().trim());
        config.setPort(dto.getPort());
        config.setUsername(trimToNull(dto.getUsername()));
        config.setPassword(trimToNull(dto.getPassword()));
        config.setFromName(trimToNull(dto.getFromName()));
        config.setFromAddress(dto.getFromAddress().trim());
        config.setContactRecipient(trimToNull(dto.getContactRecipient()));
        config.setAuth(Boolean.TRUE.equals(dto.getAuth()));
        config.setStarttls(Boolean.TRUE.equals(dto.getStarttls()));

        config = repository.save(config);
        return toResponseDTO(config);
    }

    @Transactional
    public void delete(Long id) {
        SmtpConfig config = getEntityById(id);
        repository.delete(config);
    }

    @Transactional
    public SmtpConfigResponseDTO activate(Long id) {
        SmtpConfig config = getEntityById(id);
        repository.deactivateAll();
        config.setActive(true);
        config = repository.save(config);
        return toResponseDTO(config);
    }

    private SmtpConfig getEntityById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Configuração SMTP não encontrada com ID: " + id));
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private SmtpConfigResponseDTO toResponseDTO(SmtpConfig config) {
        return SmtpConfigResponseDTO.builder()
                .id(config.getId())
                .name(config.getName())
                .host(config.getHost())
                .port(config.getPort())
                .username(config.getUsername())
                .password(config.getPassword())
                .fromName(config.getFromName())
                .fromAddress(config.getFromAddress())
                .contactRecipient(config.getContactRecipient())
                .auth(config.getAuth())
                .starttls(config.getStarttls())
                .active(config.getActive())
                .createdAt(config.getCreatedAt())
                .updatedAt(config.getUpdatedAt())
                .build();
    }
}