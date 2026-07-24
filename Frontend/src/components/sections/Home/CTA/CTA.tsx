import "./CTA.css";

import wave from "./../../../../assets/images/wave.png";
import skyline from "./../../../../assets/images/skyline.png";
import logo from "./../../../../assets/logos/logoWhite.png";
import marca from "./../../../../assets/logos/logoName.png";

const CTA = () => {
  return (
    <section  id="cta" className="cta">

      <img src={wave} alt="" className="cta-wave" />

      <div className="container">

        <span className="cta-tag">
          VAMOS CONVERSAR
        </span>

        <h2 className="cta-title">
          Marque uma reunião conosco e
          <br />
          obtenha seu orçamento
        </h2>

        <p className="cta-description">
          Conte um pouco sobre o seu negócio —
          respondemos rápido pelos canais abaixo.
        </p>

        <div className="cta-cards">

          <div className="cta-card">
            <span>E-MAIL</span>

            <a href="mailto:lastro.ej@uern.br">
              lastro.ej@uern.br
            </a>
          </div>

          <div className="cta-card">
            <span>TELEFONE</span>

            <a href="tel:+5584994607110">
              (84) 99460-7110
            </a>
          </div>

        </div>

        <div className="cta-brand">
            <img
                src={logo}
                alt="Símbolo Lastro"
                className="cta-logo"
            />

            <img
                src={marca}
                alt="Lastro Consultoria"
                className="cta-marca"
            />
        </div>
      </div>

      <img src={skyline} alt="" className="cta-city" />

    </section>
  );
};

export default CTA;