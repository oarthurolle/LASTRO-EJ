package br.com.lastro.dto.blog;

import br.com.lastro.entity.PostStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class BlogPostRequestDTO {

    @NotBlank(message = "O título é obrigatório")
    @Size(min = 5, max = 150, message = "O título deve ter entre 5 e 150 caracteres")
    private String title;

    @NotBlank(message = "O resumo é obrigatório")
    private String summary;

    @NotBlank(message = "O conteúdo é obrigatório")
    private String content;

    private String coverImageUrl;

    private String category;

    private PostStatus status;
}
