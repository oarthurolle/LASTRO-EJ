package br.com.lastro.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import br.com.lastro.repository.BlogPostRepository;

import static org.junit.jupiter.api.Assertions.assertEquals;

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
}
