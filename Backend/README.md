# LASTRO EJ - Site Institucional (Backend)

Este projeto é o backend em Spring Boot para o site institucional da LASTRO EJ. Construído a partir do template `BackendSpringTemplate (D3tec)`, ele introduz e gerencia o domínio e as lógicas de negócio vitais do site.

## Funcionalidades e Entidades

O sistema baseia-se em 5 novas entidades essenciais:
1. **Blog (`BlogPost`):** Criação, publicação e consulta de postagens; controle de rascunho (`DRAFT`) e publicados (`PUBLISHED`).
2. **Cases de Sucesso (`CaseStudy`):** Listagem de projetos formatados em *problema -> solução -> resultado*.
3. **Parceiros (`Partner`):** Carrossel dinâmico e ordanado de clientes ou parceiros que estejam com status ativo.
4. **Indicadores (`SiteIndicator`):** Dados dinâmicos institucionais para a home page (Ex: "35+", "92%").
5. **Contato (`ContactMessage`):** Captação de contatos via formulário, proteção contra spam e integração assíncrona (fila Redis) para disparo de e-mails para a empresa.

## Metodologia de Desenvolvimento: Spec-Driven Development (SDD)

Este repositório adota rigorosamente a metodologia SDD:
- O comportamento e os limites do sistema estão definidos na pasta `docs/specs/`.
- O trabalho só prossegue se houver spec, plano técnico (`docs/technical-plans/`) e tarefas documentadas (`docs/tasks/`).
- Divergências com os artefatos devem ser registradas em relatórios (`docs/reports/`) e decididas formalmente com os stakeholders e frontend.

Consulte detalhadamente o arquivo `AGENTS.md` na raiz para o fluxo completo do contrato da API.

## Tecnologias e Versões
- Java: **21**
- Spring Boot: **4.0.1** (Conforme configuração do template inicial)
- Banco de Dados: **PostgreSQL** + Flyway
- Fila de Emails: **Redis**
- Segurança de Sessão: **JWT (Tokens)** e controle de acesso via Role e Privilege

## Como Executar Localmente

### Pré-requisitos
- PostgreSQL e Redis rodando localmente (ou uso do `docker-compose.test.yml`).
- Java 21 configurado (`JAVA_HOME`).

### Executando em Desenvolvimento
```bash
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

Acesse o Swagger UI para validar os endpoints: `http://localhost:8080/swagger-ui.html`

## Privilégios Administrativos (Segurança)
Para manipular as operações do CRUD do domínio, os usuários da role `ADMIN` recebem:
- `PRIV_BLOG_ADMIN`: Operar CRUD e publicação do Blog
- `PRIV_CASES_ADMIN`: Operar CRUD dos Cases de Sucesso
- `PRIV_PARTNERS_ADMIN`: Operar CRUD dos Parceiros
- `PRIV_INDICATORS_ADMIN`: Alterar valores dos Indicadores
- `PRIV_CONTACTS_VIEW`: Apenas leitura da caixa de Contatos Recebidos

Para acessar o painel `/api/admin/*`, o token JWT deve ser passado via header HTTP:
`Authorization: Bearer <TOKEN>`

---
Para orientações detalhadas de contrato HTTP e pendências abertas, veja o `AGENTS.md`.
