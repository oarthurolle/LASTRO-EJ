# AGENTS.md — Backend do Site Institucional LASTRO

Este arquivo orienta agentes de IA e pessoas desenvolvedoras que atuem no backend do site institucional da LASTRO EJ. Ele consolida os requisitos do produto, a especificação das entidades e o contrato de integração REST fornecidos pela liderança.

> **Regra principal:** preserve o contrato acordado com o frontend. Não renomeie rotas, campos, privilégios, status HTTP ou formatos de payload sem aprovação explícita dos responsáveis pelo projeto.

## 1. Fontes normativas

Consulte os documentos originais antes de implementar ou revisar uma funcionalidade:

1. `Contrato_API_LASTRO.pdf` — endpoints, payloads, autenticação, erros e status HTTP.
2. `Especificação_Entidades_LASTRO.pdf` — modelo de domínio, campos, tipos, obrigatoriedade, visibilidade pública e privilégios.
3. `Requisitos_LASTRO.pdf` — objetivo do produto, requisitos funcionais e não funcionais, regras de negócio, prioridades e riscos.

### 1.1 Ordem operacional em caso de divergência

Use a seguinte ordem apenas como regra de trabalho do repositório:

1. O **Contrato de API** prevalece para integração HTTP: URI, nomes de campos, payloads, autenticação e status.
2. A **Especificação das Entidades** prevalece para persistência, tipos, estados e permissões de domínio.
3. A **Análise de Requisitos** define escopo, comportamento esperado e critérios de aceite.

Essa ordem não autoriza resolver contradições silenciosamente. Quando os documentos divergirem e a implementação depender de uma decisão, pare, registre a divergência e solicite alinhamento aos líderes e ao frontend.


## 2. Metodologia: Spec-Driven Development

Este projeto adota **Spec-Driven Development (SDD)**. A implementação deve ser consequência de uma especificação escrita, revisada e rastreável — não o ponto de partida para definir o comportamento do sistema.

O objetivo da metodologia é reduzir ambiguidades, impedir alterações acidentais de escopo e manter uma cadeia verificável entre requisito, decisão técnica, tarefa, código e evidência de validação.

O fluxo oficial é:

```text
Especificação -> Plano técnico -> Tarefas -> Implementação -> Relatório
```

Cada etapa deve derivar da anterior. Um artefato posterior não pode ampliar, reinterpretar ou contradizer silenciosamente o artefato que lhe deu origem.

### 2.1 Estrutura documental

A documentação operacional do projeto está organizada assim:

```text
docs/
├── specs/
├── technical-plans/
├── tasks/
└── reports/
```

Use o mesmo identificador e nome de feature em todas as pastas para manter a rastreabilidade:

```text
docs/specs/001-blog.md
docs/technical-plans/001-blog-plan.md
docs/tasks/001-blog-tasks.md
docs/reports/001-blog-report.md
```

Não crie nomes desconectados, como `blog-v2.md`, `plano-posts.md` e `tarefas-cms.md`, para documentos pertencentes à mesma entrega.

### 2.2 Responsabilidade de cada artefato

#### `docs/specs/`

Define **o que deve ser construído e por quê**.

Uma spec deve conter, conforme aplicável:

- objetivo e contexto da feature;
- escopo e itens explicitamente fora do escopo;
- comportamento funcional e regras de negócio;
- atores, permissões e restrições;
- dados de entrada e saída relevantes;
- contratos HTTP afetados;
- cenários de sucesso, validação e erro;
- critérios de aceite verificáveis;
- dependências e perguntas em aberto.

A spec não deve escolher classes, pacotes, repositories ou detalhes internos apenas por preferência. Detalhes técnicos entram na spec somente quando já forem uma restrição aprovada do projeto ou parte do contrato externo.

#### `docs/technical-plans/`

Define **como uma spec aprovada será implementada no repositório atual**.

Um plano técnico deve conter, conforme aplicável:

- referência explícita à spec de origem;
- análise dos padrões e componentes já existentes no template;
- arquivos, módulos e camadas afetados;
- modelo de dados, DTOs, mapeamentos e migrations;
- endpoints e compatibilidade com o contrato;
- autenticação, autorização e privilégios;
- validações e tratamento de erros;
- estratégia de testes;
- riscos, dependências e decisões técnicas;
- ordem recomendada de implementação.

O plano deve respeitar integralmente o escopo da spec. Se o plano revelar que a spec é inviável, ambígua ou incompleta, atualize e reaprove a spec antes de implementar.

