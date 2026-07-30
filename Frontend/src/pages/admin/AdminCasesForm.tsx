// src/pages/admin/AdminCasesForm.tsx
import { useParams, useNavigate, Link } from "react-router-dom";
import { SERVICE_CATEGORIES } from "../../types/case";
import { useCaseForm } from "../../hooks/useCaseForm";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminTopbar from "../../components/admin/AdminTopbar";
import ImageUploader from "../../components/admin/ImageUploader";
import { useToast } from "../../components/admin/Toast";

export default function AdminCasesForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { campos, erros, carregandoCase, salvando, erroSalvar, editando, salvar, excluir } = useCaseForm(id);

  async function handleSalvar(publicar: boolean) {
    const ok = await salvar(publicar);
    if (ok) {
      showToast(publicar ? "Case publicado com sucesso." : "Case salvo como rascunho.");
      navigate("/admin/cases");
    }
  }

  async function handleExcluir() {
    if (!confirm("Excluir este case? Essa ação não pode ser desfeita.")) return;
    const ok = await excluir();
    if (ok) {
      showToast("Case excluído.");
      navigate("/admin/cases");
    }
  }

  if (carregandoCase) {
    return (
      <div className="admin-shell">
        <AdminSidebar active="cases" />
        <div className="main-area">
          <AdminTopbar breadcrumb="editando publicação" />
          <div className="content"><p>Carregando case...</p></div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-shell">
      <AdminSidebar active="cases" />
      <div className="main-area">
        <AdminTopbar breadcrumb={editando ? "editando publicação" : "nova publicação"} />
        <div className="content">

          <div className="form-head">
            <div className="form-head-left">
              <Link to="/admin/cases" className="back-btn">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
              </Link>
              <h1>{editando ? "Editar Case de Sucesso" : "Novo Case de Sucesso"}</h1>
            </div>
            <div className="form-head-actions">
              <button className="btn btn-outline" disabled={salvando} onClick={() => handleSalvar(false)}>Salvar rascunho</button>
              <button className="btn btn-primary" disabled={salvando} onClick={() => handleSalvar(true)}>Publicar case</button>
            </div>
          </div>

          {erroSalvar && <p style={{ color: "var(--red)", marginBottom: 16 }}>{erroSalvar}</p>}

          <div className="form-grid">
            <div>
              <div className="card">
                <h3>Informações do cliente</h3>
                <p className="card-sub">Dados básicos do projeto que será exibido no case.</p>

                <div className="field-row">
                  <div className={"field" + (erros.clientName ? " error" : "")}>
                    <label>Nome do cliente <span className="req">*</span></label>
                    <input type="text" value={campos.clientName} onChange={(e) => campos.setClientName(e.target.value)} placeholder="Ex: Sebrae RN" />
                    <span className="error-msg">Informe o nome do cliente.</span>
                  </div>
                  <div className={"field" + (erros.projectDate ? " error" : "")}>
                    <label>Data de conclusão do projeto <span className="req">*</span></label>
                    <input type="date" value={campos.projectDate} onChange={(e) => campos.setProjectDate(e.target.value)} />
                    <span className="error-msg">Informe a data do projeto.</span>
                  </div>
                </div>

                <div className={"field" + (erros.serviceCategory ? " error" : "")}>
                  <label>Categoria do serviço <span className="req">*</span></label>
                  <select value={campos.serviceCategory} onChange={(e) => campos.setServiceCategory(e.target.value)}>
                    <option value="">Selecione...</option>
                    {SERVICE_CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                  <span className="error-msg">Selecione uma categoria.</span>
                </div>
              </div>

              <div className="card">
                <h3>Imagem de capa</h3>
                <p className="card-sub">Usada na listagem de Cases e no topo da página do projeto.</p>
                <ImageUploader value={campos.coverImageUrl} onChange={campos.setCoverImageUrl} />
              </div>

              <div className="card">
                <h3>Conteúdo do case</h3>
                <p className="card-sub">Desafio, Solução e Resultado — os três campos exigidos pelo formato comercial.</p>

                <div className={"field" + (erros.problem ? " error" : "")}>
                  <label>Desafio (problema enfrentado pelo cliente) <span className="req">*</span></label>
                  <textarea maxLength={600} value={campos.problem} onChange={(e) => campos.setProblem(e.target.value)} placeholder="Descreva o contexto e as dificuldades que o cliente enfrentava antes do projeto." />
                  <div className="char-count">{campos.problem.length}/600</div>
                  <span className="error-msg">Descreva o desafio do cliente.</span>
                </div>

                <div className={"field" + (erros.solution ? " error" : "")}>
                  <label>Solução <span className="req">*</span></label>
                  <textarea maxLength={600} value={campos.solution} onChange={(e) => campos.setSolution(e.target.value)} placeholder="Descreva a solução aplicada pela equipe." />
                  <span className="error-msg">Descreva a solução aplicada.</span>
                </div>

                <div className={"field" + (erros.result ? " error" : "")}>
                  <label>Resultado <span className="req">*</span></label>
                  <textarea maxLength={400} value={campos.result} onChange={(e) => campos.setResult(e.target.value)} placeholder="Descreva o resultado obtido, com números sempre que possível." />
                  <span className="error-msg">Descreva o resultado obtido.</span>
                </div>
              </div>

              <div className="card">
                <h3>Depoimento do cliente <span style={{ color: "var(--admin-muted-soft)", fontWeight: 500 }}>(opcional)</span></h3>
                <div className="field">
                  <label>Texto do depoimento</label>
                  <textarea value={campos.testimonial} onChange={(e) => campos.setTestimonial(e.target.value)} placeholder="Ex: A Lastro transformou nossa dinâmica de equipe." />
                  <div className="hint">Exibido com o nome do cliente como assinatura — não há campo de autor separado.</div>
                </div>
              </div>
            </div>

            <div className="side-col">
              <div className="card">
                <h3>Publicação</h3>
                <div className="publish-row">
                  <span style={{ fontSize: 13, color: "var(--admin-muted)", fontWeight: 600 }}>Status</span>
                  <div className="status-pills">
                    <button type="button" className={"status-pill draft" + (campos.status === "DRAFT" ? " active" : "")} onClick={() => campos.setStatus("DRAFT")}>Rascunho</button>
                    <button type="button" className={"status-pill published" + (campos.status === "PUBLISHED" ? " active" : "")} onClick={() => campos.setStatus("PUBLISHED")}>Publicado</button>
                  </div>
                </div>
                <div className="side-actions">
                  <button className="btn btn-primary" disabled={salvando} onClick={() => handleSalvar(true)}>Publicar case</button>
                  <button className="btn btn-outline" disabled={salvando} onClick={() => handleSalvar(false)}>Salvar como rascunho</button>
                  {editando && (
                    <button className="btn btn-danger-ghost" style={{ justifyContent: "center" }} onClick={handleExcluir}>
                      Excluir case
                    </button>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}