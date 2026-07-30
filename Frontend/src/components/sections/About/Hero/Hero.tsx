import "./Hero.css";

import heroImage from "../../../../assets/images/About/equipeLastro.png";

export default function Hero() {
  return (
    <section className="about-hero">
      <div className="about-hero__container">

        <div className="about-hero__content">

          <span className="about-hero__subtitle">
            QUEM SOMOS
          </span>

          <h1 className="about-hero__title">
            Conhecimento econômico que gera decisões melhores.
          </h1>

          <p className="about-hero__description">
            A Lastro Consultoria & Investimentos é uma empresa júnior fundada
            em 2022 por estudantes do curso de Ciências Econômicas da
            Universidade do Estado do Rio Grande do Norte (UERN).
          </p>

          <p className="about-hero__description">
            Transformamos teoria em soluções práticas para empresas de todos os
            segmentos, promovendo inovação, crescimento e impacto positivo por
            meio da consultoria econômica.
          </p>

        </div>

        <div className="about-hero__image">

          <img
            src={heroImage}
            alt="Equipe da Lastro reunida."
          />

        </div>

      </div>
    </section>
  );
}