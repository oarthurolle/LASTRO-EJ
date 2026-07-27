import "./Hero.css";

import heroImage from "../../../../assets/images/Services/imageHero.png";

export default function Hero() {
  return (
    <section className="services-hero">
      <div className="container services-hero__container">

        <div className="services-hero__content">

          <span className="services-hero__subtitle">
            Nossos Serviços
          </span>

          <h1 className="services-hero__title">
            <span>Conhecimento</span>
            <span>econômico que gera</span>
            <span>decisões melhores.</span>
          </h1>

          <p className="services-hero__description">
            Unimos o conhecimento técnico de Ciências Econômicas a um
            atendimento próximo, para transformar diagnóstico em decisão e
            resultado — no ritmo e no orçamento da sua empresa.
          </p>

          <div className="services-hero__buttons">

            <a
              href="/contato"
              className="btn-cta"
            >
              Falar com um consultor
            </a>

            <a
              href="#servicos"
              className="services-hero__link"
            >
              Ver todos os serviços
              <span>↓</span>
            </a>

          </div>

        </div>

        <div className="services-hero__image">
          <img
            src={heroImage}
            alt="Equipe da Lastro em reunião"
          />
        </div>

      </div>
    </section>
  );
}