#### `docs/tasks/`

Converte o plano técnico em **unidades pequenas, ordenadas e verificáveis de trabalho**.

As tarefas devem:

- derivar de um plano técnico identificado;
- possuir resultado observável;
- ser pequenas o suficiente para revisão e validação isoladas;
- indicar dependências quando a ordem importar;
- incluir implementação, testes, migrations e documentação necessários;
- apontar, quando útil, qual critério de aceite ajudam a satisfazer.

Use checkboxes para representar o estado real:

```markdown
- [ ] Criar migration da tabela `blog_posts`
- [ ] Implementar geração e unicidade de slug
- [ ] Criar teste que impede rascunhos na API pública
```

Não use tarefas vagas como “fazer o blog”, “criar o backend” ou “implementar segurança”. Uma tarefa só deve ser marcada como concluída quando seu código, testes e validações aplicáveis estiverem completos.

#### `docs/reports/`

Registra **o que foi efetivamente implementado e validado**.

Um relatório deve conter, conforme aplicável:

- status da entrega: concluída, parcial ou bloqueada;
- itens implementados e itens não implementados;
- critérios de aceite validados;
- testes e comandos executados, com seus resultados;
- migrations e mudanças de banco realizadas;
- desvios em relação ao plano e respectivas aprovações;
- limitações, débitos técnicos e pendências;
- impacto ou ação necessária para o frontend.

Relatórios são evidências da execução. Eles não alteram requisitos, contratos ou decisões por conta própria.

### 2.3 Hierarquia e rastreabilidade

A cadeia de autoridade do projeto é:

1. documentos normativos fornecidos pela liderança;
2. spec aprovada da feature;
3. plano técnico aprovado ou revisado pela equipe;
4. lista de tarefas derivada do plano;
5. código, testes e migrations;
6. relatório de implementação e verificação.

Uma spec do repositório pode detalhar e tornar testável um requisito, mas não pode contradizer os documentos normativos sem uma decisão formal registrada.

Cada artefato deve referenciar os documentos relacionados. Exemplo:

```markdown
Spec: `docs/specs/001-blog.md`
Plano: `docs/technical-plans/001-blog-plan.md`
Tarefas: `docs/tasks/001-blog-tasks.md`
Relatório: `docs/reports/001-blog-report.md`
```

Quando aplicável, informe no início do documento:

```text
Status: DRAFT | IN_REVIEW | APPROVED | IMPLEMENTED | BLOCKED
Responsável: <nome ou equipe>
Última atualização: <AAAA-MM-DD>
```

`IMPLEMENTED` não significa necessariamente validado; a conclusão da feature depende também dos critérios da Definition of Done.

### 2.4 Ciclo de desenvolvimento

Siga esta ordem para cada feature ou alteração relevante:

1. Criar ou atualizar a spec.
2. Identificar e registrar perguntas em aberto.
3. Resolver decisões bloqueantes e aprovar a spec.
4. Inspecionar o código existente e produzir o plano técnico.
5. Revisar impactos em contrato, segurança, dados e integrações.
6. Derivar tarefas pequenas e ordenadas do plano.
7. Implementar uma tarefa ou grupo coerente de tarefas por vez.
8. Adicionar e executar os testes aplicáveis.
9. Validar todos os critérios de aceite da spec.
10. Produzir ou atualizar o relatório com evidências e pendências.

Não inicie implementação quando não houver spec para uma mudança de comportamento ou quando existir uma pergunta em aberto que altere contrato, persistência, segurança ou critério de aceite.

### 2.5 Controle de mudanças

Quando surgir uma alteração de requisito durante o desenvolvimento:

1. atualize primeiro a spec;
2. obtenha o alinhamento necessário, especialmente quando houver impacto no frontend;
3. atualize o plano técnico afetado;
4. revise ou crie as tarefas correspondentes;
5. somente então altere o código.

Não modifique a spec retroativamente apenas para justificar uma implementação já realizada. Se o código divergir do plano ou da spec, trate a situação como desvio: interrompa a conclusão, registre o motivo e obtenha uma decisão.

Correções internas que não alterem comportamento contratado podem dispensar uma nova spec, mas ainda devem respeitar os documentos existentes e receber testes proporcionais ao risco. Se houver dúvida sobre impacto externo, trate a mudança como alteração de comportamento.

### 2.6 Definition of Ready

Uma feature está pronta para implementação quando:

