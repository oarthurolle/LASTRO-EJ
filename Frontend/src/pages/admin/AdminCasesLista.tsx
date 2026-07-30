// src/pages/admin/AdminCasesLista.tsx
import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { type Case, SERVICE_CATEGORIES } from "../../types/case";
import { getAdminCases, deleteCase, ApiError } from "../../services/casesApi";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminTopbar from "../../components/admin/AdminTopbar";
import { useToast } from "../../components/admin/Toast";

export default function AdminCasesLista() {
  const { showToast } = useToast();
  const [cases, setCases] = useState<Case[]>([]);
  const [carregando, setCarregando] = useState<boolean>(true);
  const [erro, setErro] = useState<string>("");
  const [busca, setBusca] = useState<string>("");
  const [statusFiltro, setStatusFiltro] = useState<string>("todos");
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>("todos");

  useEffect(() => { carregar(); }, []);

  async function carregar() {
    setCarregando(true);
    try {
      const dados = await getAdminCases();
      setCases(dados);
      setErro("");
    } catch (e) {
      setErro(e instanceof ApiError ? e.message : "Não foi possível carregar os cases.");
    } finally {
      setCarregando(false);
    }
  }

  const filtrados = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return cases
      .filter((c) => !q || c.clientName.toLowerCase().includes(q))
      .filter((c) => statusFiltro === "todos" || c.status === statusFiltro)
      .filter((c) => categoriaFiltro === "todos" || c.serviceCategory === categoriaFiltro)
      .sort((a, b) => new Date(b.projectDate).getTime() - new Date(a.projectDate).getTime());
  }, [cases, busca, statusFiltro, categoriaFiltro]);

  async function handleExcluir(c: Case) {
    if (!confirm(`Excluir o case de "${c.clientName}"? Essa ação não pode ser desfeita.`)) return;
    try {
      await deleteCase(c.id);
      await carregar();
      showToast("Case excluído.");
    } catch (e) {
      alert(e instanceof ApiError ? e.message : "Erro ao excluir o case.");
    }
  }

  function formatDateBR(_projectDate: string): import("react").ReactNode {
    throw new Error("Function not implemented.");
  }

  return (
    <div className="admin-shell">
      <AdminSidebar active="cases" />
      <div className="main-area">
        <AdminTopbar breadcrumb="gerenciar publicações" />
        <div className="content">
          <div className="page-head">
            <div>
              <h1>Cases de Sucesso</h1>
              <p>Crie e edite os projetos exibidos na página pública de Cases.</p>
            </div>
            <Link to="/admin/cases/novo" className="btn btn-primary">+ Novo Case</Link>
          </div>

          <div className="toolbar">
            <div className="search-field">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
              <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar por cliente..." />
            </div>
            <select className="filter-select" value={statusFiltro} onChange={(e) => setStatusFiltro(e.target.value)}>
              <option value="todos">Todos os status</option>
              <option value="PUBLISHED">Publicado</option>
              <option value="DRAFT">Rascunho</option>
            </select>
            <select className="filter-select" value={categoriaFiltro} onChange={(e) => setCategoriaFiltro(e.target.value)}>
              <option value="todos">Todas as categorias</option>
              {SERVICE_CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          {carregando && <p>Carregando...</p>}
          {erro && !carregando && <p>{erro}</p>}

          {!carregando && !erro && (
            <div className="table-card">
              <table>
                <thead>
                  <tr>
                    <th style={{ width: "34%" }}>Cliente</th>
                    <th>Categoria</th>
                    <th>Data</th>
                    <th>Status</th>
                    <th style={{ width: 110 }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filtrados.length === 0 && (
                    <tr className="empty-row"><td colSpan={5}>Nenhum case encontrado com esses filtros.</td></tr>
                  )}
                  {filtrados.map((c) => (
                    <tr key={c.id}>
                      <td>
                        <div className="case-cell">
                          <img className="case-thumb" src={c.coverImageUrl} alt="" />
                          <div className="case-title">{c.clientName}</div>
                        </div>
                      </td>
                      <td><span className="badge badge-category">{c.serviceCategory}</span></td>
                      <td>{formatDateBR(c.projectDate)}</td>
                      <td>
                        <span className={"badge " + (c.status === "PUBLISHED" ? "badge-published" : "badge-draft")}>
                          {c.status === "PUBLISHED" ? "Publicado" : "Rascunho"}
                        </span>
                      </td>
                      <td>
                        <div className="row-actions">
                          <Link to={`/admin/cases/${c.id}/editar`} className="icon-btn" title="Editar">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /></svg>
                          </Link>
                          <button className="icon-btn danger" title="Excluir" onClick={() => handleExcluir(c)}>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}