package br.com.lastro.service;

import br.com.lastro.dto.blog.BlogPostCardResponseDTO;
import br.com.lastro.dto.blog.BlogPostRequestDTO;
import br.com.lastro.dto.blog.BlogPostResponseDTO;
import br.com.lastro.entity.BlogPost;
import br.com.lastro.entity.PostStatus;
import br.com.lastro.exception.exceptions.ConflictException;
import br.com.lastro.exception.exceptions.NotFoundException;
import br.com.lastro.exception.exceptions.ApiException;
import br.com.lastro.repository.BlogPostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;

import java.text.Normalizer;
import java.time.LocalDateTime;
import java.util.Locale;
import java.util.Set;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class BlogPostService {

    private final BlogPostRepository repository;
    private static final Set<String> ADMIN_SORT_FIELDS = Set.of(
            "id", "title", "status", "publishedAt", "createdAt", "updatedAt"
    );
    private static final Set<String> PUBLIC_SORT_FIELDS = Set.of(
            "title", "publishedAt", "createdAt"
    );

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
        post.setTitle(dto.getTitle().trim());
        post.setSlug(slug);
        post.setSummary(dto.getSummary().trim());
        post.setContent(dto.getContent());
        post.setCoverImageUrl(normalizeOptional(dto.getCoverImageUrl()));
        post.setAuthor(authorName);
        post.setCategory(normalizeOptional(dto.getCategory()));
        post.setStatus(PostStatus.DRAFT);

        BlogPost saved = repository.save(post);
        return mapToResponseDTO(saved);
    }

    @Transactional(readOnly = true)
    public Page<BlogPostResponseDTO> findAllPosts(Pageable pageable) {
        validateSort(pageable, ADMIN_SORT_FIELDS);
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

        if (dto.getVersion() != null && !dto.getVersion().equals(post.getVersion())) {
            throw new ConflictException("Esta postagem foi modificada por outro usuário. Por favor, recarregue a página antes de continuar.");
        }

        String newSlug = toSlug(dto.getTitle());
        if (!post.getSlug().equals(newSlug) && repository.existsBySlug(newSlug)) {
            throw new ConflictException("Já existe uma postagem com este título.");
        }

        post.setTitle(dto.getTitle().trim());
        post.setSlug(newSlug);
        post.setSummary(dto.getSummary().trim());
        post.setContent(dto.getContent());
        post.setCoverImageUrl(normalizeOptional(dto.getCoverImageUrl()));
        post.setCategory(normalizeOptional(dto.getCategory()));

        if (dto.getStatus() != null && dto.getStatus() != post.getStatus()) {
            if (dto.getStatus() == PostStatus.DRAFT) {
                throw new ConflictException(
                        "Uma postagem publicada ou oculta não pode voltar a rascunho."
                );
            }
            if (dto.getStatus() == PostStatus.UNPUBLISHED && post.getStatus() != PostStatus.PUBLISHED) {
                throw new ConflictException("Apenas postagens publicadas podem ser desativadas.");
            }
            if (dto.getStatus() == PostStatus.PUBLISHED && post.getPublishedAt() == null) {
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

        if (newStatus == PostStatus.DRAFT) {
            throw new ConflictException("A alteração para rascunho não é permitida.");
        }

        if (newStatus == PostStatus.UNPUBLISHED && post.getStatus() != PostStatus.PUBLISHED) {
            throw new ConflictException("Apenas postagens publicadas podem ser desativadas.");
        }

        if (post.getStatus() == PostStatus.PUBLISHED && newStatus == PostStatus.PUBLISHED) {
            throw new ConflictException("Esta postagem já encontra-se publicada.");
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
        validateSort(pageable, PUBLIC_SORT_FIELDS);
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
        dto.setUpdatedAt(entity.getUpdatedAt() != null ? entity.getUpdatedAt() : entity.getCreatedAt());
        dto.setVersion(entity.getVersion());
        return dto;
    }

    private String normalizeOptional(String value) {
        return value == null || value.isBlank() ? null : value.trim();
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

    private void validateSort(Pageable pageable, Set<String> allowedFields) {
        boolean invalid = pageable.getSort().stream()
                .anyMatch(order -> !allowedFields.contains(order.getProperty()));
        if (invalid) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Campo de ordenação inválido.");
        }
    }
}