- possui spec identificada e suficientemente detalhada;
- os critérios de aceite são objetivos e verificáveis;
- não há decisão bloqueante em aberto;
- qualquer mudança de API foi alinhada com o frontend;
- permissões e regras de exposição pública estão definidas;
- o plano técnico considera o código e a infraestrutura existentes;
- as tarefas iniciais foram derivadas do plano.

Se algum desses pontos estiver ausente, o agente deve trabalhar na documentação ou solicitar alinhamento, em vez de preencher lacunas por suposição.

## 3. Contexto do projeto

O projeto é o backend Spring Boot do site institucional da LASTRO EJ, baseado no template `BackendSpringTemplate (D3tec)`, versão indicada no contrato como `1.0.0`.

O backend deve apoiar:

- publicação e consulta de posts do blog;
- publicação e consulta de cases de sucesso;
- exibição dinâmica de parceiros e indicadores da página inicial;
- captação de leads pelo formulário de contato;
- área administrativa protegida por JWT e privilégios;
- envio assíncrono de e-mail pela infraestrutura Redis já existente.

As páginas “Sobre nós”, “Serviços” e outros conteúdos institucionais podem ser estáticos no frontend. **Não crie entidades para esses conteúdos sem requisito e contrato aprovados.** O domínio dinâmico atualmente especificado possui apenas cinco novas entidades.

## 4. Componentes existentes que não devem ser reimplementados

O template já possui:

- `User`;
- `Role` e `Privilege`;
- `RefreshToken`;
- `EmailToken`;
- autenticação JWT;
- senha com BCrypt;
- verificação de e-mail;
- recuperação de senha;
- MFA;
- `ApplicationEmailService`;
- infraestrutura de fila Redis.

Regras:

- As novas entidades não possuem relacionamento direto com `User`.
- Nas rotas administrativas, o usuário é identificado pelo JWT.
- `RefreshToken` e `EmailToken` devem continuar funcionando como estão.
- A implementação dos novos módulos não deve reescrever autenticação, MFA, verificação de e-mail ou recuperação de senha.

## 5. Escopo de domínio autorizado

As novas entidades são:

1. `BlogPost`
2. `CaseStudy`
3. `Partner`
4. `SiteIndicator`
5. `ContactMessage`

Não crie entidades adicionais sem aprovação formal.

## 6. Regras obrigatórias de arquitetura

- Siga a estrutura de pacotes, nomenclatura, padrão de camadas, validação, segurança e tratamento de exceções já adotados no template.
- Use DTOs de entrada e saída para estabilizar o contrato HTTP.
- Não exponha entidades de persistência diretamente quando isso alterar os payloads acordados.
- Mantenha as regras de consulta pública separadas das regras administrativas.
- Gere no backend os valores descritos como automáticos: IDs, slug e timestamps.
- Antes de adicionar dependência, migration, framework ou padrão estrutural, verifique se o template já oferece solução equivalente.
- Não introduza CMS externo, CRM, newsletter, comentários, WhatsApp, analytics, agendamento de reunião ou sistema avançado de usuários sem nova decisão de arquitetura.
- Não assuma Maven ou Gradle: detecte o gerenciador de build pelos arquivos do repositório.

## 7. Modelo de domínio

### 7.1 `BlogPost`

Representa uma publicação do blog.

| Campo | Tipo conceitual | Obrigatório | Regra |
|---|---|---:|---|
| `id` | `Long` | sim | Gerado automaticamente. |
| `title` | `String` | sim | No POST documentado: mínimo 5 e máximo 150 caracteres. |
| `slug` | `String` | sim | Único e gerado automaticamente a partir do título. |
| `summary` | `String` | sim | Resumo curto para cards. |
| `content` | `TEXT` / HTML | sim | Conteúdo completo vindo de editor rich text/WYSIWYG. |
| `coverImageUrl` | `String` | não | URL da imagem de capa. |
| `author` | `String` | sim | Nome do autor. A origem do valor ainda precisa de alinhamento. |
| `category` | `String` | não | Ex.: Tecnologia, Gestão, Mercado. |
| `status` | `String` | sim | Somente `DRAFT` ou `PUBLISHED`. |
| `publishedAt` | `LocalDateTime` | não | Data e hora da publicação. |
| `createdAt` | `LocalDateTime` | sim | Data e hora da criação. |
| `updatedAt` | `LocalDateTime` | sim | Data e hora da última alteração. |

Regras:

- A API pública retorna somente posts `PUBLISHED`.
- O slug deve ser amigável, estável e único.
- O conteúdo HTML completo deve aparecer na consulta individual, não na listagem de cards.
- A mudança para `PUBLISHED` deve manter `publishedAt` coerente.
- Status fora de `DRAFT` e `PUBLISHED` devem ser rejeitados.

