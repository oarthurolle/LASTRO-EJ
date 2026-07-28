import "./ContactBanner.css";

import { Link } from "react-router-dom";

const ContactBanner = () => {
  return (
    <section className="contact-banner">
      <div className="container">
        <div className="contact-banner__content">

          <div className="contact-banner__text">
            <h2 className="contact-banner__title">
              Ainda não sabe qual serviço escolher?
            </h2>

            <p className="contact-banner__description">
              Fale com a gente pelo WhatsApp e conte um pouco do seu
              negócio. Recomendamos o melhor caminho sem compromisso.
            </p>
          </div>

          <div className="contact-banner__buttons">

            <a
              href=""
              target="_blank"
              rel="noopener noreferrer"
              className="contact-banner__button contact-banner__button--primary"
            >
              Falar no WhatsApp
            </a>

            <Link
              to="/sobre-nos"
              className="contact-banner__button contact-banner__button--secondary"
            >
              Conhecer a Lastro
            </Link>

          </div>

        </div>
      </div>
    </section>
  );
};

export default ContactBanner;