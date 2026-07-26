package br.com.lastro.service;

import br.com.lastro.dto.blog.BlogPostCardResponseDTO;
import br.com.lastro.dto.blog.BlogPostRequestDTO;
import br.com.lastro.dto.blog.BlogPostResponseDTO;
import br.com.lastro.entity.BlogPost;
import br.com.lastro.entity.PostStatus;
import br.com.lastro.exception.exceptions.ConflictException;
import br.com.lastro.exception.exceptions.NotFoundException;
import br.com.lastro.repository.BlogPostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.time.LocalDateTime;
import java.util.Locale;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class BlogPostService {

    private final BlogPostRepository repository;

    private static final Pattern NONLATIN = Pattern.compile("[^\\w-]");
    private static final Pattern WHITESPACE = Pattern.compile("[\\s]");

    public static String toSlug(String input) {
        if (input == null)
            throw new IllegalArgumentException();
        String nowhitespace = WHITESPACE.matcher(input).replaceAll("-");
        String normalized = Normalizer.normalize(nowhitespace, Normalizer.Form.NFD);
        String slug = NONLATIN.matcher(normalized).replaceAll("");
        return slug.toLowerCase(Locale.ENGLISH).replaceAll("-{2,}", "-").replaceAll("^-|-$", "");
    }

    @Transactional
    public BlogPostResponseDTO createPost(BlogPostRequestDTO dto, String authorName) {
        String slug = toSlug(dto.getTitle());
        if (repository.existsBySlug(slug)) {
            throw new ConflictException("Já existe uma postagem com este título.");
        }

        BlogPost post = new BlogPost();
        post.setTitle(dto.getTitle());
        post.setSlug(slug);
        post.setSummary(dto.getSummary());
        post.setContent(dto.getContent());
        post.setCoverImageUrl(dto.getCoverImageUrl());
        post.setAuthor(authorName);
        post.setCategory(dto.getCategory());
        post.setStatus(PostStatus.DRAFT);

        BlogPost saved = repository.save(post);
        return mapToResponseDTO(saved);
    }

    @Transactional(readOnly = true)
    public Page<BlogPostResponseDTO> findAllPosts(Pageable pageable) {
        return repository.findAll(pageable).map(this::mapToResponseDTO);
    }

    @Transactional(readOnly = true)
    public BlogPostResponseDTO getPostById(Long id) {
        BlogPost post = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Postagem não encontrada"));
        return mapToResponseDTO(post);
    }

    @Transactional
    public BlogPostResponseDTO updatePost(Long id, BlogPostRequestDTO dto) {
        BlogPost post = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Postagem não encontrada"));

        String newSlug = toSlug(dto.getTitle());
        if (!post.getSlug().equals(newSlug) && repository.existsBySlug(newSlug)) {
            throw new ConflictException("Já existe uma postagem com este título.");
        }

        post.setTitle(dto.getTitle());
        post.setSlug(newSlug);
        post.setSummary(dto.getSummary());
        post.setContent(dto.getContent());
        post.setCoverImageUrl(dto.getCoverImageUrl());
        post.setCategory(dto.getCategory());

        if (dto.getStatus() != null) {
            if (dto.getStatus() == PostStatus.UNPUBLISHED && post.getStatus() != PostStatus.PUBLISHED) {
                throw new ConflictException("Apenas postagens publicadas podem ser desativadas.");
            }
            if (post.getStatus() == PostStatus.DRAFT && dto.getStatus() == PostStatus.PUBLISHED) {
                post.setPublishedAt(LocalDateTime.now());
            }
            post.setStatus(dto.getStatus());
        }

        BlogPost updated = repository.saveAndFlush(post);
        return mapToResponseDTO(updated);
    }

    @Transactional
    public BlogPostResponseDTO updatePostStatus(Long id, PostStatus newStatus) {
        BlogPost post = repository.findById(id)
                .orElseThrow(() -> new NotFoundException("Postagem não encontrada"));

        if (newStatus == PostStatus.UNPUBLISHED && post.getStatus() != PostStatus.PUBLISHED) {
            throw new ConflictException("Apenas postagens publicadas podem ser desativadas.");
        }

        if (post.getStatus() == PostStatus.DRAFT && newStatus == PostStatus.PUBLISHED) {
            post.setPublishedAt(LocalDateTime.now());
        }
        post.setStatus(newStatus);

        return mapToResponseDTO(repository.saveAndFlush(post));
    }

    @Transactional
    public void deletePost(Long id) {
        if (!repository.existsById(id)) {
            throw new NotFoundException("Postagem não encontrada");
        }
        repository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public Page<BlogPostCardResponseDTO> listPublicPosts(String search, String category, Pageable pageable) {
        String safeSearch = (search == null) ? "" : search;
        String safeCategory = (category == null) ? "" : category;
        return repository.findPublicPosts(PostStatus.PUBLISHED, safeSearch, safeCategory, pageable)
                .map(this::mapToCardResponseDTO);
    }

    @Transactional(readOnly = true)
    public BlogPostResponseDTO getPublicPostBySlug(String slug) {
        BlogPost post = repository.findBySlugAndStatus(slug, PostStatus.PUBLISHED)
                .orElseThrow(() -> new NotFoundException("Postagem não encontrada"));
        return mapToResponseDTO(post);
    }

    private BlogPostResponseDTO mapToResponseDTO(BlogPost entity) {
        BlogPostResponseDTO dto = new BlogPostResponseDTO();
        dto.setId(entity.getId());
        dto.setTitle(entity.getTitle());
        dto.setSlug(entity.getSlug());
        dto.setSummary(entity.getSummary());
        dto.setContent(entity.getContent());
        dto.setCoverImageUrl(entity.getCoverImageUrl());
        dto.setAuthor(entity.getAuthor());
        dto.setCategory(entity.getCategory());
        dto.setStatus(entity.getStatus());
        dto.setPublishedAt(entity.getPublishedAt());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        return dto;
    }

    private BlogPostCardResponseDTO mapToCardResponseDTO(BlogPost entity) {
        BlogPostCardResponseDTO dto = new BlogPostCardResponseDTO();
        dto.setId(entity.getId());
        dto.setTitle(entity.getTitle());
        dto.setSlug(entity.getSlug());
        dto.setSummary(entity.getSummary());
        dto.setCoverImageUrl(entity.getCoverImageUrl());
        dto.setAuthor(entity.getAuthor());
        dto.setCategory(entity.getCategory());
        dto.setPublishedAt(entity.getPublishedAt());
        return dto;
    }
}