### 7.2 `CaseStudy`

Representa um case de sucesso no formato **problema -> solução -> resultado**.

| Campo | Tipo conceitual | Obrigatório | Regra |
|---|---|---:|---|
| `id` | `Long` | sim | Gerado automaticamente. |
| `clientName` | `String` | sim | Nome do cliente ou projeto. |
| `serviceCategory` | `String` | não | Categoria do serviço prestado. |
| `problem` | `TEXT` | sim | Problema existente antes do projeto. |
| `solution` | `TEXT` | sim | Solução aplicada pela LASTRO. |
| `result` | `TEXT` | sim | Resultado obtido, preferencialmente com métricas reais. |
| `coverImageUrl` | `String` | não | URL da imagem de destaque. |
| `testimonial` | `String` | não | Depoimento do cliente. |
| `projectDate` | `LocalDate` | não | Data do projeto. |
| `status` | `String` | sim | Somente `DRAFT` ou `PUBLISHED`. |

Regras:

- A API pública deve expor somente cases publicados.
- O formato problema, solução e resultado deve ser preservado nos DTOs.
- Não invente métricas ou resultados para preencher conteúdo institucional.

### 7.3 `Partner`

Representa parceiro ou cliente exibido no carrossel da home.

| Campo | Tipo conceitual | Obrigatório | Regra |
|---|---|---:|---|
| `id` | `Long` | sim | Gerado automaticamente. |
| `name` | `String` | sim | Nome do parceiro. |
| `logoUrl` | `String` | sim | URL da logo. |
| `externalLink` | `String` | não | Link externo opcional. |
| `sortOrder` | `Integer` | sim | Menor valor aparece primeiro. |
| `active` | `Boolean` | sim | Controla exibição sem excluir o registro. |

Regras:

- A API pública retorna apenas parceiros com `active=true`.
- A resposta pública deve estar ordenada por `sortOrder` crescente.
- Não use exclusão como substituto para ocultação quando `active=false` atende ao caso.

### 7.4 `SiteIndicator`

Representa um indicador institucional dinâmico da home.

| Campo | Tipo conceitual | Obrigatório | Regra |
|---|---|---:|---|
| `id` | `Long` | sim | Gerado automaticamente. |
| `name` | `String` | sim | Ex.: Projetos Realizados, NPS. |
| `value` | `String` | sim | Deve aceitar valores como `42`, `92%` e `35+`. |
| `description` | `String` | não | Contexto complementar. |
| `updatedAt` | `LocalDateTime` | sim | Atualizado quando o indicador mudar. |

Regras:

- Não converta `value` para número.
- Indicadores devem ser atualizáveis sem alteração de código.
- Valores exibidos devem ser reais e validados pela LASTRO.

### 7.5 `ContactMessage`

Representa um lead enviado pelo formulário de contato.

| Campo | Tipo conceitual | Obrigatório | Regra |
|---|---|---:|---|
| `id` | `Long` | sim | Gerado automaticamente. |
| `name` | `String` | sim | Nome completo do remetente. |
| `email` | `String` | sim | Validado no backend; o contrato cita formato RFC 5322. |
| `phone` | `String` | não | Telefone opcional. |
| `subject` | `String` | sim | Assunto do contato. |
| `message` | `TEXT` | sim | Corpo da mensagem. |
| `createdAt` | `LocalDateTime` | sim | Data e hora do envio. |

Regras:

- Persistir a mensagem no banco.
- Encaminhar e-mail para `lastro.ej@uern.br`.
- Usar o fluxo assíncrono pela fila Redis existente.
- Aplicar proteção contra spam.
- Não expor mensagens em rota pública.
- Não aceitar o campo `address` no contrato atual sem aprovação, embora ele apareça como opcional na análise de requisitos.

## 8. Contrato HTTP global

### 8.1 Convenções

- Rotas públicas: `/api/public`.
- Rotas administrativas: `/api/admin`.
- Rotas administrativas exigem:

```http
Authorization: Bearer <TOKEN>
```

- Datas e horas dos exemplos seguem ISO 8601, como `2026-07-10T14:30:00`.
- Propriedades JSON devem permanecer em `camelCase` exatamente como documentadas.
- Não transforme uma resposta em envelope paginado, ou o inverso, sem atualizar o contrato com o frontend.

### 8.2 Formato global de erro

Toda falha deve seguir o handler global do template:

