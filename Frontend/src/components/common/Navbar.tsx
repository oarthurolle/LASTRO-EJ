import './Navbar.css'

export function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <a href="/">
            <div className="logo-icon"><img src="./src/assets/logos/logoBlue.png" alt="Logo LASTRO" /></div>
            <div className="logo-text">
              <span className="logo-title">LASTRO</span>
              <span className="logo-subtitle">Consultoria & Investimentos</span>
            </div>
          </a>
        </div>
        <ul className="navbar-menu">
          <li><a href="/">Início</a></li>
          <li><a href="/sobre">Sobre nós</a></li>
          <li><a href="/servicos">Serviços</a></li>
          <li><a href="/casos">Cases</a></li>
          <li><a href="/blog">Blog</a></li>
          <li><a href="/contato">Contato</a></li>
        </ul>
        <div className="navbar-cta">
          <a href="/contato" className="btn-cta">Fale conosco</a>
        </div>
      </div>
    </nav>
  );
}