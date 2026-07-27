import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer id="contato">
      <div className="wrap">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="logo">
              <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
                <circle cx="17" cy="17" r="17" fill="#241f5e" />
                <path d="M9 21L14 15L18 18L25 9" stroke="#5470ff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M20 9H25V14" stroke="#5470ff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="logo-text">
                <strong>LASTRO</strong>
                <span>Consultoria & Investimentos</span>
              </span>
            </Link>
            <p>Conhecimento econômico que impulsiona negócios e transforma realidades.</p>
            <div className="social-icons">
              <a href="#" aria-label="Instagram">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" /></svg>
              </a>
              <a href="#" aria-label="LinkedIn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4V8h4v2a6 6 0 0 1 2-2z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></svg>
              </a>
            </div>
          </div>

          <div className="footer-col">
            <h5>Navegação</h5>
            <ul>
              <li><Link to="/">Início</Link></li>
              <li><Link to="/sobre">Sobre nós</Link></li>
              <li><Link to="/servicos">Serviços</Link></li>
              <li><Link to="/cases">Cases</Link></li>
              <li><Link to="/blog">Blog</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h5>Institucional</h5>
            <ul>
              <li><Link to="/sobre">Missão</Link></li>
              <li><Link to="/sobre">Visão</Link></li>
              <li><Link to="/sobre">Valores</Link></li>
              <li><a href="#">Política de privacidade</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h5>Contato</h5>
            <ul>
              <li className="contact-item">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2h-1.3a1 1 0 0 0-.8.4l-2 2.7a1 1 0 0 1-1.6 0c-4.6-1.2-8.2-4.8-9.4-9.4a1 1 0 0 1 0-1.6l2.7-2a1 1 0 0 0 .4-.8V5a2 2 0 0 1 2-2" /></svg>
                (84) 99800-9936
              </li>
              <li className="contact-item">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" /></svg>
                @lastro.ej
              </li>
              <li className="contact-item">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
                Mossoró, RN
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2024 LASTRO Consultoria & Investimentos – Empresa Júnior UERN</span>
          <a href="#">Política de Privacidade</a>
        </div>
      </div>
    </footer>
  );
}