```json
{
  "timestamp": "2026-07-19T13:45:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Mensagem descritiva do erro ocorrido.",
  "path": "/api/admin/posts"
}
```

Não crie formatos de erro específicos por módulo.

### 8.3 Status HTTP

| Status | Uso acordado |
|---|---|
| `200 OK` | Leituras bem-sucedidas e atualizações via `PUT`. |
| `201 Created` | Criação de recursos via `POST` para blog, cases e parceiros. |
| `202 Accepted` | Contato persistido e aceito para processamento na fila Redis. |
| `400 Bad Request` | Falha de validação. |
| `401 Unauthorized` | JWT ausente, expirado ou inválido. |
| `403 Forbidden` | Usuário autenticado sem o privilégio exigido. |
| `404 Not Found` | Slug ou ID inexistente. |

> Um quadro do contrato mostra `21 Created`, mas o resumo geral e o padrão HTTP indicam `201 Created`. Use `201 Created` como valor operacional e mantenha essa divergência registrada.

## 9. Endpoints públicos

### 9.1 Blog

#### `GET /api/public/posts`

Deve:

- listar somente posts `PUBLISHED`;
- aceitar `page` e `size`;
- aceitar filtro opcional `category`;
- retornar os campos de card: `id`, `title`, `slug`, `summary`, `coverImageUrl`, `author`, `category` e `publishedAt`.

A descrição menciona busca por termo, mas o nome do query parameter não foi definido. Não invente esse parâmetro sem alinhamento.

O contrato descreve paginação, mas mostra uma resposta em array simples. Essa divergência está registrada na seção 15.

#### `GET /api/public/posts/{slug}`

Deve:

- retornar um post publicado pela URL amigável;
- incluir `content` HTML completo;
- retornar `404` quando o slug não existir;
- nunca permitir consulta pública de rascunho.

### 9.2 Cases

#### `GET /api/public/cases`

Deve retornar somente cases publicados, com os campos de domínio aplicáveis.

#### `GET /api/public/cases/{id}`

A rota está prevista na especificação das entidades.

Regras:

- retornar apenas case publicado;
- retornar `404` para ID inexistente;
- não adicionar campos fora do modelo sem alinhamento;
- o payload detalhado não foi formalizado no contrato de API.

### 9.3 Parceiros

#### `GET /api/public/partners`

Deve:

- filtrar `active=true`;
- ordenar por `sortOrder` crescente;
- retornar `id`, `name`, `logoUrl`, `externalLink` e `sortOrder` conforme o exemplo do contrato;
- não expor `active` se o DTO público seguir exatamente o exemplo acordado.

### 9.4 Indicadores

#### `GET /api/public/indicators`

Deve retornar `id`, `name`, `value` e `description`.

Não calcule nem altere automaticamente NPS ou número de projetos sem regra aprovada.

### 9.5 Contato

#### `POST /api/public/contact`

Payload acordado:

```json
{
  "name": "Carlos Eduardo",
  "email": "carlos.leads@gmail.com",
  "phone": "84988887777",
  "subject": "Solicitação de Orçamento de Software",
  "message": "Tenho interesse no desenvolvimento de um ERP interno para..."
}
```

Fluxo obrigatório:

1. Validar os campos obrigatórios.
2. Validar o formato do e-mail.
3. Aplicar proteção contra spam.
4. Persistir `ContactMessage`.
5. Encaminhar o envio de e-mail para a fila Redis.
6. Retornar `202 Accepted` somente quando a solicitação tiver sido aceita para processamento.
7. Em falha de validação, persistência ou enfileiramento, retornar o erro global apropriado.

Assunto recomendado para o e-mail:

```text
Novo contato pelo site da LASTRO — [Assunto informado]
```

## 10. Endpoints administrativos e privilégios

| Módulo | Família de rota | Privilégio |
|---|---|---|
| Blog | CRUD em `/api/admin/posts` | `PRIV_BLOG_ADMIN` |
| Cases | CRUD em `/api/admin/cases` | `PRIV_CASES_ADMIN` |
| Parceiros | CRUD em `/api/admin/partners` | `PRIV_PARTNERS_ADMIN` |
| Indicadores | CRUD em `/api/admin/indicators` | `PRIV_INDICATORS_ADMIN` |
| Contatos | leitura em `/api/admin/contacts` | `PRIV_CONTACTS_VIEW` |

A role `ADMIN` deve receber os novos privilégios.

### 10.1 `POST /api/admin/posts`

