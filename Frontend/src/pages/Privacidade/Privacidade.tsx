// src/pages/Privacidade/Privacidade.tsx
import { Link } from "react-router-dom";
import "./Privacidade.css";

interface PolicySection {
  title: string;
  paragraphs: string[];
}

const SECTIONS: PolicySection[] = [
  {
    title: "1. Quem somos",
    paragraphs: [
      "A LASTRO Consultoria e Investimentos é uma empresa júnior vinculada à Universidade do Estado do Rio Grande do Norte (UERN), localizada em Mossoró/RN. Esta política descreve como tratamos os dados pessoais coletados por meio do nosso site institucional, em conformidade com a Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018).",
    ],
  },
  {
    title: "2. Dados que coletamos",
    paragraphs: [
      "Coletamos apenas os dados informados voluntariamente por você no formulário de contato: nome, e-mail, telefone (opcional), assunto e conteúdo da mensagem. Não coletamos ou tratamos dados sensíveis, nem dados além dos necessários para o atendimento da sua solicitação.",
    ],
  },
  {
    title: "3. Finalidade do tratamento",
    paragraphs: [
      "Seus dados são utilizados exclusivamente para responder à sua solicitação de contato e prestar atendimento sobre nossos serviços de consultoria. Os dados não são utilizados para envio de marketing ou comunicação não solicitada.",
    ],
  },
  {
    title: "4. Compartilhamento",
    paragraphs: [
      "Não vendemos, alugamos ou compartilhamos seus dados pessoais com terceiros. Suas mensagens ficam restritas ao acesso administrativo interno da LASTRO, protegido por autenticação e controle de permissões.",
    ],
  },
  {
    title: "5. Armazenamento e segurança",
    paragraphs: [
      "Suas mensagens são armazenadas em ambiente protegido, com acesso restrito a pessoas autorizadas. Adotamos medidas técnicas e organizacionais adequadas para proteger os dados contra acessos não autorizados, perda ou alteração.",
    ],
  },
  {
    title: "6. Seus direitos como titular",
    paragraphs: [
      "Você pode, a qualquer momento, solicitar a confirmação da existência de tratamento, o acesso, a correção ou a eliminação dos seus dados, pelo e-mail lastro.ej@uern.br. Responderemos à sua solicitação no prazo legal.",
    ],
  },
  {
    title: "7. Alterações desta política",
    paragraphs: [
      "Esta política pode ser atualizada periodicamente para refletir mudanças nas práticas de tratamento. A versão mais recente estará sempre disponível nesta página.",
    ],
  },
];

export default function Privacidade() {
  return (
    <div className="privacidade-page container">
      <section className="privacidade__hero">
        <span className="privacidade__eyebrow">Privacidade</span>
        <h1>Política de Privacidade</h1>
        <p>
          Como a LASTRO coleta, usa e protege os dados pessoais enviados pelo
          site, em conformidade com a LGPD.
        </p>
        <span className="privacidade__updated">Última atualização: agosto de 2026</span>
      </section>

      <section className="privacidade__content">
        {SECTIONS.map((section) => (
          <article key={section.title} className="privacidade__section">
            <h2>{section.title}</h2>
            {section.paragraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </article>
        ))}

        <article className="privacidade__section">
          <h2>8. Contato do encarregado</h2>
          <p>
            Dúvidas sobre esta política ou sobre o tratamento de seus dados
            podem ser enviadas para lastro.ej@uern.br ou por meio da nossa{" "}
            <Link to="/contato">página de contato</Link>.
          </p>
        </article>
      </section>
    </div>
  );
}