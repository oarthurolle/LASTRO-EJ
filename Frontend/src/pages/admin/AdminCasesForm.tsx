import { useState, useEffect, type ChangeEvent, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { type CaseInput, CATEGORIAS_CASE } from "../../types/case";
import { getCaseById, createCase, updateCase, deleteCase, slugify } from "../../services/casesApi";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminTopbar from "../../components/admin/AdminTopbar";
import { useToast } from "../../components/admin/Toast";

const IMAGEM_PADRAO = "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=700&q=80&auto=format&fit=crop";

function formatDateBR(iso: string): string {
  if (!iso) return "--/--/----";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y.slice(2)}`;
}

export default function AdminCasesForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const editando = !!id;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [carregandoCase, setCarregandoCase] = useState<boolean>(editando);
  const [salvando, setSalvando] = useState<boolean>(false);

  const [cliente, setCliente] = useState<string>("");
  const [segmento, setSegmento] = useState<string>("");
  const [categoria, setCategoria] = useState<string>("");
  const [data, setData] = useState<string>("");
  const [titulo, setTitulo] = useState<string>("");
  const [servico, setServico] = useState<string>("");
  const [desafio, setDesafio] = useState<string>("");
  const [solucaoResumo, setSolucaoResumo] = useState<string>("");
  const [solucaoItens, setSolucaoItens] = useState<string[]>([""]);
  const [resultados, setResultados] = useState<string[]>([""]);
  const [depoimentoTexto, setDepoimentoTexto] = useState<string>("");
  const [depoimentoAutor, setDepoimentoAutor] = useState<string>("");
  const [destaque, setDestaque] = useState<boolean>(false);
  const [status, setStatus] = useState<"Rascunho" | "Publicado">("Rascunho");
  const [imagem, setImagem] = useState<string>("");

  const [erros, setErros] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!editando || !id) return;
    setCarregandoCase(true);
    getCaseById(Number(id))
      .then((c) => {
        if (!c) return;
        setCliente(c.cliente);
        setSegmento(c.segmento);
        setCategoria(c.categoria);
        setData(c.data);
        setTitulo(c.titulo);
        setServico(c.servico);
        setDesafio(c.desafio);
        setSolucaoResumo(c.solucaoResumo);
        setSolucaoItens(c.solucaoItens.length ? c.solucaoItens : [""]);
        setResultados(c.resultados.length ? c.resultados : [""]);
        setDepoimentoTexto(c.depoimentoTexto ?? "");
        setDepoimentoAutor(c.depoimentoAutor ?? "");
        setDestaque(!!c.destaque);
        setStatus(c.status);
        setImagem(c.imagem);
      })
      .finally(() => setCarregandoCase(false));
  }, [editando, id]);

  function atualizarItem(lista: "solucao" | "resultados", i: number, valor: string) {
    const setter = lista === "solucao" ? setSolucaoItens : setResultados;
    setter((itens) => itens.map((v, idx) => (idx === i ? valor : v)));
  }
  function adicionarItem(lista: "solucao" | "resultados") {
    const setter = lista === "solucao" ? setSolucaoItens : setResultados;
    setter((itens) => [...itens, ""]);
  }
  function removerItem(lista: "solucao" | "resultados", i: number) {
    const setter = lista === "solucao" ? setSolucaoItens : setResultados;
    setter((itens) => itens.filter((_, idx) => idx !== i));
  }

  function handleImagemChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setImagem((ev.target?.result as string) ?? "");
    reader.readAsDataURL(file);
  }

  function validar(): boolean {
    const novosErros: Record<string, boolean> = {
      cliente: !cliente.trim(),
      categoria: !categoria,
      data: !data,
      titulo: !titulo.trim(),
      desafio: !desafio.trim(),
      solucaoResumo: !solucaoResumo.trim(),
    };
    setErros(novosErros);
    return !Object.values(novosErros).some(Boolean);
  }

  async function handleSalvar(publicar: boolean) {
    if (!validar()) return;
    setSalvando(true);

    const payload: CaseInput = {
      slug: slugify(titulo),
      cliente: cliente.trim(),
      segmento: segmento.trim(),
      categoria,
      data,
      titulo: titulo.trim(),
      servico: servico.trim(),
      desafio: desafio.trim(),
      solucaoResumo: solucaoResumo.trim(),
      solucaoItens: solucaoItens.map((s) => s.trim()).filter(Boolean),
      resultados: resultados.map((s) => s.trim()).filter(Boolean),
      depoimentoTexto: depoimentoTexto.trim() || undefined,
      depoimentoAutor: depoimentoAutor.trim() || undefined,
      destaque,
      imagem: imagem || IMAGEM_PADRAO,
      status: publicar ? "Publicado" : "Rascunho",
    };

    try {
      if (editando && id) {
        await updateCase(Number(id), payload);
      } else {
        await createCase(payload);
      }
      showToast(publicar ? "Case publicado com sucesso." : "Case salvo como rascunho.");
      navigate("/admin/cases");
    } catch {
      alert("Erro ao salvar o case. Verifique sua conexão com a API e tente novamente.");
    } finally {
      setSalvando(false);
    }
  }

  async function handleExcluir() {
    if (!id) return;
    if (!confirm("Excluir este case? Essa ação não pode ser desfeita.")) return;
    try {
      await deleteCase(Number(id));
      showToast("Case excluído.");
      navigate("/admin/cases");
    } catch {
      alert("Erro ao excluir o case.");
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

          <div className="form-grid">
            <div>

              <div className="card">
                <h3>Informações do cliente</h3>
                <p className="card-sub">Dados básicos do projeto que será exibido no case.</p>

                <div className="field-row">
                  <div className={"field" + (erros.cliente ? " error" : "")}>
                    <label>Nome do cliente / empresa <span className="req">*</span></label>
                    <input type="text" value={cliente} onChange={(e) => setCliente(e.target.value)} placeholder="Ex: VerdeVale Alimentos LTDA." />
                    <span className="error-msg">Informe o nome do cliente.</span>
                  </div>
                  <div className="field">
                    <label>Segmento / setor</label>
                    <input type="text" value={segmento} onChange={(e) => setSegmento(e.target.value)} placeholder="Ex: Alimentício" />
                  </div>
                </div>

                <div className="field-row">
                  <div className={"field" + (erros.categoria ? " error" : "")}>
                    <label>Categoria do serviço <span className="req">*</span></label>
                    <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
                      <option value="">Selecione...</option>
                      {CATEGORIAS_CASE.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                    <span className="error-msg">Selecione uma categoria.</span>
                  </div>
                  <div className={"field" + (erros.data ? " error" : "")}>
                    <label>Data de conclusão do projeto <span className="req">*</span></label>
                    <input type="date" value={data} onChange={(e) => setData(e.target.value)} />
                    <span className="error-msg">Informe a data do projeto.</span>
                  </div>
                </div>
              </div>

              <div className="card">
                <h3>Imagem de capa</h3>
                <p className="card-sub">Usada na listagem de Cases e no topo da página do projeto.</p>

                {!imagem ? (
                  <div className="dropzone" onClick={() => fileInputRef.current?.click()}>
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                    <p>Clique para enviar uma imagem</p>
                    <span>PNG ou JPG, recomendado 1200x750px</span>
                  </div>
                ) : (
                  <div className="cover-preview">
                    <img src={imagem} alt="Capa do case" />
                    <button type="button" className="remove-cover" onClick={() => setImagem("")}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    </button>
                  </div>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImagemChange} />
              </div>

              <div className="card">
                <h3>Conteúdo do case</h3>
                <p className="card-sub">Estes campos formam o corpo completo da página do projeto.</p>

                <div className={"field" + (erros.titulo ? " error" : "")}>
                  <label>Título do case <span className="req">*</span></label>
                  <input type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ex: Planejamento Financeiro - VerdeVale Alimentos LTDA." />
                  <span className="error-msg">Informe o título do case.</span>
                </div>

                <div className="field">
                  <label>Serviço prestado (resumo curto)</label>
                  <input type="text" value={servico} onChange={(e) => setServico(e.target.value)} placeholder="Ex: Planejamento Financeiro e Gestão de Fluxo de Caixa" />
                </div>

                <div className={"field" + (erros.desafio ? " error" : "")}>
                  <label>Desafio (problema enfrentado pelo cliente) <span className="req">*</span></label>
                  <textarea maxLength={600} value={desafio} onChange={(e) => setDesafio(e.target.value)} placeholder="Descreva o contexto e as dificuldades que o cliente enfrentava antes do projeto." />
                  <div className="char-count">{desafio.length}/600</div>
                  <span className="error-msg">Descreva o desafio do cliente.</span>
                </div>

                <div className={"field" + (erros.solucaoResumo ? " error" : "")}>
                  <label>Solução — resumo <span className="req">*</span></label>
                  <textarea maxLength={400} value={solucaoResumo} onChange={(e) => setSolucaoResumo(e.target.value)} placeholder="Ex: A equipe da empresa júnior realizou um diagnóstico financeiro completo e propôs:" />
                  <div className="hint">Frase de introdução exibida antes da lista de ações abaixo.</div>
                  <span className="error-msg">Descreva o resumo da solução.</span>
                </div>

                <div className="field">
                  <label>Solução — ações realizadas</label>
                  {solucaoItens.map((item, i) => (
                    <div key={i} className="repeater-item">
                      <input type="text" value={item} onChange={(e) => atualizarItem("solucao", i, e.target.value)} placeholder="Digite o item..." />
                      <button type="button" className="repeater-remove" onClick={() => removerItem("solucao", i)}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                      </button>
                    </div>
                  ))}
                  <button type="button" className="add-item-btn" onClick={() => adicionarItem("solucao")}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14" /><path d="M5 12h14" /></svg>
                    Adicionar ação
                  </button>
                </div>

                <div className="field" style={{ marginTop: 22 }}>
                  <label>Resultados obtidos</label>
                  {resultados.map((item, i) => (
                    <div key={i} className="repeater-item">
                      <input type="text" value={item} onChange={(e) => atualizarItem("resultados", i, e.target.value)} placeholder="Digite o item..." />
                      <button type="button" className="repeater-remove" onClick={() => removerItem("resultados", i)}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                      </button>
                    </div>
                  ))}
                  <button type="button" className="add-item-btn" onClick={() => adicionarItem("resultados")}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14" /><path d="M5 12h14" /></svg>
                    Adicionar resultado
                  </button>
                </div>
              </div>

              <div className="card">
                <h3>Depoimento do cliente <span style={{ color: "var(--admin-muted-soft)", fontWeight: 500 }}>(opcional)</span></h3>
                <p className="card-sub">Exibido na seção "Conheça quem já confiou na Lastro".</p>
                <div className="field">
                  <label>Texto do depoimento</label>
                  <textarea value={depoimentoTexto} onChange={(e) => setDepoimentoTexto(e.target.value)} placeholder="Ex: A experiência com a Lastro superou nossas expectativas..." />
                </div>
                <div className="field">
                  <label>Nome e cargo de quem deu o depoimento</label>
                  <input type="text" value={depoimentoAutor} onChange={(e) => setDepoimentoAutor(e.target.value)} placeholder="Ex: Marcos Vieira, sócio-fundador da VerdeVale Alimentos" />
                </div>
              </div>
            </div>

            <div className="side-col">
              <div className="card">
                <h3>Publicação</h3>
                <div className="publish-row">
                  <span style={{ fontSize: 13, color: "var(--admin-muted)", fontWeight: 600 }}>Status</span>
                  <div className="status-pills">
                    <button type="button" className={"status-pill draft" + (status === "Rascunho" ? " active" : "")} onClick={() => setStatus("Rascunho")}>Rascunho</button>
                    <button type="button" className={"status-pill published" + (status === "Publicado" ? " active" : "")} onClick={() => setStatus("Publicado")}>Publicado</button>
                  </div>
                </div>
                <label className="checkbox-row">
                  <input type="checkbox" checked={destaque} onChange={(e) => setDestaque(e.target.checked)} />
                  Destacar este case na página inicial
                </label>
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

              <div className="card">
                <div className="preview-label">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                  Pré-visualização (página pública)
                </div>
                <div className="preview-card">
                  <div className="preview-media">
                    {imagem ? (
                      <img src={imagem} alt="" />
                    ) : (
                      <div className="ph">
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" /></svg>
                      </div>
                    )}
                  </div>
                  <div className="preview-body">
                    <div className="pv-title">{titulo || "Título do case aparecerá aqui"}</div>
                    <div className="pv-date">{formatDateBR(data)}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}