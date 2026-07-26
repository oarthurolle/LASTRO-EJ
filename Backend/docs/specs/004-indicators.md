# Spec: Indicadores (004-indicators)

Status: DRAFT
Responsável: Equipe Backend
Última atualização: 2026-07-26

## Objetivo
Gerenciar os indicadores institucionais dinâmicos exibidos na home do site.

## Escopo
- Leitura pública e atualização administrativa de indicadores.

## Itens fora do Escopo
- Integrações automáticas para cálculo de NPS, projetos, etc.

## Regras de Negócio
- O valor (`value`) é armazenado e trafegado como string para suportar caracteres como `%` e `+`.
- A atualização deve registrar a hora em `updatedAt`.
- Endpoints administrativos exigem JWT + `PRIV_INDICATORS_ADMIN`.

## Contratos HTTP Afetados
- `GET /api/public/indicators`
- `PUT /api/admin/indicators/{id}`
- (E métodos adicionais do CRUD administrativo)

## Critérios de Aceite
- [ ] Indicadores podem ser lidos via `/api/public/indicators`.
- [ ] O valor de um indicador aceita e preserva caracteres especiais como `%` e `+`.
- [ ] Atualizar um indicador modifica o campo `updatedAt`.
- [ ] Atualização exige o privilégio `PRIV_INDICATORS_ADMIN`.
