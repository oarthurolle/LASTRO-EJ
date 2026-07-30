import "./Navbar.css";
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";
import logoBlue from "./../../../assets/logos/logoBlue.png";


export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar-container">

        <div className="navbar-logo">
          <NavLink to="/">
            <div className="logo-icon">
              <img src={logoBlue} alt="Logo LASTRO" />
            </div>

            <div className="logo-text">
              <span className="logo-title">LASTRO</span>

              <span className="logo-subtitle">
                Consultoria & Investimentos
              </span>
            </div>
          </NavLink>
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
            <NavLink to="/" onClick={() => setMenuOpen(false)}>
              Início
            </NavLink>
          </li>

          <li>
            <NavLink to="/sobre-nos" onClick={() => setMenuOpen(false)}>
              Sobre nós
            </NavLink>
          </li>

          <li>
            <NavLink to="/servicos" onClick={() => setMenuOpen(false)}>
              Serviços
            </NavLink>
          </li>

          <li>
            <NavLink to="/cases" onClick={() => setMenuOpen(false)}>
              Cases
            </NavLink>
          </li>

          <li>
            <NavLink to="/blog" onClick={() => setMenuOpen(false)}>
              Blog
            </NavLink>
          </li>

          <li>
            <NavLink to="/contato" onClick={() => setMenuOpen(false)}>
              Contato
            </NavLink>
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