# LASTRO EJ — Backend

API do site institucional e do painel administrativo da LASTRO EJ. O projeto
fornece autenticação JWT, autorização por cargos e privilégios, gestão do blog,
gestão de parceiros e o fluxo de aprovação de novos usuários.

## Tecnologias

- Java 21
- Spring Boot 4.0.1
- Spring Security e OAuth2 Resource Server
- PostgreSQL e Spring Data JPA
- Flyway
- Redis
- Spring Mail
- Testcontainers
- Swagger/OpenAPI no perfil de desenvolvimento

## Funcionalidades implementadas

- Login com access token JWT e refresh token rotativo
- Autenticação multifator TOTP
- Proteção contra tentativas repetidas em ações públicas
- Solicitação pública de cadastro
- Aprovação e reprovação de usuários pela diretoria
- Cargos `BASIC`, `ADMIN` e `DIRECTOR`
- Autorização por privilégios carregados do banco
- CRUD administrativo e consulta pública de posts
- Estados `DRAFT`, `PUBLISHED` e `UNPUBLISHED` para posts
- CRUD administrativo e listagem pública de parceiros ativos
- Upload local de capas do blog e logos de parceiros com volume persistente
- Fila Redis para envio de e-mails
- Erros HTTP em JSON
- Migrations versionadas e validação do schema na inicialização

Cases, indicadores e contatos fazem parte do domínio planejado, mas seus fluxos
completos ainda não estão disponíveis na aplicação atual.

## Pré-requisitos

- Java 21
- Docker Desktop, recomendado para PostgreSQL, Redis, Mailpit e testes
- Portas locais livres:
  - `8080` para a API
  - `5432` para PostgreSQL
  - `6379` para Redis
  - `1025` e `8025` para Mailpit, quando usado

O Maven Wrapper já está incluído; não é necessário instalar Maven globalmente.

## Configuração

As configurações base estão em:

- `src/main/resources/application.properties`
- `src/main/resources/application-dev.properties`

Os principais valores são:

| Propriedade | Finalidade |
|---|---|
| `spring.datasource.*` | Conexão PostgreSQL |
| `spring.data.redis.*` | Conexão Redis |
| `app.cors.allowed-origins` | Origens autorizadas, separadas por vírgula |
| `jwt.public.key` e `jwt.private.key` | Chaves RSA usadas pelos tokens |
| `jwt.token.expires.in` | Validade do access token em segundos |
| `bootstrap.admin.*` | Credenciais da primeira conta `DIRECTOR` |
| `security.mfa.secret-encryption.key` | Chave AES em Base64 para proteger segredos MFA |
| `app.mail.*` e `spring.mail.*` | Remetente, links e transporte de e-mail |
| `app.storage.root` | Diretório persistente dos uploads |
| `app.storage.public-base-url` | Origem pública usada para formar as URLs das imagens |

### Conta inicial da diretoria

Somente uma conta de negócio é criada automaticamente: o diretor geral definido
por estas propriedades:


Altere principalmente a senha antes de usar o projeto fora de um ambiente
local. Ela precisa possuir no mínimo 8 caracteres.

Essas propriedades são consideradas **apenas quando ainda não existe uma conta
`DIRECTOR` no banco**. Alterar os valores depois da primeira inicialização não
renomeia a conta existente nem redefine sua senha. Essa regra evita a troca
silenciosa de credenciais a cada reinicialização.

Roles, privilégios e demais metadados técnicos são criados pelas migrations.
Nenhum post, parceiro ou outro dado fictício é inserido.

### Chave de MFA

Para permitir novos cadastros de MFA, defina
`SECURITY_MFA_SECRET_ENCRYPTION_KEY` com uma chave AES aleatória de 16, 24 ou
32 bytes codificada em Base64. Sem essa configuração, novos setups MFA são
bloqueados por segurança.

Não versione a chave real nem senhas de produção.

## Execução completa com Docker

Dentro do diretório `Backend`:

```powershell
docker compose -f docker/docker-compose.deploy.yml up --build -d
```

Esse compose inicia:

- API em `http://localhost:8080`
- PostgreSQL em `localhost:5432`
- Redis em `localhost:6379`

Verifique o estado:

```powershell
docker compose -f docker/docker-compose.deploy.yml ps
```

Para acompanhar os logs:

```powershell
docker compose -f docker/docker-compose.deploy.yml logs -f app
```

Para encerrar os containers preservando o volume do banco:

```powershell
docker compose -f docker/docker-compose.deploy.yml down
```

Não adicione `--volumes` se desejar manter os dados.

O mesmo cuidado vale para as imagens enviadas pelo painel: elas ficam no volume
`lastro_uploads`. O comando `docker compose down --volumes` remove tanto o
volume do PostgreSQL quanto o volume de imagens. Banco e imagens devem entrar
na estratégia de backup do ambiente.

O compose aceita, entre outras, as variáveis `POSTGRES_DB`, `POSTGRES_USER`,
`POSTGRES_PASSWORD`, `APP_CORS_ALLOWED_ORIGINS`,
`SECURITY_MFA_SECRET_ENCRYPTION_KEY` e as configurações `SPRING_MAIL_*`.

## Execução em desenvolvimento

Suba primeiro as dependências:

```powershell
docker compose -f docker/docker-compose.deploy.yml up -d postgres redis
docker compose -f docker/docker-compose.test.yml up -d mailpit
```

Depois execute:

```powershell
.\mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=dev
```

No Linux ou macOS, substitua `.\mvnw.cmd` por `./mvnw`.

Serviços úteis:

- API: `http://localhost:8080`
- Health check: `http://localhost:8080/actuator/health`
- Swagger UI em desenvolvimento: `http://localhost:8080/swagger-ui.html`
- OpenAPI JSON em desenvolvimento: `http://localhost:8080/v3/api-docs`
- Mailpit: `http://localhost:8025`

Swagger e OpenAPI ficam desabilitados na configuração de produção.

## Autenticação e aprovação

O fluxo administrativo é:

```text
solicitação de cadastro
        ↓
usuário BASIC + PENDING
        ↓
aprovação por um DIRECTOR
        ↓
login liberado
        ↓
painel definido por roles e privilégios
```

No fluxo atual, o usuário solicitado já é marcado com o e-mail verificado para
facilitar os testes. A aprovação da diretoria continua obrigatória.

Rotas principais de autenticação:

| Método e rota | Acesso |
|---|---|
| `POST /auth/register` | Público |
| `POST /auth/login` | Público |
| `GET /auth/me` | JWT |
| `POST /refresh` | Refresh token |
| `POST /auth/logout` | JWT |
| `GET /mfa/setup` | JWT e privilégio MFA |
| `POST /mfa/confirm` | JWT e privilégio MFA |
| `POST /mfa/verify` | Token temporário de desafio |
| `DELETE /mfa` | JWT e privilégio MFA |

O access token deve ser enviado assim:

```http
Authorization: Bearer <token>
```

Tokens de desafio MFA não são aceitos como access tokens. Usuários pendentes,
reprovados ou removidos também não mantêm acesso apenas por possuírem um JWT
antigo.

### Cargos e responsabilidades

| Cargo | Responsabilidade |
|---|---|
| `BASIC` | Conta base aprovada, sem gestão administrativa por padrão |
| `ADMIN` | Administração dos módulos concedidos por privilégios |
| `DIRECTOR` | Administração completa e gestão da equipe |

A diretoria pode listar usuários por estado, aprovar, reprovar, excluir e
atribuir os cargos gerenciáveis `BASIC` e `ADMIN`. Contas `DIRECTOR` não podem
ser criadas, rebaixadas ou excluídas por esse endpoint genérico.

## APIs do domínio implementadas

### Blog

- Público: `GET /api/public/posts` e `GET /api/public/posts/{slug}`
- Administrativo: CRUD em `/api/admin/posts`
- Publicação: `PATCH /api/admin/posts/{id}/publish`
- Retirada de publicação: `PATCH /api/admin/posts/{id}/unpublish`
- Privilégio: `PRIV_BLOG_ADMIN`

A API pública devolve somente posts publicados. O conteúdo é armazenado como
HTML; todo cliente que o renderizar deve aplicar sanitização contra XSS.

### Parceiros

- Público: `GET /api/public/partners`
- Administrativo: CRUD em `/api/admin/partners`
- Privilégio: `PRIV_PARTNERS_ADMIN`

A API pública devolve somente parceiros ativos, ordenados por `sortOrder`.

### Upload de imagens

- Capa do blog: `POST /api/admin/uploads/blog`
- Logo de parceiro: `POST /api/admin/uploads/partners`
- Campo multipart: `file`
- Formatos: JPEG, PNG e WebP
- Tamanho máximo: 5 MB
- Leitura pública: `GET /media/**`

Os endpoints de upload exigem, respectivamente, `PRIV_BLOG_ADMIN` e
`PRIV_PARTNERS_ADMIN`. O backend valida o conteúdo real da imagem, gera um nome
UUID e devolve uma URL absoluta. Os CRUDs continuam recebendo JSON e salvando
essa URL em `coverImageUrl` ou `logoUrl`.

Em execução sem Docker, os arquivos ficam por padrão em `Backend/uploads`,
diretório ignorado pelo Git. Em produção, configure
`APP_STORAGE_PUBLIC_BASE_URL` com a origem pública real do backend. O filesystem
local pressupõe uma única instância da aplicação; antes de escalar
horizontalmente, migre para armazenamento compartilhado.

### Gestão de usuários

- Base: `/api/director/users`
- Filtro de listagem: `PENDING`, `APPROVED` ou `REJECTED`
- Privilégio: `PRIV_USER_MANAGEMENT`

## Banco de dados

O Flyway executa as migrations presentes em
`src/main/resources/migrations`. O Hibernate usa
`spring.jpa.hibernate.ddl-auto=validate`, portanto não cria nem corrige tabelas
automaticamente.

Para qualquer mudança estrutural:

1. crie uma nova migration versionada;
2. não edite uma migration que já tenha sido aplicada em ambientes
   compartilhados;
3. execute os testes com um banco limpo;
4. não inclua dados fictícios de negócio.

O volume `pgdata` do Docker mantém o PostgreSQL entre reinicializações.

## Testes e build

Os testes de integração utilizam Testcontainers e exigem Docker ativo:

```powershell
.\mvnw.cmd test
```

Para gerar o pacote:

```powershell
.\mvnw.cmd clean package
```

O arquivo executável será criado em `target/`.

## Segurança operacional

Antes de publicar:

- substitua as credenciais padrão do diretor e do PostgreSQL;
- configure a chave de criptografia MFA;
- autorize em CORS somente as origens reais do frontend;
- use HTTPS;
- mantenha as chaves RSA e segredos fora do repositório de produção;
- configure SMTP real e um endereço remetente válido;
- não exponha PostgreSQL ou Redis diretamente à internet;
- mantenha Swagger desabilitado em produção;
- preserve a sanitização do HTML também nos clientes da API.

## Documentação complementar

O arquivo `AGENTS.md` reúne o contrato, as regras de domínio, as permissões e as
pendências planejadas do backend. Consulte-o antes de alterar rotas, payloads,
status HTTP ou regras de autorização.
