# LASTRO EJ - Site Institucional (Frontend)

Este é o repositório frontend para o site institucional da LASTRO EJ. Ele consome a API do Backend Spring Boot e fornece a interface pública e administrativa para os recursos do site.

## Stack Tecnológica
- **Framework:** React 19 + TypeScript
- **Build Tool:** Vite
- **Ícones e UI:** Lucide React e React Icons
- **Carrossel:** Embla Carousel
- **Linter:** ESLint

## Funcionalidades e Telas
A aplicação front-end consome os endpoints estipulados no contrato global e abrange:
1. **Home Dinâmica:** Exibição do carrossel de Parceiros, listagem de Indicadores da empresa e formulário de Contato com proteção anti-spam.
2. **Cases de Sucesso:** Listagem de portfólio no formato *Problema -> Solução -> Resultado*.
3. **Blog Institucional:** Leitura de postagens completas e listagem paginada consumida por *slug*.
4. **Painel Administrativo:** (Para os usuários autenticados com token JWT e privilégios específicos)
   - Criação, edição e publicação de postagens do Blog (`PRIV_BLOG_ADMIN`).
   - Gestão de Cases de Sucesso (`PRIV_CASES_ADMIN`).
   - Gestão da ordem (`sortOrder`) e visibilidade (`active`) de Parceiros (`PRIV_PARTNERS_ADMIN`).
   - Atualização de valores dos Indicadores (`PRIV_INDICATORS_ADMIN`).
   - Visualização da caixa de leads do Contato (`PRIV_CONTACTS_VIEW`).

## Como Executar Localmente

### Pré-requisitos
- Node.js
- Gerenciador de pacotes npm
- Backend rodando localmente (normalmente em `http://localhost:8080`)

### Instalação de Dependências
```bash
npm install
```

### Execução em Desenvolvimento
```bash
npm run dev
```

O comando acima iniciará o servidor Vite, geralmente na porta `5173`.

### Build para Produção
```bash
npm run build
```

## Integração com a API (Backend)
O frontend espera que a API backend (Spring Boot) obedeça rigorosamente aos contratos definidos nos documentos normativos:
- **Rotas Públicas** (`/api/public/*`): Não necessitam de token. Trazem os dados já filtrados e ordenados.
- **Rotas Administrativas** (`/api/admin/*`): Exigem o token no header `Authorization: Bearer <TOKEN>`.
- Todos os JSONs transitam em `camelCase`.
- Retornos de erro seguem o padrão global definido pelo backend, contendo `timestamp`, `status`, `error`, `message` e `path`.

## Metodologia de Desenvolvimento
O desenvolvimento de novas features e integrações no frontend deve ser precedido por alinhamento e leitura atenta dos requisitos da API (conforme documentado na pasta do Backend).
- **Não assuma comportamentos não documentados**. 
- Qualquer mudança em payloads, obrigatoriedade de campos ou nomes de variáveis que afete a comunicação deve ser formalizada.

---
**Nota para Desenvolvedores e Agentes:** Sempre verifique a comunicação com os endpoints listados e a especificação de domínio do projeto antes de alterar estados de componentes que trafegam informações para a API.
