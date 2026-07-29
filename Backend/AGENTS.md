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

Este projeto adota **Spec-Driven Development (SDD)**. A implementação deve ser consequência de uma especificação escrita, revisada, aprovada e rastreável — nunca o ponto de partida para definir o comportamento do sistema.

O objetivo é reduzir ambiguidades, impedir alterações acidentais de escopo e manter uma cadeia verificável entre necessidade, requisito, decisão técnica, tarefa, código e evidência de validação.

O fluxo obrigatório é:

```text
Descoberta da feature
    -> SPEC
    -> aprovação explícita da SPEC
    -> PLAN técnico
    -> aprovação explícita do PLAN
    -> TASKS
    -> aprovação da lista de TASKS
    -> execução de uma TASK por vez
    -> validação do desenvolvedor
    -> relatório e encerramento
```

Os três artefatos centrais do fluxo são, portanto:

```text
SPECS -> PLANS -> TASKS
```

Cada etapa deve derivar exclusivamente da anterior. Um artefato posterior não pode ampliar, reinterpretar ou contradizer silenciosamente o artefato que lhe deu origem.

> **Gate obrigatório:** o agente deve parar ao final de cada etapa e aguardar aprovação explícita do desenvolvedor. Silêncio, ausência de objeção, início de outra mensagem ou inferência do agente não contam como aprovação.

### 2.1 Princípios operacionais do SDD

1. **Nenhum código antes da documentação aprovada.** Mudanças de comportamento exigem SPEC, PLAN e TASKS aprovados.
2. **Uma etapa por vez.** Durante a elaboração da SPEC, o agente não deve adiantar o PLAN, as TASKS ou a implementação.
3. **Aprovação explícita.** O avanço deve ocorrer somente após uma resposta inequívoca, como `SPEC APROVADA`, `PLAN APROVADO`, `TASKS APROVADAS` ou autorização equivalente.
4. **Uma task por vez.** O agente não deve iniciar a próxima task até apresentar a evidência da task atual e receber validação do desenvolvedor.
5. **Rastreabilidade completa.** Requisito, critério de aceite, decisão técnica, task, teste e alteração de código devem poder ser relacionados.
6. **Sem decisões silenciosas.** Lacunas que afetem contrato, segurança, persistência, integração ou critérios de aceite devem ser registradas e submetidas ao desenvolvedor.
7. **Menor mudança suficiente.** A implementação deve concluir somente o escopo aprovado, sem refatorações oportunistas ou funcionalidades adicionais.
8. **Evidência acima de afirmação.** Uma task não está concluída apenas porque o agente declarou sucesso; é necessário apresentar diff resumido, testes e resultados verificáveis.

### 2.2 Estrutura documental

A documentação operacional do projeto está organizada assim:

```text
docs/
├── specs/
├── plans/
├── tasks/
└── reports/
```

Use o mesmo identificador e nome de feature em todas as pastas:

```text
docs/specs/001-blog.md
docs/plans/001-blog-plan.md
docs/tasks/001-blog-tasks.md
docs/reports/001-blog-report.md
```

Não crie nomes desconectados, como `blog-v2.md`, `plano-posts.md` e `tarefas-cms.md`, para documentos pertencentes à mesma entrega.

O identificador deve ser estável. Mudanças posteriores na mesma feature devem atualizar os artefatos existentes ou criar uma nova feature formalmente relacionada, sem sobrescrever o histórico de decisões.

### 2.3 Metadados e estados obrigatórios

Todo artefato deve começar com metadados equivalentes a:

```yaml
id: 001-blog
title: Blog institucional
status: DRAFT
owner: <nome ou equipe>
approved_by: null
approved_at: null
last_updated: 2026-07-29
source_documents:
  - Contrato_API_LASTRO.pdf
  - Especificação_Entidades_LASTRO.pdf
  - Requisitos_LASTRO.pdf
```

Estados permitidos:

