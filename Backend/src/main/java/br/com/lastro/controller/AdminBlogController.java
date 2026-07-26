package br.com.lastro.controller;

import br.com.lastro.dto.blog.BlogPostRequestDTO;
import br.com.lastro.dto.blog.BlogPostResponseDTO;
import br.com.lastro.service.BlogPostService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import br.com.lastro.config.security.UsuarioPrincipal;
import br.com.lastro.entity.PostStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/posts")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('PRIV_BLOG_ADMIN')")
public class AdminBlogController {

    private final BlogPostService blogPostService;

    @PostMapping
    public ResponseEntity<BlogPostResponseDTO> createPost(
            @RequestBody @Valid BlogPostRequestDTO dto,
            @AuthenticationPrincipal UsuarioPrincipal principal) {
        BlogPostResponseDTO created = blogPostService.createPost(dto, principal.getUserDto().getPresentationName());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping
    public ResponseEntity<Page<BlogPostResponseDTO>> getAllPosts(Pageable pageable) {
        return ResponseEntity.ok(blogPostService.findAllPosts(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BlogPostResponseDTO> getPostById(@PathVariable Long id) {
        return ResponseEntity.ok(blogPostService.getPostById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BlogPostResponseDTO> updatePost(@PathVariable Long id, @RequestBody @Valid BlogPostRequestDTO dto) {
        return ResponseEntity.ok(blogPostService.updatePost(id, dto));
    }

    @PatchMapping("/{id}/publish")
    public ResponseEntity<BlogPostResponseDTO> publishPost(@PathVariable Long id) {
        return ResponseEntity.ok(blogPostService.updatePostStatus(id, PostStatus.PUBLISHED));
    }

    @PatchMapping("/{id}/unpublish")
    public ResponseEntity<BlogPostResponseDTO> unpublishPost(@PathVariable Long id) {
        return ResponseEntity.ok(blogPostService.updatePostStatus(id, PostStatus.UNPUBLISHED));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable Long id) {
        blogPostService.deletePost(id);
        return ResponseEntity.noContent().build();
    }
}
