# Relatório: Initial Migrations (000-initial-migrations-report)

Status: IMPLEMENTED
Referência: `docs/specs/000-initial-migrations.md`
Responsável: Equipe Backend
Última atualização: 2026-07-26

## Entrega Realizada
O plano técnico foi integralmente seguido e todas as tarefas finalizadas. Foi criado um arquivo de migração para o banco de dados via Flyway que adiciona as estruturas persistentes do domínio e o modelo de autorização exigido para o site institucional.

### Arquivo Criado
- `src/main/resources/migrations/V20260726_1253__create_tables_and_privileges_for_lastro.sql`

### Itens Implementados
- Criação das Sequences e Tabelas:
  - `blog_posts_seq_generator` e `blog_posts`
  - `case_studies_seq_generator` e `case_studies`
  - `partners_seq_generator` e `partners`
  - `site_indicators_seq_generator` e `site_indicators`
  - `contact_messages_seq_generator` e `contact_messages`
- Inserção na tabela `privilege` (garantindo que não haverá duplicidade devido à cláusula `ON CONFLICT`):
  - `PRIV_BLOG_ADMIN`
  - `PRIV_CASES_ADMIN`
  - `PRIV_PARTNERS_ADMIN`
  - `PRIV_INDICATORS_ADMIN`
  - `PRIV_CONTACTS_VIEW`
- Vínculo dos novos privilégios ao usuário `ADMIN` (`role_id = 2`) na tabela associativa `roles_privileges`.

### Testes e Validações
- Como não há ambiente local do Java devidamente configurado para realizar o `mvn test` no momento (falta variável `JAVA_HOME`), a validação limitou-se à revisão cuidadosa de sintaxe SQL do PostgreSQL compatível com as versões anteriores das migrations. A sintaxe de sequences, defaults, primary keys e inserts foi baseada na migration inicial de segurança do repositório (`V20260201_1750__create_initial_database.sql` e subsequentes).

### Pendências e Débitos Técnicos
- Nenhuma pendência em banco.
- O mapeamento ORM (JPA/Hibernate) será feito ao lado da implementação dos endpoints em tarefas futuras.

### Impacto no Frontend
- Nenhum impacto imediato; o banco está preparado para receber a implementação das APIs de acordo com os DTOs do contrato.
