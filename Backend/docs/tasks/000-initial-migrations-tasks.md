# Tarefas: Initial Migrations (000-initial-migrations-tasks)

Status: PENDING
Plano Técnico: `docs/technical-plans/000-initial-migrations-plan.md`

## Lista de Tarefas

- [x] Criar o arquivo de migração do Flyway para as novas tabelas (blog_posts, case_studies, partners, site_indicators, contact_messages).
- [x] Adicionar no script a inserção dos 5 novos privilégios na tabela `privileges`.
- [x] Adicionar no script a vinculação dos novos privilégios à role `ADMIN` na tabela `roles_privileges`.
- [x] Executar o Flyway (via subida do app Spring Boot ou Maven) para validar que não há erros de sintaxe no SQL.
- [x] Criar o relatório final em `docs/reports/000-initial-migrations-report.md`.
