import "./Essence.css";

import SectionTitle from "../../../common/SectionTitle/SectionTitle";

const values = [
  "Ética",
  "Compromisso",
  "Excelência",
  "Transparência",
  "Trabalho em equipe",
  "Responsabilidade social",
];

export default function Essence() {
  return (
    <section className="essence">
      <div className="container">

        <SectionTitle
          subtitle="Nossa Essência"
          title="Missão, Visão e Valores"
          align="left"
        />

        <div className="essence__grid">

          <article className="essence__card">
            <h3>Missão</h3>

            <p>
              Auxiliar no desenvolvimento socioeconômico através da aplicação do
              conhecimento econômico, promovendo soluções estratégicas para
              clientes e impulsionando a formação dos nossos membros.
            </p>
          </article>

          <article className="essence__card">
            <h3>Visão</h3>

            <p>
              Ser referência em consultoria econômica júnior no Rio Grande do
              Norte, reconhecida pela qualidade e impacto das soluções que
              geramos para nossos clientes e na sociedade.
            </p>
          </article>

          <article className="essence__card">
            <h3>Valores</h3>

            <ul className="essence__values">
              {values.map((value) => (
                <li key={value}>
                  <span>→</span>
                  {value}
                </li>
              ))}
            </ul>

          </article>

        </div>

      </div>
    </section>
  );
}