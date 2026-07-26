# LASTRO EJ - Site Institucional

Este é o repositório principal do projeto **LASTRO EJ - Site Institucional**, contendo tanto o **Frontend** quanto o **Backend** da aplicação.

O sistema é responsável por gerenciar e exibir dinamicamente o conteúdo do site institucional da LASTRO EJ, incluindo blog, portfólio de cases de sucesso, parceiros, indicadores da empresa e captação de contatos.

---

## 🏗️ Estrutura do Projeto

O projeto adota uma arquitetura fullstack, dividida em dois subprojetos principais:

- **[Backend](./Backend):** Desenvolvido em Java 21 com Spring Boot 4.0.1. Responsável por expor as APIs REST, gerenciar regras de negócio, conexão com banco de dados PostgreSQL e integração assíncrona com fila Redis.
- **[Frontend](./Frontend):** Desenvolvido em React 19 com TypeScript e Vite. Fornece a interface pública para visitantes e o painel administrativo para gerenciamento de conteúdo.

---

## 🚀 Principais Funcionalidades

A aplicação possui 5 módulos/entidades essenciais:

1. **Blog Institucional:** Gestão completa (CRUD) de postagens com suporte a rascunhos e publicação, além de listagem paginada no frontend.
2. **Cases de Sucesso:** Listagem de portfólio estruturada em *Problema -> Solução -> Resultado*.
3. **Parceiros:** Carrossel dinâmico e ordenável de clientes ou parceiros ativos.
4. **Indicadores:** Dados dinâmicos sobre a empresa (Ex: "35+", "92%") exibidos na home page.
5. **Contato:** Formulário de captação de leads com proteção anti-spam. Os contatos são processados em fila (Redis) para disparo seguro de e-mails.

---

## 💻 Tecnologias Utilizadas

### Backend
- **Linguagem:** Java 21
- **Framework:** Spring Boot 4.0.1
- **Banco de Dados:** PostgreSQL (com migrações Flyway)
- **Fila/Cache:** Redis
- **Segurança:** Autenticação via JWT com controle baseado em Roles (RBAC)

### Frontend
- **Framework:** React 19 + TypeScript
- **Build Tool:** Vite
- **Ícones:** Lucide React e React Icons
- **Componentes Visuais:** Embla Carousel para sliders dinâmicos

---

## 🛠️ Como Executar o Projeto Localmente

### Pré-requisitos
Certifique-se de ter os seguintes componentes instalados:
- [Node.js e npm](https://nodejs.org/) (para o Frontend)
- [Java 21 / JDK 21](https://adoptium.net/) (para o Backend)
- PostgreSQL e Redis rodando localmente (você também pode utilizar Docker se configurado)

### 1. Inicializando o Backend
Navegue até a pasta `Backend` e execute o servidor Spring Boot:
```bash
cd Backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```
A API estará disponível por padrão em `http://localhost:8080`. (A documentação Swagger geralmente pode ser acessada em `http://localhost:8080/swagger-ui.html`)

### 2. Inicializando o Frontend
Navegue até a pasta `Frontend`, instale as dependências e inicie o ambiente de desenvolvimento:
```bash
cd Frontend
npm install
npm run dev
```
A interface gráfica estará acessível em `http://localhost:5173`.

---

## 🔒 Segurança e Painel Administrativo

As ações administrativas (Painel Admin) exigem autenticação baseada em token (JWT) enviado no header `Authorization: Bearer <TOKEN>`.
Usuários com perfil `ADMIN` possuem privilégios específicos geridos pela API:
- `PRIV_BLOG_ADMIN`, `PRIV_CASES_ADMIN`, `PRIV_PARTNERS_ADMIN`, `PRIV_INDICATORS_ADMIN`: Controle sobre criação, edição e ativação de conteúdo.
- `PRIV_CONTACTS_VIEW`: Visualização de mensagens recebidas pelo site.

---

## 📝 Metodologia de Desenvolvimento (SDD)

O desenvolvimento deste repositório segue a metodologia **Spec-Driven Development (SDD)**. 
Novas implementações, especialmente no backend, dependem de documentações e especificações pré-aprovadas.

Consulte a pasta `Backend/docs/` e o arquivo `Backend/AGENTS.md` para entender as diretrizes de contratos de API e relatórios de progresso antes de propor alterações críticas na comunicação.

---
**LASTRO EJ** - Desenvolvendo soluções com excelência e qualidade institucional.
