# Spec: Initial Migrations (000-initial-migrations)

Status: DRAFT
Responsável: Equipe Backend
Última atualização: 2026-07-26

## Objetivo
Definir e consolidar a criação das tabelas de banco de dados para as novas entidades do domínio (`BlogPost`, `CaseStudy`, `Partner`, `SiteIndicator`, `ContactMessage`), bem como a inserção dos novos privilégios de acesso e sua vinculação à role `ADMIN`.

## Escopo
- Criação da tabela `blog_posts`.
- Criação da tabela `case_studies`.
- Criação da tabela `partners`.
- Criação da tabela `site_indicators`.
- Criação da tabela `contact_messages`.
- Inserção na tabela `privileges` dos novos privilégios administrativos.
- Associação dos novos privilégios à role existente `ADMIN` na tabela associativa correspondente.

## Itens fora do Escopo
- Implementação das entidades (classes Java), Repositories e lógicas de serviço (isso será tratado em tarefas derivadas de cada spec específica).
- Modificação das tabelas de autenticação (como `users`, `roles`, etc.) além da vinculação de privilégios.

## Regras e Definições de Domínio

### 1. `blog_posts`
| Campo | Tipo SQL (Sugerido) | Restrições |
|---|---|---|
| `id` | BIGSERIAL/BIGINT | PRIMARY KEY |
| `title` | VARCHAR(150) | NOT NULL |
| `slug` | VARCHAR(255) | NOT NULL, UNIQUE |
| `summary` | VARCHAR(255) | NOT NULL |
| `content` | TEXT | NOT NULL |
| `cover_image_url` | VARCHAR(255) | |
| `author` | VARCHAR(255) | NOT NULL |
| `category` | VARCHAR(255) | |
| `status` | VARCHAR(50) | NOT NULL (DRAFT, PUBLISHED) |
| `published_at` | TIMESTAMP | |
| `created_at` | TIMESTAMP | NOT NULL |
| `updated_at` | TIMESTAMP | NOT NULL |

### 2. `case_studies`
| Campo | Tipo SQL (Sugerido) | Restrições |
|---|---|---|
| `id` | BIGSERIAL/BIGINT | PRIMARY KEY |
| `client_name` | VARCHAR(255) | NOT NULL |
| `service_category` | VARCHAR(255) | |
| `problem` | TEXT | NOT NULL |
| `solution` | TEXT | NOT NULL |
| `result` | TEXT | NOT NULL |
| `cover_image_url` | VARCHAR(255) | |
| `testimonial` | TEXT | |
| `project_date` | DATE | |
| `status` | VARCHAR(50) | NOT NULL (DRAFT, PUBLISHED) |

### 3. `partners`
| Campo | Tipo SQL (Sugerido) | Restrições |
|---|---|---|
| `id` | BIGSERIAL/BIGINT | PRIMARY KEY |
| `name` | VARCHAR(255) | NOT NULL |
| `logo_url` | VARCHAR(255) | NOT NULL |
| `external_link` | VARCHAR(255) | |
| `sort_order` | INT | NOT NULL |
| `active` | BOOLEAN | NOT NULL |

### 4. `site_indicators`
| Campo | Tipo SQL (Sugerido) | Restrições |
|---|---|---|
| `id` | BIGSERIAL/BIGINT | PRIMARY KEY |
| `name` | VARCHAR(255) | NOT NULL |
| `value` | VARCHAR(255) | NOT NULL |
| `description` | VARCHAR(255) | |
| `updated_at` | TIMESTAMP | NOT NULL |

### 5. `contact_messages`
| Campo | Tipo SQL (Sugerido) | Restrições |
|---|---|---|
| `id` | BIGSERIAL/BIGINT | PRIMARY KEY |
| `name` | VARCHAR(255) | NOT NULL |
| `email` | VARCHAR(255) | NOT NULL |
| `phone` | VARCHAR(50) | |
| `subject` | VARCHAR(255) | NOT NULL |
| `message` | TEXT | NOT NULL |
| `created_at` | TIMESTAMP | NOT NULL |

### 6. Privilégios e Papéis
Privilégios a serem inseridos na tabela de privilégios (`privileges`):
- `PRIV_BLOG_ADMIN`
- `PRIV_CASES_ADMIN`
- `PRIV_PARTNERS_ADMIN`
- `PRIV_INDICATORS_ADMIN`
- `PRIV_CONTACTS_VIEW`

Esses privilégios deverão ser vinculados ao papel (role) existente cujo nome é `ADMIN`.

## Padrões Adotados
- As migrations seguirão o uso do Flyway já presente no template.
- O nome do arquivo respeitará o padrão: `V<YYYYMMDD_HHMM>__create_tables_and_privileges_for_lastro.sql`.

## Critérios de Aceite
- [ ] O script de migration cria as 5 tabelas sem erros no banco de dados.
- [ ] As constraints (chaves primárias, NOT NULL, UNIQUE de slug) estão aplicadas de acordo com as especificações.
- [ ] Os 5 novos privilégios estão inseridos no banco.
- [ ] O usuário com role `ADMIN` possui os 5 privilégios após a migration.
- [ ] O Flyway aplica a migration corretamente durante o processo de inicialização da aplicação (startup).
