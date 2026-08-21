#!/usr/bin/env bash
set -u
BASE=http://localhost:8080
AUTH="Authorization: Bearer $1"
CT="Content-Type: application/json"
H1="Accept: application/json"

post() { curl -s -m 15 -o /dev/null -w "%{http_code}" -X POST "$BASE$2" -H "$AUTH" -H "$CT" -H "$H1" -d "$3"; }
post_pub() { curl -s -m 15 -o /dev/null -w "%{http_code}" -X POST "$BASE$2" -H "$CT" -H "$H1" -d "$3"; }

echo "== Partners =="
for n in EmpresaAlpha BetaCorp GammaTech DeltaSolucoes EpsilonCo ZetaSoft; do
  c=$(post "" /api/admin/partners "{\"name\":\"$n\",\"logoUrl\":\"https://dummyimage.com/240x80/333333/ffffff&text=$n\",\"externalLink\":\"https://$n.com.br\",\"sortOrder\":$((RANDOM % 50)),\"active\":true}")
  echo "  $n -> $c"
done
# um partner inativo
c=$(post "" /api/admin/partners "{\"name\":\"ParceiroOculto\",\"logoUrl\":\"https://dummyimage.com/240x80/333333/ffffff&text=Oculto\",\"sortOrder\":99,\"active\":false}")
echo "  ParceiroOculto(inativo) -> $c"

echo "== Indicators =="
post "" /api/admin/indicators '{"name":"Projetos Realizados","value":"42","description":"projetos entregues com orgulho"}' > /dev/null
post "" /api/admin/indicators '{"name":"Cliente NPS","value":"92%","description":"recomendam a LASTRO"}' > /dev/null
post "" /api/admin/indicators '{"name":"Estados atendidos","value":"35+","description":"presença nacional"}' > /dev/null
post "" /api/admin/indicators '{"name":"Alunos impactados","value":"1.5K","description":"treinamentos e workshops"}' > /dev/null
echo "  indicadores -> ok"

echo "== Cases (PUBLISHED x3, DRAFT x1) =="
post "" /api/admin/cases '{"clientName":"Indústria Norte Ltda","serviceCategory":"Desenvolvimento de Software","problem":"Processo de PCP manual, retrabalho e perda de dados entre setores.","solution":"Implementamos um ERP sob medida para controle de pedidos, estoque e produção, com treinamento da equipe.","result":"Redução de 37% no tempo de apontamento e zero perda de dados no primeiro ano.","coverImageUrl":"https://dummyimage.com/1280x720/1f3a5f/ffffff&text=case-norte","testimonial":"\"A LASTRO mudou nossa operação: hoje tudo está integrado.\" — Diretor Industrial","projectDate":"2025-03-10","status":"PUBLISHED"}'
post "" /api/admin/cases '{"clientName":"Varejo Maré","serviceCategory":"Desenvolvimento Web","problem":"Site institucional desatualizado e sem presença digital que gerasse leads.","solution":"Criamos o novo portal com CMS próprio, blog e integração com formulário de contato.","result":"Triplicou o volume de leads qualificados em 90 dias.","coverImageUrl":"https://dummyimage.com/1280x720/1f3a5f/ffffff&text=case-mare","testimonial":"Lead vieram no primeiro mês.","projectDate":"2025-06-20","status":"PUBLISHED"}'
post "" /api/admin/cases '{"clientName":"Cooperativa Agromil","serviceCategory":"Automação","problem":"Leitura de medidores manual e sujeita a erro humano.","solution":"Sistema de coleta móvel integrado ao banco central com sincronização offline.","result":"Eliminação de erros de digitação e auditoria em tempo real.","coverImageUrl":"https://dummyimage.com/1280x720/1f3a5f/ffffff&text=case-agromil","status":"PUBLISHED"}'
post "" /api/admin/cases '{"clientName":"Rascunho Sigilo","serviceCategory":"Consultoria","problem":"problema x","solution":"solucao y","result":"resultado z","status":"DRAFT"}'
echo "  cases -> ok"

echo "== Posts (PUBLISHED x4, DRAFT x1) =="
post "" /api/admin/posts '{"title":"Como a automação reduz custos nas indústrias","summary":"Um panorama prático de onde começar a automatizar processos e medir ganhos reais.","content":"<h2>Introdução</h2><p>Automatizar não é substituir pessoas, é eliminar retrabalho.</p><h3>Onde começar</h3><ul><li>Priorize tarefas repetitivas;</li><li>Defina métricas antes;</li><li>Trabalhe em pequenas entregas.</li></ul>","coverImageUrl":"https://dummyimage.com/1280x720/2d6a4f/ffffff&text=blog-automacao","category":"Automação","status":"PUBLISHED"}'
post "" /api/admin/posts '{"title":"Sites institucionais que vendem: o que mudou","summary":"Como um portal bem estruturado virou o principal canal de captação de clientes.","content":"<p>Um site institucional moderno precisa de conteúdo, performance e conversão.</p>","coverImageUrl":"https://dummyimage.com/1280x720/2d6a4f/ffffff&text=blog-sites","category":"Tecnologia","status":"PUBLISHED"}'
post "" /api/admin/posts '{"title":"Gestão de projetos no caos: metodologias leves","summary":"Scrum, Kanban e o que realmente importa em times pequenos.","content":"<p>Metodologia só existe para servir o time.</p>","coverImageUrl":"https://dummyimage.com/1280x720/2d6a4f/ffffff&text=blog-gestao","category":"Gestão","status":"PUBLISHED"}'
post "" /api/admin/posts '{"title":"Por que toda empresa precisa de dados confiáveis","summary":"Fundamentos de qualidade de dados para decisões melhores.","content":"<p>Dado bom é dado limpo, rastreável e acessível.</p>","category":"Mercado","status":"PUBLISHED"}'
post "" /api/admin/posts '{"title":"Rascunho interno: ideias de conteúdo","summary":"Anotações parciais ainda não publicadas.","content":"<p>esboço</p>","status":"DRAFT"}'
echo "  posts -> ok"

echo "== Contact (3 mensagens; anti-spam pode limitar) =="
post_pub "" /api/public/contact '{"name":"Carlos Eduardo","email":"carlos.leads@gmail.com","phone":"84988887777","subject":"Solicitação de Orçamento de Software","message":"Tenho interesse no desenvolvimento de um ERP interno para minha empresa."}'
post_pub "" /api/public/contact '{"name":"Marina Souza","email":"marina@lojaexemplo.com","subject":"Site institucional","message":"Quero renovar o site da minha loja antes do fim do ano."}'
post_pub "" /api/public/contact '{"name":"João Pedro","email":"joao@comercio.com","subject":"Automação de processo","message":"Gostaria de entender como vocês automatizam logística."}'
echo "  contatos -> ok"