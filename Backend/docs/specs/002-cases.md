# Spec: Cases de Sucesso (002-cases)

Status: DRAFT
Responsável: Equipe Backend
Última atualização: 2026-07-26

## Objetivo
Gerenciar a exibição de cases de sucesso (projetos realizados) no site da LASTRO.

## Escopo
- CRUD administrativo e leitura pública de cases.
- Exposição nos formatos Problema -> Solução -> Resultado.

## Itens fora do Escopo
- Filtros avançados de cases.
- Upload de imagens.

## Regras de Negócio
- A API pública deve expor somente cases publicados (`PUBLISHED`).
- Formato obrigatório: problema, solução e resultado.
- Status permitidos: apenas `DRAFT` ou `PUBLISHED`.
- Endpoints administrativos exigem JWT + `PRIV_CASES_ADMIN`.

## Contratos HTTP Afetados
- `GET /api/public/cases`
- `GET /api/public/cases/{id}`
- `POST /api/admin/cases`
- (Outros métodos do CRUD administrativo)

## Perguntas em Aberto (Divergências identificadas)
- Criação de case sem campo `result`: O contrato omite o campo no payload de criação, mas a entidade exige.

## Critérios de Aceite
- [ ] Case publicado é listado corretamente em `/api/public/cases`.
- [ ] Rascunhos não são acessíveis publicamente.
- [ ] Acessar `/api/public/cases/{id}` inexistente retorna 404.
- [ ] O CRUD administrativo exige o privilégio `PRIV_CASES_ADMIN`.
