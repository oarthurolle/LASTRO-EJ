package br.com.lastro.dto.indicator;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class IndicatorResponseDTO {
    private Long id;
    private String name;
    private String value;
    private String description;
    private LocalDateTime updatedAt;
}