| Artefato | Estados permitidos |
|---|---|
| SPEC | `DRAFT`, `IN_REVIEW`, `APPROVED`, `BLOCKED`, `SUPERSEDED` |
| PLAN | `DRAFT`, `IN_REVIEW`, `APPROVED`, `BLOCKED`, `SUPERSEDED` |
| TASKS | `DRAFT`, `IN_REVIEW`, `APPROVED`, `BLOCKED`, `SUPERSEDED` |
| Task individual | `TODO`, `IN_PROGRESS`, `AWAITING_VALIDATION`, `DONE`, `BLOCKED` |
| Relatório | `PARTIAL`, `COMPLETED`, `BLOCKED` |

Regras de estado:

- somente uma pessoa desenvolvedora ou responsável autorizado pode registrar `APPROVED`;
- o agente pode propor a alteração de estado, mas não deve se autoaprovar;
- uma task só recebe `DONE` depois da validação explícita do desenvolvedor;
- quando um artefato aprovado mudar materialmente, ele volta para `IN_REVIEW` e os artefatos descendentes afetados ficam bloqueados até nova aprovação;
- `IMPLEMENTED` não é estado de aprovação documental e não substitui validação.

### 2.4 Responsabilidade de cada artefato

#### `docs/specs/`

Define **o que deve ser construído, por que deve existir e como o comportamento será aceito**.

A SPEC deve conter, conforme aplicável:

- problema, objetivo e valor esperado;
- contexto fornecido pelo solicitante;
- atores, jornadas e permissões;
- escopo funcional;
- itens explicitamente fora do escopo;
- regras de negócio e invariantes;
- entradas, saídas e contratos externos relevantes;
- cenários de sucesso, validação, erro e borda;
- requisitos não funcionais aplicáveis;
- critérios de aceite objetivos, numerados e verificáveis;
- dependências, riscos funcionais e perguntas em aberto;
- suposições propostas, claramente marcadas como não aprovadas;
- relação com os documentos normativos.

A SPEC não deve escolher classes, pacotes, repositories ou detalhes internos por preferência. Detalhes técnicos entram na SPEC somente quando forem restrições aprovadas ou parte de contrato externo.

Ao receber a explicação de uma feature, o agente deve primeiro transformar a intenção em uma SPEC `DRAFT`. Caso faltem informações materiais, deve registrar perguntas em aberto e manter a SPEC como `BLOCKED` ou `IN_REVIEW`; não deve preencher as lacunas por suposição.

#### `docs/plans/`

Define **como uma SPEC aprovada será implementada no repositório real**.

O PLAN deve conter, conforme aplicável:

- referência explícita à versão aprovada da SPEC;
- confirmação de que a SPEC está `APPROVED`;
- levantamento do código, padrões e infraestrutura existentes;
- arquivos, módulos e camadas afetados;
- modelo de dados, DTOs, mapeamentos e migrations;
- endpoints e compatibilidade com o contrato;
- autenticação, autorização e privilégios;
- validações, erros, observabilidade e logs;
- estratégia de testes por camada;
- riscos técnicos, dependências e plano de mitigação;
- compatibilidade, rollback e migração quando aplicável;
- decisões técnicas e alternativas descartadas;
- ordem recomendada de execução;
- mapeamento de cada decisão para os critérios de aceite da SPEC.

O PLAN deve ser baseado em inspeção do repositório. Não proponha arquivos, frameworks, dependências ou padrões sem verificar o que já existe.

Se o PLAN revelar que a SPEC é inviável, ambígua ou incompleta, interrompa o planejamento, devolva a SPEC para revisão e aguarde nova aprovação.

#### `docs/tasks/`

Converte o PLAN aprovado em **unidades pequenas, ordenadas, isoláveis e verificáveis de trabalho**.

Cada task deve conter:

