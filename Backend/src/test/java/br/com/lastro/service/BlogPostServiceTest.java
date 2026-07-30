package br.com.lastro.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import br.com.lastro.repository.BlogPostRepository;
import br.com.lastro.dto.blog.BlogPostRequestDTO;
import br.com.lastro.entity.BlogPost;
import br.com.lastro.entity.PostStatus;
import org.mockito.ArgumentCaptor;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BlogPostServiceTest {

    @Mock
    private BlogPostRepository repository;

    @InjectMocks
    private BlogPostService service;

    @Test
    void toSlug_ShouldGenerateCorrectSlug() {
        String slug = BlogPostService.toSlug("Este é um Título de Teste!");
        assertEquals("este-e-um-titulo-de-teste", slug);
    }

    @Test
    void createShouldStartAsDraftAndDeriveAuthorFromSession() {
        BlogPostRequestDTO request = new BlogPostRequestDTO();
        request.setTitle("  Conteúdo para pequenas empresas  ");
        request.setSummary("  Um resumo objetivo.  ");
        request.setContent("<p>Conteúdo seguro do editor.</p>");
        request.setCoverImageUrl(null);
        request.setCategory(" Gestão ");
        request.setStatus(PostStatus.PUBLISHED);

        when(repository.existsBySlug("conteudo-para-pequenas-empresas"))
                .thenReturn(false);
        when(repository.save(any(BlogPost.class))).thenAnswer(invocation -> {
            BlogPost post = invocation.getArgument(0);
            post.setId(10L);
            post.setCreatedAt(LocalDateTime.now());
            post.setVersion(0L);
            return post;
        });

        var response = service.createPost(request, "Maria Oliveira");

        ArgumentCaptor<BlogPost> captor = ArgumentCaptor.forClass(BlogPost.class);
        verify(repository).save(captor.capture());
        BlogPost saved = captor.getValue();

        assertEquals(PostStatus.DRAFT, response.getStatus());
        assertEquals("Maria Oliveira", response.getAuthor());
        assertEquals("Conteúdo para pequenas empresas", saved.getTitle());
        assertEquals("Gestão", saved.getCategory());
        assertNull(saved.getCoverImageUrl());
    }
}
