import { Link, NavLink } from "react-router-dom";

export default function Header() {
  return (
    <header>
      <div className="nav-inner">
        <Link to="/" className="logo">
          <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
            <circle cx="17" cy="17" r="17" fill="#1c1a4a" />
            <path d="M9 21L14 15L18 18L25 9" stroke="#5470ff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M20 9H25V14" stroke="#5470ff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="logo-text">
            <strong>LASTRO</strong>
            <span>Consultoria & Investimentos</span>
          </span>
        </Link>

        <nav className="main-nav">
          <ul>
            <li><NavLink to="/">Início</NavLink></li>
            <li><NavLink to="/sobre">Sobre nós</NavLink></li>
            <li><NavLink to="/servicos">Serviços</NavLink></li>
            <li><NavLink to="/cases">Cases</NavLink></li>
            <li><NavLink to="/blog">Blog</NavLink></li>
            <li><a href="#contato">Contato</a></li>
          </ul>
        </nav>

        <div className="nav-right">
          <a
            href="https://wa.me/5584998009936?text=Ol%C3%A1!%20Vim%20pelo%20site%20da%20Lastro."
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
          >
            Fale conosco
          </a>
        </div>
      </div>
    </header>
  );
}