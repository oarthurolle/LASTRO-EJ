import "./History.css";

import SectionTitle from "../../../common/SectionTitle/SectionTitle";

const timeline = [
  {
    title: "2022",
    description:
      "Fundação da Lastro por alunos de Ciências Econômicas da UERN.",
  },
  {
    title: "1º Workshop",
    description:
      'Realização do workshop "Jornada Empreendedora".',
  },
  {
    title: "Primeiros projetos",
    description:
      "Início dos atendimentos e projetos de consultoria para empresas.",
  },
  {
    title: "Atualidade",
    description:
      "Crescimento contínuo, novos parceiros e impacto cada vez maior.",
  },
];

export default function History() {
  return (
    <section className="history">
      <div className="container history__container">
        <div className="history__content">
          <SectionTitle
            subtitle="Nossa História"
            title="Da universidade para o mercado."
            align="left"
          />

          <p>
            A Lastro nasceu da iniciativa de estudantes do curso de Ciências
            Econômicas da UERN, com o propósito de fomentar a vivência
            empreendedora dentro da universidade e aproximar os alunos da
            realidade do mercado.
          </p>

          <p>
            Desde sua fundação, atuamos levando consultoria econômica a empresas
            e empreendedores, promovendo o desenvolvimento socioeconômico por
            meio de soluções estratégicas e da aplicação prática do
            conhecimento adquirido na graduação.
          </p>
        </div>

        <div className="history__timeline">
          {timeline.map((item, index) => (
            <div className="timeline__item" key={index}>
              <span className="timeline__dot"></span>

              <div className="timeline__text">
                <h3>{item.title}</h3>

                <p>{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}