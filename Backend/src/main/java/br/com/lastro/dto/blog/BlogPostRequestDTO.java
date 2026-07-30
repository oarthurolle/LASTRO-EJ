package br.com.lastro.dto.blog;

import br.com.lastro.entity.PostStatus;
import br.com.lastro.validation.HttpUrl;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class BlogPostRequestDTO {

    @NotBlank(message = "O título é obrigatório")
    @Size(min = 5, max = 150, message = "O título deve ter entre 5 e 150 caracteres")
    private String title;

    @NotBlank(message = "O resumo é obrigatório")
    @Size(max = 255, message = "O resumo deve ter no máximo 255 caracteres")
    private String summary;

    @NotBlank(message = "O conteúdo é obrigatório")
    @Size(max = 100000, message = "O conteúdo deve ter no máximo 100000 caracteres")
    private String content;

    @Size(max = 255, message = "A URL da capa deve ter no máximo 255 caracteres")
    @HttpUrl
    private String coverImageUrl;

    @Size(max = 100, message = "A categoria deve ter no máximo 100 caracteres")
    private String category;

    private PostStatus status;

    private Long version;
}
