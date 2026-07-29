package br.com.lastro.dto.partner;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PartnerPublicResponseDTO {
    private Long id;
    private String name;
    private String logoUrl;
    private String externalLink;
    private Integer sortOrder;
}
