import "./Footer.css";

import { Link } from "react-router-dom";
import { FaInstagram, FaLinkedin } from "react-icons/fa";
import logo from "../../../assets/logos/logoWhite.png";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container footer__container">

        {/*  Marca e Redes Sociais */}

        <div className="footer__brand">

          <div className="footer__brand-header">

            <img
              src={logo}
              alt="Logo Lastro"
              className="footer__logo"
            />

            <h2 className="footer__nameLastro">
              LASTRO
            </h2>

          </div>

          <p className="footer__description">
            Consultoria e investimentos com
            <br />
            método — empresa júnior
            <br />
            vinculada à UERN.
          </p>

            <div className="footer__social">

                <a
                    href="https://www.instagram.com/lastro.ej/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram da Lastro"
                    className="footer__social-link"
                >
                    <FaInstagram />
                </a>

                <a
                    href="https://www.linkedin.com/company/lastro-consultoria-e-investimentos/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="LinkedIn da Lastro"
                    className="footer__social-link"
                >
                    <FaLinkedin />
</a>
        </div>
        </div>

        {/* Navegação */}

        <div className="footer__column">

          <h3>NAVEGAÇÃO</h3>

          <ul>

            <li>
              <Link to="/">Início</Link>
            </li>

            <li>
              <Link to="/sobre-nos">Sobre Nós</Link>
            </li>

            <li>
              <Link to="/servicos">Serviços</Link>
            </li>

            <li>
              <Link to="/cases">Cases</Link>
            </li>

          </ul>

        </div>

        {/* Institucional */}

        <div className="footer__column">

          <h3>INSTITUCIONAL</h3>

          <ul>

            <li>
              <Link to="/blog">Blog</Link>
            </li>

            <li>
              <Link to="/contato">Contato</Link>
            </li>

            <li>
              <Link to="/privacidade">
                Política de Privacidade
              </Link>
            </li>

          </ul>

        </div>

        {/* Contato */}

        <div className="footer__column">

          <h3>CONTATO</h3>

          <ul>

            <li>lastro.ej@uern.br</li>

            <li>(84) 99460-7110</li>

            <li>Mossoró, RN</li>

          </ul>

        </div>

      </div>

      {/* Rodapé */}

      <div className="container">

        <div className="footer__bottom">

          <p>
            © 2026 LASTRO Consultoria & Investimentos —
            Empresa Júnior UERN
          </p>

          <Link to="/privacidade">
            Política de Privacidade
          </Link>

        </div>

      </div>

    </footer>
  );
};

export default Footer;