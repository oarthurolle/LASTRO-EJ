import "./Services.css";
import { Link } from "react-router-dom";
import Button from "../../../common/Button";

import mascot from "../../../../assets/images/Home/mascot.png";
import speechBubble from "../../../../assets/images/Home/speechBalloon.png";

const Services = () => {
  return (
    <section className="services">
      <div className="container">
        <span className="services__subtitle">SERVIÇOS</span>

        <h2 className="services__title">Conheça nossos Serviços</h2>

        <p className="services__description">
          Soluções pensadas para cada etapa
          <br />
          do seu negócio
        </p>

        <div className="services__content">
          <div className="service service--left-top">
            <img
              src={speechBubble}
              alt=""
              className="service__bubble"
            />

            <p className="service__text">
              Pesquisa de Mercado
            </p>
          </div>

          <div className="service service--top">
            <img
              src={speechBubble}
              alt=""
              className="service__bubble"
            />

            <p className="service__text">
              Análise e
              <br />
              acompanhamento de
              <br />
              fluxo de caixa
            </p>
          </div>

          <div className="service service--right-top">
            <img
              src={speechBubble}
              alt=""
              className="service__bubble"
            />

            <p className="service__text">
              Plano de Negócios
            </p>
          </div>

          <div className="service service--left-bottom">
            <img
              src={speechBubble}
              alt=""
              className="service__bubble"
            />

            <p className="service__text">
              Acompanhamento e
              <br />
              planejamento
              <br />
              estratégico
            </p>
          </div>

          <div className="service service--right-bottom">
            <img
              src={speechBubble}
              alt=""
              className="service__bubble"
            />

            <p className="service__text">
              Precificação
            </p>
          </div>

          <img
            src={mascot}
            alt="Mascote Lastro"
            className="services__mascot"
          />
        </div>

       
        <div className="services__button">
            <Link to="/servicos">
              <Button variant="secondary">Saiba Mais</Button>
            </Link>
        </div>
      </div>
    </section>
  );
};

export default Services;