- Exige `PRIV_BLOG_ADMIN`.
- Gera `slug` no backend.
- Retorna `201 Created`.
- O contrato explicita no request: `title`, `summary`, `content` e `status`.
- `title`: mínimo 5 e máximo 150 caracteres.
- `status`: somente `DRAFT` ou `PUBLISHED`.

Exemplo de resposta:

```json
{
  "id": 13,
  "title": "Nova Postagem",
  "slug": "nova-postagem",
  "status": "DRAFT",
  "createdAt": "2026-07-19T13:40:00"
}
```

### 10.2 `POST /api/admin/cases`

- Exige `PRIV_CASES_ADMIN`.
- Retorna `201 Created`.
- O exemplo contém `clientName`, `serviceCategory`, `problem`, `solution` e `status`.
- A ausência de `result` no exemplo conflita com a entidade, onde o campo é obrigatório. Não resolva sem alinhamento.

### 10.3 `PUT /api/admin/indicators/{id}`

- Exige `PRIV_INDICATORS_ADMIN`.
- Retorna `200 OK`.
- Request documentado:

```json
{
  "value": "50+",
  "description": "projetos entregues com orgulho"
}
```

### 10.4 CRUD não detalhado

A especificação exige CRUD para posts, cases, parceiros e indicadores, mas o contrato não detalha todos os métodos, URIs por ID, requests e responses.

Ao implementar operações não detalhadas:

- preserve a família de rota indicada;
- siga o padrão existente no template;
- não assuma payload que afete o frontend;
- confirme com o frontend a forma das respostas de listagem, detalhe, atualização e exclusão;
- documente o acordo antes de concluir.

Para contatos, o escopo administrativo documentado é **somente leitura**. Não crie edição ou publicação de mensagens.

## 11. Segurança e autorização

### 11.1 Privilégios novos

- `PRIV_BLOG_ADMIN`
- `PRIV_CASES_ADMIN`
- `PRIV_PARTNERS_ADMIN`
- `PRIV_INDICATORS_ADMIN`
- `PRIV_CONTACTS_VIEW`

### 11.2 Regras

- Rotas públicas não devem exigir JWT.
- Rotas administrativas devem exigir JWT válido e o privilégio específico.
- Diferencie corretamente `401 Unauthorized` de `403 Forbidden`.
- Não conceda acesso administrativo apenas porque o usuário está autenticado.
- Não exponha senha, hash BCrypt, chave MFA, tokens ou dados internos de segurança.
- Não exponha mensagens de contato em endpoints públicos.
- Valide toda entrada no backend, mesmo quando o frontend já validar.
- O HTML do blog deve ser tratado de forma compatível com o requisito de segurança. Qualquer estratégia de sanitização deve preservar o conteúdo permitido pelo editor e ser alinhada com o frontend.
- HTTPS é obrigatório no ambiente publicado.

## 12. Requisitos não funcionais aplicáveis ao backend

### 12.1 Desempenho

- Não carregue `content` completo na listagem de posts.
- Respeite a paginação acordada para posts sem inventar envelope de resposta.
- Evite consultas N+1 e carregamentos desnecessários.
- Otimize a consulta de parceiros ativos e ordenados.

### 12.2 Confiabilidade

- O formulário não pode responder sucesso quando a solicitação não foi persistida ou aceita pela fila.
- Erros devem ser rastreáveis em logs sem registrar segredos ou dados pessoais desnecessários.
- Timestamps devem ser gerados de forma consistente.

### 12.3 SEO e URLs

- Slugs de blog devem ser amigáveis e únicos.
- Mudanças na regra de slug podem quebrar links; não altere sem plano de compatibilidade.

### 12.4 Privacidade e LGPD

- Colete apenas os dados previstos no contrato.
- Restrinja a leitura de contatos a `PRIV_CONTACTS_VIEW`.
- Não exponha leads em logs, respostas públicas ou mensagens de erro.
- Política de retenção e exclusão de contatos não foi definida; não invente uma sem aprovação.

## 13. Fora do escopo atual

Não implemente sem solicitação formal:

- agendamento automático de reuniões;
- integração com CRM;
- newsletter;
- comentários no blog;
- sistema avançado de usuários;
- relatórios de acesso;
- integração com WhatsApp;
- analytics no backend;
- filtros avançados de cases;
- busca de blog com parâmetro ainda não definido;
- endpoint de upload de imagens;
- entidades para Sobre nós, Serviços, equipe, rodapé ou páginas estáticas;
- edição administrativa de mensagens de contato.