```markdown
### TASK-001 — Criar migration de blog_posts

Status: TODO
Origem: PLAN seção 4.1
Critérios de aceite relacionados: AC-01, AC-03
Dependências: nenhuma

Objetivo:
- Criar a estrutura persistente aprovada para BlogPost.

Escopo permitido:
- arquivos esperados ou áreas do projeto que podem ser alteradas.

Fora do escopo:
- alterações que devem permanecer para tasks posteriores.

Validação obrigatória:
- comando de teste ou verificação;
- resultado observável esperado;
- revisão do diff.

Evidências:
- preenchidas somente após a execução.
```

As tasks devem:

- derivar de um PLAN identificado e aprovado;
- possuir resultado observável;
- ser pequenas o suficiente para revisão isolada;
- indicar dependências e ordem de execução;
- incluir código, testes, migrations e documentação necessários;
- mapear os critérios de aceite que ajudam a satisfazer;
- declarar limites para evitar mudanças colaterais;
- possuir validação objetiva.

Não use tasks vagas como “fazer o blog”, “criar o backend” ou “implementar segurança”.

#### `docs/reports/`

Registra **o que foi efetivamente implementado, testado, validado ou bloqueado**.

O relatório deve conter, conforme aplicável:

- status da entrega: concluída, parcial ou bloqueada;
- versões aprovadas da SPEC, do PLAN e das TASKS;
- tasks concluídas, pendentes e bloqueadas;
- critérios de aceite validados e respectivas evidências;
- testes e comandos executados, com resultados;
- migrations e mudanças de banco realizadas;
- desvios em relação ao PLAN e respectivas aprovações;
- limitações, débitos técnicos e pendências;
- impacto ou ação necessária para o frontend;
- confirmação da revisão final do diff.

Relatórios são evidências da execução. Eles não alteram requisitos, contratos ou decisões por conta própria.

### 2.5 Hierarquia e rastreabilidade

A cadeia de autoridade é:

1. documentos normativos fornecidos pela liderança;
2. SPEC aprovada da feature;
3. PLAN técnico aprovado;
4. lista de TASKS aprovada;
5. autorização para executar a task atual;
6. código, testes e migrations da task;
7. validação explícita do desenvolvedor;
8. relatório de implementação e verificação.

Uma SPEC pode detalhar e tornar testável um requisito, mas não pode contradizer os documentos normativos sem decisão formal registrada.

Cada artefato deve referenciar os relacionados:

```markdown
Spec: `docs/specs/001-blog.md` — versão 1.0 — APPROVED
Plan: `docs/plans/001-blog-plan.md` — versão 1.0 — APPROVED
Tasks: `docs/tasks/001-blog-tasks.md` — versão 1.0 — APPROVED
Report: `docs/reports/001-blog-report.md`
```

Os critérios de aceite devem usar identificadores estáveis, como `AC-01`, e as tasks, testes e evidências devem citar esses identificadores.

### 2.6 Gates de aprovação

#### Gate 0 — Entrada e descoberta

O desenvolvedor explica a feature. O agente deve:

1. resumir o entendimento;
2. separar fatos fornecidos, restrições normativas e suposições;
3. identificar perguntas que alteram contrato, persistência, segurança, UX ou aceite;
4. criar ou atualizar apenas a SPEC;
5. apresentar a SPEC para revisão.

**Saída permitida:** SPEC `DRAFT`, `IN_REVIEW` ou `BLOCKED`.

**Proibido neste gate:** criar PLAN, criar TASKS ou alterar código.

#### Gate 1 — Aprovação da SPEC

Só avance quando:

- todos os critérios de aceite forem verificáveis;
- não houver pergunta bloqueante;
- contratos e permissões estiverem definidos;
- o desenvolvedor registrar aprovação explícita.

Após a aprovação, atualize os metadados da SPEC para `APPROVED`, com responsável e data.

#### Gate 2 — PLAN técnico

Com a SPEC aprovada, o agente deve inspecionar o repositório e produzir apenas o PLAN técnico.

**Proibido neste gate:** criar ou implementar TASKS antes da revisão do PLAN.

Só avance após aprovação explícita do PLAN.

#### Gate 3 — TASKS

