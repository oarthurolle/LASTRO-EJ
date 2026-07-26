# Spec: Blog (001-blog)

Status: DRAFT
Responsável: Equipe Backend
Última atualização: 2026-07-26

## Objetivo
Permitir a gestão administrativa (criação, edição e publicação) de postagens do blog da LASTRO EJ, bem como a leitura (listagem e visualização) na área pública.

## Escopo
- Criação, edição, listagem (CRUD) e leitura de posts de blog.
- Diferenciação entre rascunhos (DRAFT) e publicados (PUBLISHED).
- Geração automática de slugs únicos a partir do título.
- API Pública: listar apenas posts publicados, buscar post específico pelo slug.
- API Administrativa: operações protegidas pelo privilégio `PRIV_BLOG_ADMIN`.

## Itens fora do Escopo
- Comentários nos posts.
- Upload de imagens (utilizar apenas URLs por enquanto).
- Busca de blog com parâmetro não definido.

## Regras de Negócio
- A API pública retorna somente posts com status `PUBLISHED`.
- O slug deve ser amigável, único e gerado no backend.
- Status permitidos: apenas `DRAFT` ou `PUBLISHED`.
- Mudança para `PUBLISHED` deve atualizar `publishedAt`.
- Endpoints administrativos exigem JWT + `PRIV_BLOG_ADMIN`.

## Contratos HTTP Afetados
- `GET /api/public/posts`
- `GET /api/public/posts/{slug}`
- `POST /api/admin/posts`
- (Outros métodos do CRUD a definir em `/api/admin/posts`)

## Perguntas em Aberto (Divergências identificadas)
- Paginação vs array simples no retorno de `GET /api/public/posts`.
- Nome do parâmetro de busca para texto.
- Inclusão de `author`, `coverImageUrl` e `category` no payload de criação.

## Critérios de Aceite
- [ ] Post publicado é listado corretamente em `/api/public/posts`.
- [ ] Rascunhos não são retornados nas APIs públicas.
- [ ] Acessar `/api/public/posts/{slug}` com slug inválido retorna 404.
- [ ] O CRUD administrativo exige o privilégio `PRIV_BLOG_ADMIN`.
- [ ] O endpoint de criação retorna 201 Created.