## 14. Fluxo de trabalho para agentes de IA

Ao receber uma tarefa neste repositório:

1. Leia este arquivo e identifique o módulo afetado.
2. Consulte os documentos normativos relacionados à mudança.
3. Localize a spec correspondente em `docs/specs/`. Se a tarefa alterar comportamento e não houver spec adequada, não comece pelo código.
4. Verifique o status da spec, seus critérios de aceite e perguntas em aberto. Confirme se existe alguma pendência bloqueante na seção 15.
5. Leia o plano correspondente em `docs/technical-plans/` e as tarefas em `docs/tasks/`. Quando esses artefatos forem necessários e ainda não existirem, produza-os antes da implementação.
6. Inspecione o código existente antes de propor classes, pacotes ou dependências.
7. Localize padrões equivalentes no template: controller, DTO, mapper, service, repository, validação, security e exception handler.
8. Relacione a tarefa atual aos requisitos, contratos e critérios de aceite afetados.
9. Implemente a menor alteração que conclua a tarefa sem ampliar o escopo da spec.
10. Adicione ou atualize testes e execute os comandos de build e teste detectados no repositório.
11. Marque uma tarefa como concluída somente depois de validar seu resultado e revise o diff para evitar alterações acidentais na autenticação ou no contrato.
12. Atualize o relatório correspondente em `docs/reports/` quando a entrega produzir evidência relevante, desvio, bloqueio ou conclusão de feature.
13. Registre qualquer decisão nova que precise ser aprovada ou compartilhada com o frontend.

### 14.1 O que o agente não deve fazer

- Não inventar campos, enums, rotas, query parameters ou wrappers de resposta.
- Não renomear `clientName`, `serviceCategory`, `coverImageUrl`, `sortOrder` ou qualquer outro campo por preferência pessoal.
- Não transformar `SiteIndicator.value` em número.
- Não retornar rascunhos nas APIs públicas.
- Não retornar parceiros inativos.
- Não enviar e-mail de contato de forma síncrona contornando a fila Redis definida.
- Não criar relacionamento das novas entidades com `User` sem mudança aprovada.
- Não refatorar o template inteiro para concluir uma tarefa local.
- Não afirmar que a tarefa está pronta sem executar os testes disponíveis.

### 14.2 Formato esperado ao concluir uma tarefa

Informe:

- o que foi alterado;
- quais contratos e requisitos foram atendidos;
- quais testes foram executados e seus resultados;
- se houve migration ou mudança no banco;
- se existe divergência ou decisão pendente;
- qualquer impacto esperado no frontend.

## 15. Divergências e lacunas conhecidas

Estas pendências devem permanecer visíveis. Não as resolva silenciosamente.

### 15.1 Listagem de posts: paginação vs. array simples

O endpoint é descrito como paginado e recebe `page` e `size`, mas o exemplo de resposta é um array simples, sem metadados de página.

**É necessário decidir:** array simples, `Page` do Spring ou envelope DTO próprio.

### 15.2 Busca de posts

A descrição menciona filtro por termo de busca, mas os query parameters listados mostram apenas `page`, `size` e `category`.

**É necessário decidir:** nome e semântica do parâmetro de busca.

### 15.3 Criação de post e campo `author`

A entidade exige `author`, mas o request de `POST /api/admin/posts` não inclui esse campo.

**É necessário decidir:** receber no request, derivar do usuário autenticado ou adotar outra regra explícita.

### 15.4 Campos opcionais na criação de post

`coverImageUrl` e `category` existem na entidade e nos requisitos, mas não aparecem no request detalhado de criação.

**É necessário decidir:** se entram no mesmo DTO, em atualização posterior ou em fluxo separado.

### 15.5 Criação de case sem `result`

A entidade define `result` como obrigatório, mas o exemplo de `POST /api/admin/cases` não envia esse campo.

**É necessário decidir:** corrigir o contrato ou alterar formalmente a obrigatoriedade.

### 15.6 Campo `address` do contato

A análise de requisitos lista Endereço como opcional, mas `ContactMessage` e o contrato de API não possuem `address`.

**Regra até novo alinhamento:** não aceitar, persistir ou devolver `address` no contrato atual.

### 15.7 Proteção contra spam

O requisito exige proteção e sugere reCAPTCHA, hCaptcha ou alternativa, mas não define provedor, token, cabeçalho ou payload.

**É necessário decidir:** mecanismo e contrato de verificação com o frontend.

### 15.8 Operações CRUD administrativas

