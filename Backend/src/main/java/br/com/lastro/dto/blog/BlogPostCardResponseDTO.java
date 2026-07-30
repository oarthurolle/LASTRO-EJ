package br.com.lastro.dto.blog;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class BlogPostCardResponseDTO {
    private Long id;
    private String title;
    private String slug;
    private String summary;
    private String coverImageUrl;
    private String author;
    private String category;
    private LocalDateTime publishedAt;
}
