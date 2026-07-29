package br.com.lastro.dto.blog;

import br.com.lastro.entity.PostStatus;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class BlogPostResponseDTO {
    private Long id;
    private String title;
    private String slug;
    private String summary;
    private String content;
    private String coverImageUrl;
    private String author;
    private String category;
    private PostStatus status;
    private LocalDateTime publishedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long version;
}
