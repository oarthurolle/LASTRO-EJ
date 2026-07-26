# Plano Técnico: Initial Migrations (000-initial-migrations-plan)

Status: APPROVED
Referência: `docs/specs/000-initial-migrations.md`
Responsável: Equipe Backend
Última atualização: 2026-07-26

## Análise de Componentes Existentes
O projeto já conta com o Flyway devidamente configurado, cujos scripts residem em `src/main/resources/migrations`.
Tabelas de segurança (`users`, `roles`, `privileges`, `roles_privileges`) já existem e são manipuladas nas migrations anteriores.
Neste passo, criaremos tabelas independentes para as entidades de negócio e adicionaremos as novas entradas no sistema de permissões.

## O que será criado/alterado

### 1. Migrations (Flyway)
- Criar o arquivo `V20260726_1255__create_tables_and_privileges_for_lastro.sql` (ou com a data/hora do momento da criação).

#### Detalhamento das Tabelas (PostgreSQL dialect assumido pelo uso de BIGSERIAL):
- **blog_posts**: `id` BIGSERIAL PRIMARY KEY, `title` VARCHAR(150) NOT NULL, `slug` VARCHAR(255) NOT NULL UNIQUE, `summary` VARCHAR(255) NOT NULL, `content` TEXT NOT NULL, `cover_image_url` VARCHAR(255), `author` VARCHAR(255) NOT NULL, `category` VARCHAR(255), `status` VARCHAR(50) NOT NULL, `published_at` TIMESTAMP, `created_at` TIMESTAMP NOT NULL, `updated_at` TIMESTAMP NOT NULL.
- **case_studies**: `id` BIGSERIAL PRIMARY KEY, `client_name` VARCHAR(255) NOT NULL, `service_category` VARCHAR(255), `problem` TEXT NOT NULL, `solution` TEXT NOT NULL, `result` TEXT NOT NULL, `cover_image_url` VARCHAR(255), `testimonial` TEXT, `project_date` DATE, `status` VARCHAR(50) NOT NULL.
- **partners**: `id` BIGSERIAL PRIMARY KEY, `name` VARCHAR(255) NOT NULL, `logo_url` VARCHAR(255) NOT NULL, `external_link` VARCHAR(255), `sort_order` INT NOT NULL, `active` BOOLEAN NOT NULL.
- **site_indicators**: `id` BIGSERIAL PRIMARY KEY, `name` VARCHAR(255) NOT NULL, `value` VARCHAR(255) NOT NULL, `description` VARCHAR(255), `updated_at` TIMESTAMP NOT NULL.
- **contact_messages**: `id` BIGSERIAL PRIMARY KEY, `name` VARCHAR(255) NOT NULL, `email` VARCHAR(255) NOT NULL, `phone` VARCHAR(50), `subject` VARCHAR(255) NOT NULL, `message` TEXT NOT NULL, `created_at` TIMESTAMP NOT NULL.

#### Detalhamento de Privilégios:
- Inserir na tabela `privileges` os valores: `PRIV_BLOG_ADMIN`, `PRIV_CASES_ADMIN`, `PRIV_PARTNERS_ADMIN`, `PRIV_INDICATORS_ADMIN`, `PRIV_CONTACTS_VIEW`.
- Obter o ID dos novos privilégios e do papel `ADMIN` para associá-los na tabela de relacionamento `roles_privileges`. O Flyway e o dialeto SQL permitirão usar `INSERT INTO ... SELECT ...` ou subqueries para garantir idempotência ou associação baseada nos nomes, evitando hardcode de IDs que possam quebrar entre ambientes.

## Riscos e Dependências
- **Risco**: Erro de sintaxe SQL específico do banco usado. Como é o template D3tec, frequentemente usam PostgreSQL (usarei BIGSERIAL, TIMESTAMP e BOOLEAN).
- Não adicionarei classes de entidade Java nesta etapa, apenas o banco de dados. O Flyway rodará ao iniciar a aplicação.

## Ordem de Implementação
1. Escrever o script SQL respeitando o formato do Flyway.
2. Iniciar a aplicação para validar a execução do Flyway no console ou testar através de um script de validação.
3. Marcar tarefas como concluídas e gerar relatório.
