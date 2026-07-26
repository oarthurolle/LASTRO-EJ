# Tarefas: Blog (001-blog-tasks)

Status: DONE
Plano Técnico: `docs/technical-plans/001-blog-plan.md`

## Lista de Tarefas

- [x] Criar entidade `BlogPost` e enum `PostStatus` com anotações JPA.
- [x] Criar interface `BlogPostRepository` com métodos customizados para busca pública (filtro status, busca textual, categoria).
- [x] Criar DTOs `BlogPostRequestDTO`, `BlogPostResponseDTO` e `BlogPostCardResponseDTO` com suas validações.
- [x] Implementar `BlogPostService` com a lógica de geração de slug, controle de timestamps/publishedAt e regras de negócio.
- [x] Implementar `PublicBlogController` com endpoints públicos (`GET /api/public/posts` e `GET /api/public/posts/{slug}`).
- [x] Implementar `AdminBlogController` com CRUD protegido por `PRIV_BLOG_ADMIN` (`/api/admin/posts`).
- [x] Adicionar testes e validações para garantir funcionamento adequado.
- [x] Criar o relatório final da feature do blog (`docs/reports/001-blog-report.md`).
