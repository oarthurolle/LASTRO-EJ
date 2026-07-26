# Plano Técnico: Blog (001-blog-plan)

Status: APPROVED
Referência: `docs/specs/001-blog.md`
Responsável: Equipe Backend
Última atualização: 2026-07-26

## Análise de Componentes Existentes
O projeto usa o pacote base `br.com.lastro`.
Já existem os pacotes `controller`, `service`, `repository`, `entity` e `dto`.
A segurança (`security`) baseada em JWT já funciona, bem como a validação e formatação de erro (exception).
O privilégio `PRIV_BLOG_ADMIN` já foi inserido no banco na migration `000`.

## O que será criado/alterado

### 1. Entidade e Repository
- **Classe `BlogPost`** em `br.com.lastro.entity`:
  - Anotações JPA (`@Entity`, `@Table(name = "blog_posts")`).
  - Mapear colunas: `id`, `title`, `slug`, `summary`, `content`, `coverImageUrl`, `author`, `category`, `status`, `publishedAt`, `createdAt`, `updatedAt`.
  - Enum `PostStatus` (`DRAFT`, `PUBLISHED`).
  - Callbacks `@PrePersist` e `@PreUpdate` para timestamps.
- **Interface `BlogPostRepository`** em `br.com.lastro.repository`:
  - `JpaRepository<BlogPost, Long>`.
  - Método `Optional<BlogPost> findBySlugAndStatus(String slug, PostStatus status);`
  - Método para busca pública e paginada, possivelmente usando `@Query` ou `Specification` para combinar título/resumo (`search`), `category` e `status`.

### 2. DTOs em `br.com.lastro.dto.blog`
- `BlogPostRequestDTO`: para criação e atualização (`title`, `summary`, `content`, `coverImageUrl`, `author`, `category`, `status`). Validações aplicadas (`@NotBlank`, `@Size`).
- `BlogPostResponseDTO`: dados completos do post.
- `BlogPostCardResponseDTO`: resumo para as listas públicas (`id`, `title`, `slug`, `summary`, `coverImageUrl`, `author`, `category`, `publishedAt`).

### 3. Service em `br.com.lastro.service`
- **Classe `BlogPostService`**:
  - `createPost(...)`: gera slug único. Valida e define timestamps de criação. Se status for `PUBLISHED`, define `publishedAt`.
  - `updatePost(Long id, ...)`: atualiza dados. Não alteraremos o slug de posts existentes para não quebrar links públicos e regras de SEO. Atualiza `publishedAt` conforme a transição de status.
  - `deletePost(Long id)`: remoção física simples ou lançamento de erro de dependência.
  - `listPublicPosts(String search, String category, Pageable pageable)`: retorna `Page<BlogPostCardResponseDTO>` apenas com status `PUBLISHED`.
  - `getPublicPostBySlug(String slug)`: retorna detalhe HTML de post `PUBLISHED`. Se não encontrar, lança exceção (tipo `ResourceNotFoundException`) para trigger do 404 global.

### 4. Controller em `br.com.lastro.controller`
- **`PublicBlogController`** (`/api/public/posts`):
  - `GET /`: Parâmetros (`search`, `category`, `page`, `size`). Retorna `Page<BlogPostCardResponseDTO>`.
  - `GET /{slug}`: Retorna `BlogPostResponseDTO`.
- **`AdminBlogController`** (`/api/admin/posts`):
  - Anotação `@PreAuthorize("hasAuthority('PRIV_BLOG_ADMIN')")`.
  - `POST /`
  - `GET /`: lista todos (DRAFT e PUBLISHED), paginado.
  - `GET /{id}`: detalhe por ID.
  - `PUT /{id}`: atualização completa.
  - `DELETE /{id}`: remoção.

### 5. Tratamento de Exceções
- Reutilizar estrutura global do template para respostas `400 Bad Request` e `404 Not Found`.

## Riscos e Dependências
- **Geração de Slug:** Uma colisão de slug deve ser tratada gerando um sufixo (ex: `-1`) ou tratando o constraint violation.

## Ordem Recomendada de Implementação
1. Entidade e Enums.
2. Repositórios.
3. DTOs.
4. Serviço de Blog (foco em regras de negócio).
5. Controladores (Público e Admin).
6. Testes Automatizados.
