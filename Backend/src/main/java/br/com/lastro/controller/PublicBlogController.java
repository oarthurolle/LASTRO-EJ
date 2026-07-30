package br.com.lastro.controller;

import br.com.lastro.dto.blog.BlogPostCardResponseDTO;
import br.com.lastro.dto.blog.BlogPostResponseDTO;
import br.com.lastro.service.BlogPostService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.Size;
import org.springframework.validation.annotation.Validated;

@RestController
@RequestMapping("/api/public/posts")
@RequiredArgsConstructor
@Validated
@Tag(name = "Público - Blog", description = "Visualização pública das postagens ativas do blog (sem necessidade de autenticação)")
public class PublicBlogController {

    private final BlogPostService blogPostService;

    @GetMapping
    public ResponseEntity<Page<BlogPostCardResponseDTO>> getPublicPosts(
            @RequestParam(required = false) @Size(max = 100) String search,
            @RequestParam(required = false) @Size(max = 100) String category,
            Pageable pageable) {
        return ResponseEntity.ok(blogPostService.listPublicPosts(search, category, pageable));
    }

    @GetMapping("/{slug}")
    public ResponseEntity<BlogPostResponseDTO> getPublicPostBySlug(
            @PathVariable @Size(max = 255) String slug
    ) {
        return ResponseEntity.ok(blogPostService.getPublicPostBySlug(slug));
    }
}
