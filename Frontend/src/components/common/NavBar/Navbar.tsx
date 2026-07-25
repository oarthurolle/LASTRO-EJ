import "./Navbar.css";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import logoBlue from "./../../../assets/logos/logoBlue.png";

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar-container">

        <div className="navbar-logo">
          <a href="/">
            <div className="logo-icon">
              <img src={logoBlue} alt="Logo LASTRO" />
            </div>

            <div className="logo-text">
              <span className="logo-title">LASTRO</span>

              <span className="logo-subtitle">
                Consultoria & Investimentos
              </span>
            </div>
          </a>
        </div>

        <button
          className="navbar-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Abrir menu"
        >
          {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        <ul className={`navbar-menu ${menuOpen ? "active" : ""}`}>
          <li>
            <a href="/" onClick={() => setMenuOpen(false)}>
              Início
            </a>
          </li>

          <li>
            <a href="/sobre" onClick={() => setMenuOpen(false)}>
              Sobre nós
            </a>
          </li>

          <li>
            <a href="/servicos" onClick={() => setMenuOpen(false)}>
              Serviços
            </a>
          </li>

          <li>
            <a href="/casos" onClick={() => setMenuOpen(false)}>
              Cases
            </a>
          </li>

          <li>
            <a href="/blog" onClick={() => setMenuOpen(false)}>
              Blog
            </a>
          </li>

          <li>
            <a href="/contato" onClick={() => setMenuOpen(false)}>
              Contato
            </a>
          </li>
        </ul>

        <div className={`navbar-cta ${menuOpen ? "active" : ""}`}>
          <a
            href="/#cta"
            className="btn-cta"
            onClick={() => setMenuOpen(false)}
          >
            Fale conosco
          </a>
        </div>

      </div>
    </nav>
  );
}