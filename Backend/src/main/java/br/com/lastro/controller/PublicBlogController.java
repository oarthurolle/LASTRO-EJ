package br.com.lastro.controller;

import br.com.lastro.dto.blog.BlogPostCardResponseDTO;
import br.com.lastro.dto.blog.BlogPostResponseDTO;
import br.com.lastro.service.BlogPostService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/public/posts")
@RequiredArgsConstructor
public class PublicBlogController {

    private final BlogPostService blogPostService;

    @GetMapping
    public ResponseEntity<Page<BlogPostCardResponseDTO>> getPublicPosts(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            Pageable pageable) {
        return ResponseEntity.ok(blogPostService.listPublicPosts(search, category, pageable));
    }

    @GetMapping("/{slug}")
    public ResponseEntity<BlogPostResponseDTO> getPublicPostBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(blogPostService.getPublicPostBySlug(slug));
    }
}
