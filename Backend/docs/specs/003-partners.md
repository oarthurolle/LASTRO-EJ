# Spec: Parceiros (003-partners)

Status: DRAFT
Responsável: Equipe Backend
Última atualização: 2026-07-26

## Objetivo
Gerenciar a exibição de parceiros ou clientes no carrossel da home page.

## Escopo
- CRUD administrativo e leitura pública de parceiros.
- Ordenação e filtro de visibilidade (ativos/inativos).

## Itens fora do Escopo
- Upload de logos.

## Regras de Negócio
- A API pública retorna apenas parceiros com `active=true`.
- A resposta pública deve estar ordenada por `sortOrder` crescente.
- O campo `active` permite inativar parceiros sem excluí-los do banco de dados.
- Endpoints administrativos exigem JWT + `PRIV_PARTNERS_ADMIN`.

## Contratos HTTP Afetados
- `GET /api/public/partners`
- `POST /api/admin/partners` (e restante do CRUD)

## Perguntas em Aberto (Divergências identificadas)
- Confirmação dos payloads de listagem/detalhes e atualização para o CRUD administrativo.

## Critérios de Aceite
- [ ] Apenas parceiros ativos são retornados publicamente.
- [ ] A listagem pública é ordenada por `sortOrder` crescente.
- [ ] Link externo é opcional na criação.
- [ ] O CRUD administrativo exige o privilégio `PRIV_PARTNERS_ADMIN`.
