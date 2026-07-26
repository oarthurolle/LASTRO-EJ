# Spec: Formulário de Contato (005-contact)

Status: DRAFT
Responsável: Equipe Backend
Última atualização: 2026-07-26

## Objetivo
Captar leads do formulário de contato, persistir as mensagens e encaminhá-las por e-mail via fila assíncrona.

## Escopo
- Endpoint público para recebimento de mensagens de contato.
- Endpoint administrativo de leitura de contatos recebidos.
- Envio assíncrono de e-mail via Redis.
- Mecanismo de proteção contra spam.

## Itens fora do Escopo
- Resposta ou edição de mensagens via painel admin.
- Integração direta com CRM, WhatsApp ou MailChimp.

## Regras de Negócio
- Receber `name`, `email`, `subject`, `message` (obrigatórios) e `phone` (opcional).
- O campo `address` (citado apenas na análise de requisitos) não deve ser aceito.
- A requisição pública só processa o contato se houver validação anti-spam bem-sucedida.
- Mensagem deve ser enviada para `lastro.ej@uern.br` através do Redis.
- Em caso de sucesso de aceite para fila, retornar status 202 (Accepted).
- Leituras administrativas exigem JWT + `PRIV_CONTACTS_VIEW`.

## Contratos HTTP Afetados
- `POST /api/public/contact`
- `GET /api/admin/contacts`

## Perguntas em Aberto (Divergências identificadas)
- Especificar qual o provedor e formato de token/anti-spam a ser utilizado (hCaptcha, reCAPTCHA, etc.).

## Critérios de Aceite
- [ ] Contato é persistido com sucesso e retorna 202.
- [ ] Mensagem aciona publicação na fila do Redis.
- [ ] Request com formato de e-mail inválido retorna Erro Global do sistema (400).
- [ ] O sistema rejeita requests sem token válido de anti-spam.
- [ ] O administrador pode visualizar os contatos possuindo a permissão `PRIV_CONTACTS_VIEW`.
- [ ] Mensagens de contato nunca são listadas sem autenticação.
