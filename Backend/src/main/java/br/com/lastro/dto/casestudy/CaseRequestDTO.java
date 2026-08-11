package br.com.lastro.dto.casestudy;

import br.com.lastro.entity.CaseStatus;
import br.com.lastro.validation.HttpUrl;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
public class CaseRequestDTO {

    @NotBlank(message = "O nome do cliente é obrigatório")
    @Size(max = 255, message = "O nome do cliente deve ter no máximo 255 caracteres")
    private String clientName;

    @Size(max = 255, message = "A categoria deve ter no máximo 255 caracteres")
    private String serviceCategory;

    @NotBlank(message = "O problema é obrigatório")
    @Size(max = 10000, message = "O problema deve ter no máximo 10000 caracteres")
    private String problem;

    @NotBlank(message = "A solução é obrigatória")
    @Size(max = 10000, message = "A solução deve ter no máximo 10000 caracteres")
    private String solution;

    @NotBlank(message = "O resultado é obrigatório")
    @Size(max = 4000, message = "O resultado deve ter no máximo 4000 caracteres")
    private String result;

    @Size(max = 255, message = "A URL da capa deve ter no máximo 255 caracteres")
    @HttpUrl
    private String coverImageUrl;

    @Size(max = 4000, message = "O depoimento deve ter no máximo 4000 caracteres")
    private String testimonial;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate projectDate;

    private CaseStatus status;
}