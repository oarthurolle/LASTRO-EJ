package br.com.lastro.dto.indicator;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class IndicatorCreateDTO {
    @NotBlank(message = "O nome é obrigatório")
    private String name;

    @NotBlank(message = "O valor é obrigatório")
    private String value;

    private String description;
}
