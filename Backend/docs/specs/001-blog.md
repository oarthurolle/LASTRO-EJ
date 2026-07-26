# Spec: Blog (001-blog)

Status: APPROVED
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
- `PUT /api/admin/posts/{id}`
- `PATCH /api/admin/posts/{id}/publish`
- `PATCH /api/admin/posts/{id}/unpublish`
- `DELETE /api/admin/posts/{id}`

## Decisões Resolvidas
- **Paginação vs array simples:** Utilizaremos paginação nativa do Spring Data (`Page<T>`) no retorno de `GET /api/public/posts`.
- **Nome do parâmetro de busca:** O parâmetro de busca textual será `search`.
- **Inclusão de campos:** Os campos `coverImageUrl` e `category` foram incluídos no payload de criação e edição.
- **Autor automático:** O campo `author` foi removido do payload de request; o sistema injeta automaticamente o `presentationName` do usuário logado como autor do post.
- **Rascunhos por padrão:** O campo `status` foi tornado opcional na request e ignorado na criação; todo post nasce como `DRAFT` obrigatoriamente.
- **Unicidade rigorosa:** O sistema retorna HTTP 409 (Conflict) caso o administrador tente criar um post cujo título resulte num slug já existente, prevenindo posts com títulos iguais.

## Critérios de Aceite
- [ ] Post publicado é listado corretamente em `/api/public/posts`.
- [ ] Rascunhos não são retornados nas APIs públicas.
- [ ] Acessar `/api/public/posts/{slug}` com slug inválido retorna 404.
- [ ] O CRUD administrativo exige o privilégio `PRIV_BLOG_ADMIN`.
- [ ] O endpoint de criação retorna 201 Created.
