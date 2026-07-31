import { Link } from "react-router-dom";

interface AdminSidebarProps {
  active: "dashboard" | "sobre" | "servicos" | "blog" | "cases" | "config";
}

export default function AdminSidebar({ active }: AdminSidebarProps) {
  function handleSoon(e: React.MouseEvent) {
    e.preventDefault();
    alert("Essa seção do painel ainda está em desenvolvimento.");
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <svg width="30" height="30" viewBox="0 0 34 34" fill="none">
          <circle cx="17" cy="17" r="17" fill="#242157" />
          <path d="M9 21L14 15L18 18L25 9" stroke="#8fa1ff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M20 9H25V14" stroke="#8fa1ff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="logo-text"><strong>LASTRO</strong><span>Painel administrativo</span></span>
      </div>

      <span className="sidebar-section-label">Conteúdo do site</span>
      <nav className="sidebar-nav">
        <a href="#" onClick={handleSoon} className={active === "dashboard" ? "active" : ""}>Dashboard</a>
        <a href="#" onClick={handleSoon} className={active === "sobre" ? "active" : ""}>Sobre nós</a>
        <a href="#" onClick={handleSoon} className={active === "servicos" ? "active" : ""}>Serviços</a>
        <a href="#" onClick={handleSoon} className={active === "blog" ? "active" : ""}>Blog</a>
        <Link to="/admin/cases" className={active === "cases" ? "active" : ""}>Cases de Sucesso</Link>

        <span className="sidebar-section-label">Sistema</span>
        <a href="#" onClick={handleSoon} className={active === "config" ? "active" : ""}>Configurações</a>
      </nav>

      <div className="sidebar-footer">
        <a href="#">Sair do painel</a>
      </div>
    </aside>
  );
}