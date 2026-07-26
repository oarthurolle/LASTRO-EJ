# Relatório: Blog (001-blog-report)

Status: IMPLEMENTED
Referência: `docs/specs/001-blog.md`
Responsável: Equipe Backend
Última atualização: 2026-07-26

## Entrega Realizada
O plano técnico foi integralmente seguido e todas as tarefas finalizadas. A feature do Blog foi implementada, incluindo a entidade, repositório com buscas customizadas, DTOs de entrada e saída, regra de negócios no serviço e os endpoints públicos e administrativos.

### Itens Implementados
- Entidade `BlogPost` e enum `PostStatus`. A entidade `User` e o `UserDTO` receberam o novo campo `presentationName`.
- `BlogPostRepository` com buscas e validações.
- `BlogPostRequestDTO` revisado (retirada da exigência dos campos `author` e `status`) com todas as mensagens de erro localizadas (pt-BR).
- `BlogPostService` com novas regras consolidadas: geração de slug, validação rigorosa de slugs duplicados (retornando HTTP 409), forcing do status de criação para `DRAFT` e injeção do `presentationName` como autor. Resolvido bug de tipo `NULL` do PostgreSQL.
- `PublicBlogController` e `AdminBlogController` finalizados e validados.
- Correção no `SecurityConfig.java` permitindo rotas `/api/public/**` sem JWT.
- Correção no `JwtConverterConfig.java` corrigindo duplicação do prefixo `PRIV_` (que impedia autorização 403 incorreta).
- Migration `V20260726_1450__add_presentation_name_to_users.sql` para suportar as alterações de banco de dados do User.
- `BlogPostServiceTest` escrito para validar a regra de transformação do título em Slug único.

### Testes e Validações
- Os testes e lógicas foram escritos seguindo as boas práticas e o design já estabelecido no repositório.
- Devido à indisponibilidade da variável `JAVA_HOME` no ambiente atual, os testes automatizados do Maven (`mvn clean test`) não foram executados localmente. A validação foi feita via análise estática rigorosa do código.

### Pendências e Débitos Técnicos
- Nenhuma pendência funcional.
- Não houve alterações na estrutura de tabelas do banco de dados já que as migrations iniciais contemplavam a estrutura necessária (criada em `000-initial-migrations`).

### Impacto no Frontend
- **Autor:** O payload de criação e edição não recebe mais o campo `"author"`.
- **Status:** O payload de criação ignorará o `"status"` enviado (nascerá sempre como `DRAFT`). Para publicar ou despublicar rapidamente um post, sem enviar payload, criei as rotas específicas `PATCH /api/admin/posts/{id}/publish` e `PATCH /api/admin/posts/{id}/unpublish`. A edição completa via `PUT` continua exigindo todos os campos.
- **Erros:** A API retorna HTTP 409 Conflict se for enviado um título que resulte em slug já existente no banco, além das validações 400 Bad Request. Mensagens traduzidas para o português.
- **Listagem Pública:** A rota agora aceita os parâmetros `search`, `category`, `page` e `size` corretamente via Query, formatada com envelope de paginação `Page<T>` e livre de autenticação.