A especificação solicita CRUD, mas somente alguns métodos possuem payloads completos no contrato.

**É necessário decidir:** requests, responses, status e URIs por ID para as operações restantes.

### 15.9 Upload de imagens

Blog, cases e parceiros usam URLs de imagem, mas não existe contrato de upload ou escolha de armazenamento.

**Regra até novo alinhamento:** trate os campos como URLs; não crie endpoint de upload por conta própria.

### 15.10 Entrega assíncrona de e-mail

O endpoint retorna `202` quando a mensagem entra na fila. A análise de requisitos também pede que o usuário seja informado em caso de erro no envio.

**Interpretação operacional:** falhas antes ou durante o enfileiramento devem ser retornadas imediatamente; falhas posteriores de entrega exigem tratamento operacional ainda não especificado.

## 16. Estratégia mínima de testes

Use o framework e os padrões já presentes no template.

### 16.1 Blog

- cria post com dados válidos;
- rejeita título fora dos limites documentados;
- rejeita status inválido;
- gera slug automaticamente e garante unicidade;
- lista somente `PUBLISHED` na API pública;
- consulta por slug e retorna `404` quando inexistente;
- impede acesso admin sem JWT, com JWT inválido e sem privilégio.

### 16.2 Cases

- persiste os campos obrigatórios definidos pela decisão vigente;
- rejeita status inválido;
- lista somente publicados;
- retorna `404` para ID inexistente;
- aplica `PRIV_CASES_ADMIN`.

### 16.3 Parceiros

- lista somente ativos;
- ordena por `sortOrder` crescente;
- aceita `externalLink` ausente;
- aplica `PRIV_PARTNERS_ADMIN`.

### 16.4 Indicadores

- preserva `value` como string, inclusive `%` e `+`;
- atualiza `updatedAt`;
- atualiza por `PUT /api/admin/indicators/{id}`;
- aplica `PRIV_INDICATORS_ADMIN`.

### 16.5 Contato

- aceita request válido e retorna `202`;
- persiste a mensagem;
- envia para a fila Redis e usa o destinatário fixo;
- aceita telefone ausente;
- rejeita nome, e-mail, assunto ou mensagem ausentes;
- rejeita e-mail inválido;
- não expõe contatos publicamente;
- exige `PRIV_CONTACTS_VIEW` na leitura administrativa;
- retorna erro global quando não consegue persistir ou enfileirar.

### 16.6 Contrato global

- erros seguem `timestamp`, `status`, `error`, `message` e `path`;
- JSON usa nomes exatos em `camelCase`;
- status HTTP correspondem ao contrato;
- nenhum dado sensível aparece nas respostas.

## 17. Ordem sugerida de implementação

1. Mapear a estrutura do template e as migrations existentes.
2. Criar os novos privilégios e vinculá-los à role `ADMIN` sem alterar privilégios existentes.
3. Implementar `BlogPost` e o fluxo público/admin acordado.
4. Implementar `CaseStudy` após resolver a divergência do campo `result`.
5. Implementar `Partner` com filtro e ordenação pública.
6. Implementar `SiteIndicator` e a atualização administrativa.
7. Implementar `ContactMessage`, persistência, anti-spam e fila Redis.
8. Consolidar handler global, documentação e testes de autorização.
9. Executar testes de integração com o frontend usando payloads reais.

Essa ordem é uma sugestão de execução e não substitui o planejamento oficial da equipe.

## 18. Definition of Done

Uma alteração só pode ser considerada concluída quando:

- atende aos documentos normativos, à spec aprovada e a este arquivo;
- mantém spec, plano técnico e tarefas coerentes com a implementação;
- possui tarefas concluídas marcadas somente após validação;
- mantém compatibilidade com o frontend;
- possui validações de entrada;
- aplica o privilégio correto;
- usa o handler global de erros;
- não expõe rascunhos, parceiros inativos, contatos ou dados sensíveis indevidamente;
- possui testes automatizados proporcionais ao risco;
- passa no build e nos testes do repositório;
- inclui migration quando necessária e segue o mecanismo já adotado no projeto;
- não introduz dependência ou escopo não aprovado;
- registra divergências ainda abertas;
- atualiza o relatório da feature ou entrega quando aplicável;
- atualiza a documentação do contrato quando uma decisão formal mudar a API.

---

**Resumo para agentes:** implemente apenas o que está contratado, reutilize o template, proteja as rotas administrativas por privilégio, filtre corretamente o conteúdo público, mantenha os payloads estáveis e solicite decisão humana diante das lacunas listadas.