Com o PLAN aprovado, o agente deve criar a lista ordenada de TASKS e seu mapeamento com critérios de aceite.

A lista deve ser revisada antes da implementação para confirmar tamanho, ordem, dependências e validações.

Só avance após aprovação explícita das TASKS.

#### Gate 4 — Execução controlada

Para cada task:

1. selecionar somente a próxima task `TODO` cujas dependências estejam concluídas;
2. apresentar objetivo, escopo, arquivos prováveis e validações;
3. aguardar autorização do desenvolvedor para iniciar;
4. mudar a task para `IN_PROGRESS`;
5. implementar apenas o escopo da task;
6. executar testes e verificações aplicáveis;
7. revisar o diff;
8. registrar evidências;
9. mudar a task para `AWAITING_VALIDATION`;
10. apresentar o resultado ao desenvolvedor;
11. aguardar validação explícita;
12. somente então marcar `DONE` e propor a próxima task.

Não execute duas tasks em paralelo ou em lote, salvo autorização explícita que identifique exatamente quais tasks podem ser agrupadas.

#### Gate 5 — Encerramento

A feature só pode ser encerrada quando:

- todas as tasks obrigatórias estiverem `DONE`;
- todos os critérios de aceite tiverem evidência;
- o build e a suíte de testes aplicável estiverem aprovados;
- o relatório final estiver atualizado;
- divergências, débitos e impactos no frontend estiverem registrados;
- o desenvolvedor aceitar o encerramento.

### 2.7 Protocolo de comunicação do agente

Ao final de cada etapa, o agente deve informar claramente:

- artefato criado ou alterado;
- status atual;
- decisões tomadas;
- perguntas ou riscos pendentes;
- ação humana necessária para avançar.

Use chamadas inequívocas, por exemplo:

```text
Aguardando aprovação da SPEC. Nenhum PLAN ou código será produzido antes dessa aprovação.
```

```text
Aguardando validação da TASK-003. A próxima task ainda não foi iniciada.
```

A autorização para avançar vale apenas para a etapa ou task mencionada. Não reutilize uma aprovação anterior para mudanças posteriores.

### 2.8 Controle de mudanças

Quando surgir uma alteração de requisito durante o desenvolvimento:

1. pause a task atual em um ponto seguro;
2. registre o impacto e a origem da mudança;
3. atualize primeiro a SPEC;
4. obtenha nova aprovação da SPEC;
5. atualize e reaprove o PLAN afetado;
6. revise e reaprove as TASKS afetadas;
7. retome a implementação somente após os gates necessários.

Não modifique a SPEC retroativamente apenas para justificar código já escrito. Se o código divergir do PLAN ou da SPEC, trate como desvio, interrompa a conclusão, registre o motivo e obtenha decisão humana.

Correções internas que comprovadamente não alterem comportamento contratado podem dispensar uma nova SPEC. Ainda assim, devem ser rastreadas, ter escopo explícito e receber testes proporcionais ao risco. Na dúvida, trate como mudança de comportamento.

### 2.9 Definition of Ready por etapa

#### SPEC pronta para aprovação

- objetivo e problema estão claros;
- escopo e fora do escopo estão explícitos;
- regras e contratos afetados estão identificados;
- critérios de aceite são objetivos e verificáveis;
- não há pergunta bloqueante sem dono ou decisão;
- dependências e riscos relevantes estão registrados.

#### PLAN pronto para aprovação

- referencia uma SPEC aprovada e sua versão;
- foi produzido após inspeção do repositório;
- descreve impactos em dados, API, segurança, testes e integrações;
- não amplia o escopo da SPEC;
- possui riscos, alternativas e ordem de implementação;
- permite derivar tasks sem novas decisões estruturais.

#### TASKS prontas para aprovação

- todas derivam do PLAN aprovado;
- são pequenas, ordenadas e verificáveis;
- possuem dependências e critérios de aceite relacionados;
- incluem testes, migrations e documentação necessários;
- cada task possui limite de escopo e forma de validação;
- a conclusão de todas cobre integralmente o PLAN.

