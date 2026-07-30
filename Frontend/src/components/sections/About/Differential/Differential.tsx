import "./Differential.css";

import SectionTitle from "../../../common/SectionTitle/SectionTitle";

import baseAcademica from "../../../../assets/images/About/BaseAcademica.png";
import atendimento from "../../../../assets/images/About/Atendimento.png";
import resultados from "../../../../assets/images/About/Resultados.png";
import impacto from "../../../../assets/images/About/Impacto.png";

const differentials = [
  {
    image: baseAcademica,
    title: "Base acadêmica sólida",
    description:
      "Soluções fundamentadas no conhecimento das Ciências Econômicas da UERN.",
  },
  {
    image: atendimento,
    title: "Atendimento personalizado",
    description:
      "Projetos desenvolvidos de acordo com a realidade e os desafios de cada cliente.",
  },
  {
    image: resultados,
    title: "Foco em resultados",
    description:
      "Decisões orientadas por dados, análise econômica e estratégia sob medida.",
  },
  {
    image: impacto,
    title: "Impacto regional",
    description:
      "Atuamos para fortalecer empresas e impulsionar o desenvolvimento do Rio Grande do Norte.",
  },
];

export default function Differential() {
  return (
    <section className="differential">
      <div className="container">

        <SectionTitle
          subtitle="Nosso Diferencial"
          title="Por que escolher a Lastro?"
          align="left"
        />

        <div className="differential__grid">

          {differentials.map((item) => (
            <article
              className="differential__card"
              key={item.title}
            >
              <img
                src={item.image}
                alt={item.title}
              />

              <h3>{item.title}</h3>

              <p>{item.description}</p>
            </article>
          ))}

        </div>

      </div>
    </section>
  );
}