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
              href="https://wa.me/5584996007110?text=Ol%C3%A1!%20Conheci%20os%20servi%C3%A7os%20da%20Lastro%20pelo%20site%20e%20gostaria%20de%20falar%20com%20um%20consultor."
              target="_blank"
              rel="noopener noreferrer"
              className="contact-banner__button contact-banner__button--primary"
            >
              Falar no WhatsApp
            </a>

            <Link
              to="/sobre"
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