#### Task pronta para iniciar

- está `TODO`;
- suas dependências estão `DONE`;
- o desenvolvedor autorizou sua execução;
- não existe bloqueio conhecido;
- o estado do repositório é compatível com o início da task.

Se qualquer requisito de Ready estiver ausente, o agente deve trabalhar no artefato correspondente ou solicitar decisão, em vez de preencher lacunas por suposição.

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

Ao receber uma solicitação neste repositório, determine primeiro em qual estágio SDD a feature se encontra. Não presuma que a solicitação para “implementar” autoriza ignorar os gates documentais.

### 14.1 Quando o desenvolvedor explicar uma nova feature

1. Leia este arquivo e os documentos normativos aplicáveis.
2. Registre o entendimento da feature sem adicionar comportamento não solicitado.
3. Identifique decisões bloqueantes e perguntas em aberto.
4. Crie ou atualize `docs/specs/<id>-<feature>.md`.
5. Numere os critérios de aceite como `AC-01`, `AC-02` e assim por diante.
6. Apresente a SPEC e pare.
7. Aguarde aprovação explícita antes de inspecionar soluções técnicas ou criar o PLAN.

### 14.2 Quando a SPEC estiver aprovada

1. Confirme status, versão, aprovador e data da SPEC.
2. Inspecione o repositório, o gerenciador de build e os padrões do template.
3. Localize implementações equivalentes antes de propor novas estruturas.
4. Crie ou atualize o PLAN correspondente.
5. Relacione decisões técnicas aos critérios de aceite.
6. Apresente riscos, alternativas e impacto no frontend.
7. Pare e aguarde aprovação explícita do PLAN.

### 14.3 Quando o PLAN estiver aprovado

1. Confirme status, versão, aprovador e data do PLAN.
2. Crie tasks pequenas, ordenadas e verificáveis.
3. Inclua tasks específicas para migrations, segurança, testes e documentação quando aplicável.
4. Relacione cada task aos critérios de aceite e às seções do PLAN.
5. Apresente a lista completa para revisão.
6. Pare e aguarde aprovação explícita das TASKS.

### 14.4 Quando as TASKS estiverem aprovadas

1. Escolha somente a próxima task elegível.
2. Informe o que será alterado e como será validado.
3. Aguarde autorização para iniciar a task.
4. Implemente a menor alteração suficiente.
5. Execute os testes aplicáveis e revise o diff.
6. Atualize evidências e coloque a task em `AWAITING_VALIDATION`.
7. Apresente o resultado sem iniciar a próxima task.
8. Após validação explícita, marque a task como `DONE`.
9. Repita o ciclo até o encerramento da feature.

### 14.5 Validação constante do desenvolvedor

A validação humana é obrigatória nos seguintes pontos:

- aprovação da SPEC;
- aprovação do PLAN;
- aprovação da lista de TASKS;
- autorização para iniciar cada task;
- aceitação ou rejeição do resultado de cada task;
- aprovação de qualquer desvio;
- encerramento da feature.

Caso o desenvolvedor rejeite uma task, mantenha-a em `IN_PROGRESS` ou `BLOCKED`, registre o feedback e corrija somente o que foi solicitado. Não avance para a task seguinte.

### 14.6 O que o agente não deve fazer

- Não inventar campos, enums, rotas, query parameters ou wrappers de resposta.
- Não iniciar PLAN sem SPEC aprovada.
- Não criar TASKS sem PLAN aprovado.
- Não implementar sem TASKS aprovadas e autorização da task atual.
- Não executar automaticamente a próxima task após concluir código.
- Não marcar task como `DONE` sem validação explícita do desenvolvedor.
- Não usar uma aprovação genérica para liberar múltiplos gates.
- Não alterar artefatos aprovados silenciosamente.
- Não renomear `clientName`, `serviceCategory`, `coverImageUrl`, `sortOrder` ou qualquer outro campo por preferência pessoal.
- Não transformar `SiteIndicator.value` em número.
- Não retornar rascunhos nas APIs públicas.
- Não retornar parceiros inativos.
- Não enviar e-mail de contato de forma síncrona contornando a fila Redis definida.
- Não criar relacionamento das novas entidades com `User` sem mudança aprovada.
- Não refatorar o template inteiro para concluir uma task local.
- Não afirmar que a task está pronta sem executar os testes disponíveis.
- Não ocultar testes falhos, limitações, alterações colaterais ou divergências.

