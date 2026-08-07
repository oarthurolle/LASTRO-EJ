package br.com.lastro.service;

import br.com.lastro.dto.indicator.IndicatorCreateDTO;
import br.com.lastro.dto.indicator.IndicatorResponseDTO;
import br.com.lastro.dto.indicator.IndicatorUpdateDTO;
import br.com.lastro.entity.SiteIndicator;
import br.com.lastro.exception.exceptions.NotFoundException;
import br.com.lastro.repository.SiteIndicatorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SiteIndicatorService {

    private final SiteIndicatorRepository repository;

    @Transactional(readOnly = true)
    public List<IndicatorResponseDTO> findAll() {
        return repository.findAll().stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public IndicatorResponseDTO findById(Long id) {
        SiteIndicator indicator = getEntityById(id);
        return toResponseDTO(indicator);
    }

    @Transactional
    public IndicatorResponseDTO create(IndicatorCreateDTO dto) {
        SiteIndicator indicator = SiteIndicator.builder()
                .name(dto.getName())
                .value(dto.getValue())
                .description(dto.getDescription())
                .build();
        
        indicator = repository.save(indicator);
        return toResponseDTO(indicator);
    }

    @Transactional
    public IndicatorResponseDTO update(Long id, IndicatorUpdateDTO dto) {
        SiteIndicator indicator = getEntityById(id);
        indicator.setName(dto.getName());
        indicator.setValue(dto.getValue());
        indicator.setDescription(dto.getDescription());
        indicator = repository.save(indicator);
        return toResponseDTO(indicator);
    }

    @Transactional
    public void delete(Long id) {
        SiteIndicator indicator = getEntityById(id);
        repository.delete(indicator);
    }

    private SiteIndicator getEntityById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Indicador não encontrado com ID: " + id));
    }

    private IndicatorResponseDTO toResponseDTO(SiteIndicator indicator) {
        return IndicatorResponseDTO.builder()
                .id(indicator.getId())
                .name(indicator.getName())
                .value(indicator.getValue())
                .description(indicator.getDescription())
                .updatedAt(indicator.getUpdatedAt())
                .build();
    }
}
