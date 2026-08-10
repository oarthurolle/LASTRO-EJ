# LASTRO EJ — Frontend

Aplicação web institucional e painel administrativo da LASTRO EJ. O frontend
consome a API Spring Boot disponível no diretório `../Backend` e apresenta
interfaces diferentes conforme os cargos e privilégios do usuário autenticado.

## Tecnologias

- React 19
- TypeScript 6
- Vite 8
- ESLint
- Embla Carousel
- Lucide React e React Icons

## Estado atual

| Área | Situação |
|---|---|
| Home institucional | Implementada |
| Parceiros da home | Integrados à API pública |
| Blog público | Listagem e leitura por slug implementadas |
| Autenticação administrativa | Login JWT, renovação de sessão, MFA e solicitação de cadastro |
| Painel de blog | CRUD e publicação integrados à API |
| Painel de parceiros | CRUD integrado à API |
| Upload de imagens | Capas do blog e logos de parceiros enviadas pelo painel |
| Painel de indicadores | CRUD integrado à API pública da home |
| Gestão da equipe | Aprovação, reprovação, exclusão e alteração de cargo para a diretoria |
| Cases, contatos e informações da empresa | Sinalizados na interface como indisponíveis |
| Sobre, serviços, cases, contato e privacidade | Páginas temporárias de funcionalidade indisponível |

O cadastro público cria uma solicitação com o cargo `BASIC` e estado `PENDING`.
O usuário somente consegue entrar depois da aprovação de uma conta
`DIRECTOR`. A confirmação imediata de e-mail está desabilitada no fluxo atual.

## Pré-requisitos

- Node.js compatível com o Vite 8
- npm
- Backend disponível, por padrão, em `http://localhost:8080`

## Configuração

Crie o arquivo local de ambiente a partir do exemplo:

```powershell
Copy-Item .env.example .env
```

Variável disponível:

| Variável | Uso |
|---|---|
| `VITE_API_URL` | Origem do backend, sem barra final |

Durante o desenvolvimento, mantenha `VITE_API_URL` vazio. O Vite encaminha
automaticamente `/api`, `/auth`, `/mfa` e `/refresh` para
`http://localhost:8080`.

Em produção, configure a origem completa:

```dotenv
VITE_API_URL=https://api.exemplo.com
```

Variáveis do Vite são incorporadas durante o build. Portanto, alterá-las depois
de gerar `dist/` não modifica os arquivos já compilados.

## Execução local

Dentro do diretório `Frontend`:

```powershell
npm ci
npm run dev
```

A aplicação ficará disponível normalmente em
`http://localhost:5173`.

Comandos úteis:

```powershell
npm run lint
npm run build
npm run preview
```

O build de produção é gerado em `dist/`.

## Rotas

| Rota | Descrição |
|---|---|
| `/` | Home institucional |
| `/blog` | Listagem pública do blog |
| `/blog/{slug}` | Leitura de uma publicação |
| `/admin` | Login, solicitação de cadastro e painel administrativo |

A aplicação resolve as rotas pelo caminho atual do navegador. Ao publicar o
conteúdo de `dist/`, configure o servidor para devolver `index.html` também nos
acessos diretos a `/blog/*` e `/admin/*`.

## Integração e controle de acesso

As páginas públicas consultam:

- `GET /api/public/posts`
- `GET /api/public/posts/{slug}`
- `GET /api/public/partners`

O painel usa os endpoints protegidos de autenticação, blog, parceiros e gestão
de usuários. Requisições protegidas enviam
`Authorization: Bearer <access-token>`.

Nos formulários de blog e parceiros, o painel aceita JPEG, PNG e WebP de até
5 MB. O arquivo é enviado como `multipart/form-data`; a URL devolvida pelo
backend é inserida no mesmo campo utilizado pelos CRUDs existentes. A entrada
manual de URL continua disponível como alternativa.

O menu administrativo é filtrado pelos privilégios devolvidos por `/auth/me`.
Entre os privilégios reconhecidos estão:

- `PRIV_BLOG_ADMIN`
- `PRIV_PARTNERS_ADMIN`
- `PRIV_CASES_ADMIN`
- `PRIV_INDICATORS_ADMIN`
- `PRIV_CONTACTS_VIEW`
- `PRIV_COMPANY_INFO_ADMIN`
- `PRIV_USER_MANAGEMENT`

Contas `ADMIN` recebem as áreas administrativas compatíveis com seus
privilégios. Contas `DIRECTOR` também acessam a gestão da equipe.

Os tokens da sessão são mantidos em `sessionStorage`; fechar a sessão do
navegador remove esse estado local. Em respostas `401`, o frontend tenta renovar
o acesso com o refresh token quando aplicável.

## Segurança do conteúdo do blog

O conteúdo do blog é HTML. Antes de exibi-lo, o frontend remove elementos,
atributos e URLs potencialmente perigosos. O editor administrativo também
sanitiza o conteúdo, e a aplicação possui uma política CSP como camada
adicional.

Essa proteção deve ser preservada. Nunca renderize o campo `content` diretamente
com `innerHTML` ou `dangerouslySetInnerHTML` sem passar pelo sanitizador
compartilhado em `src/utils/sanitizeHtml.ts`.

## Estrutura principal

```text
src/
├── auth/                  # sessão, chamadas HTTP e tipos de autenticação
├── components/            # componentes comuns e seções da home
├── pages/
│   ├── Admin/             # painel e gerenciadores administrativos
│   ├── Auth/              # login e solicitação de cadastro
│   ├── Blog/              # blog público
│   ├── Home/              # página inicial
│   └── Unavailable/       # páginas ainda não implementadas
├── styles/                # estilos e variáveis globais
└── utils/                 # utilitários compartilhados
```

## Antes de enviar alterações

Execute:

```powershell
npm run lint
npm run build
```

Não adicione dados fictícios para preencher telas vazias. A aplicação deve
exibir o estado vazio ou o aviso de funcionalidade indisponível até existir uma
integração real.
