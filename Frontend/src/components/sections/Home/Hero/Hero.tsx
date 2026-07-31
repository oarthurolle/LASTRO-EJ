import "./Hero.css";

import { useNavigate } from "react-router-dom";

import Button from "../../../common/Button";

import logoHero from "../../../../assets/logos/logoWhite.png";

import decorativeImage from "../../../../assets/images/Home/decorativeRipples.png";

export default function Hero() {
  const navigate = useNavigate();
  return (
    <section className="hero">
      <div className="container hero__container">
        <div className="hero__content">
          <span className="hero__subtitle">
            Empresa Júnior - UERN
          </span>

          <h1 className="hero__title">
            O <span className="hero__highlight">LASTRO</span> que sustenta as decisões financeiras do seu negócio.
          </h1>

          <p className="hero__description">
            Consultoria e investimentos com método: diagnóstico,
            planejamento e acompanhamento para transformar dados
            em decisões estratégicas.
          </p>

          <div className="hero__buttons">
            <Button onClick={() => navigate("/contato")}>
              Marcar reunião
            </Button>

            <Button
              variant="secondary"
              onClick={() => navigate("/servicos")}
            >
              Conheça nossos serviços
            </Button>
          </div>
        </div>

        <div className="hero__image">
          <img
            src={logoHero}
            alt="Logo da Lastro"
          />
        </div>
      </div>
      <div className="hero__decorative">
        <img
          src={decorativeImage}
          alt=""
          aria-hidden="true"
        />
      </div>
    </section>
  );
}