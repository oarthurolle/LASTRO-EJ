package br.com.lastro.dto.partner;

import br.com.lastro.validation.HttpUrl;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class PartnerRequestDTO {

    @NotBlank(message = "O nome é obrigatório")
    @Size(max = 255, message = "O nome deve ter no máximo 255 caracteres")
    private String name;

    @NotBlank(message = "A URL da logo é obrigatória")
    @Size(max = 255, message = "A URL da logo deve ter no máximo 255 caracteres")
    @HttpUrl
    private String logoUrl;

    @Size(max = 255, message = "O link externo deve ter no máximo 255 caracteres")
    @HttpUrl
    private String externalLink;

    @NotNull(message = "A ordem de exibição é obrigatória")
    @PositiveOrZero(message = "A ordem de exibição não pode ser negativa")
    private Integer sortOrder;

    @NotNull(message = "O status ativo é obrigatório")
    private Boolean active;
}