### 14.7 Formato esperado ao apresentar uma task para validação

Informe:

```text
Task: TASK-XXX — <título>
Status: AWAITING_VALIDATION

Alterações realizadas:
- ...

Critérios de aceite cobertos:
- AC-XX

Arquivos alterados:
- ...

Testes e verificações:
- comando: ...
- resultado: ...

Migration ou banco:
- nenhuma | descrição

Riscos, desvios ou pendências:
- nenhuma | descrição

Impacto no frontend:
- nenhum | descrição

Ação necessária:
- validar, solicitar ajustes ou rejeitar a task.
```

Não apresente uma task como validada quando os testes não puderam ser executados. Nesse caso, informe precisamente o motivo e mantenha o status apropriado.

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

- atende aos documentos normativos, à SPEC aprovada e a este arquivo;
- possui SPEC, PLAN e TASKS aprovados e coerentes com a implementação;
- todas as tasks obrigatórias estão `DONE` após validação explícita do desenvolvedor;
- cada critério de aceite possui evidência rastreável em testes, verificação manual ou ambos;
- mantém compatibilidade com o frontend ou registra a aprovação da mudança de contrato;
- possui validações de entrada e tratamento de erros adequados;
- aplica autenticação e privilégio corretos;
- usa o handler global de erros;
- não expõe rascunhos, parceiros inativos, contatos ou dados sensíveis indevidamente;
- possui testes automatizados proporcionais ao risco;
- passa no build e nos testes aplicáveis do repositório;
- testes não executados, ignorados ou instáveis estão explicitamente registrados e aceitos;
- inclui migration quando necessária e segue o mecanismo já adotado no projeto;
- migrations foram verificadas quanto a compatibilidade, rollback ou estratégia de recuperação aplicável;
- não introduz dependência, entidade, endpoint ou escopo não aprovado;
- o diff final foi revisado para alterações acidentais, segredos e arquivos não relacionados;
- logs não expõem segredos ou dados pessoais desnecessários;
- divergências ainda abertas e débitos técnicos estão registrados com responsável ou decisão de acompanhamento;
- o relatório final contém comandos, resultados, migrations, desvios e impacto no frontend;
- a documentação do contrato foi atualizada quando uma decisão formal mudou a API;
- o desenvolvedor aprovou o encerramento da feature.

### 18.1 Checklist final de solidez

Antes de solicitar o encerramento, confirme:

```markdown
- [ ] SPEC aprovada e sem perguntas bloqueantes
- [ ] PLAN aprovado e compatível com o repositório
- [ ] TASKS aprovadas, rastreáveis e todas validadas
- [ ] Critérios de aceite integralmente cobertos
- [ ] Build e testes executados com resultados registrados
- [ ] Segurança e autorização revisadas
- [ ] Contrato HTTP e compatibilidade com frontend revisados
- [ ] Migrations e impacto em dados revisados
- [ ] Diff final sem alterações fora do escopo
- [ ] Relatório atualizado
- [ ] Encerramento aprovado pelo desenvolvedor
```

---

**Resumo para agentes:** transforme primeiro a explicação da feature em uma SPEC; pare e aguarde aprovação. Depois produza o PLAN técnico; pare e aguarde aprovação. Em seguida derive as TASKS; pare e aguarde aprovação. Implemente somente uma task autorizada por vez, apresente testes e evidências, aguarde validação do desenvolvedor e só então avance. Preserve o contrato, reutilize o template e nunca resolva lacunas materiais silenciosamente.
