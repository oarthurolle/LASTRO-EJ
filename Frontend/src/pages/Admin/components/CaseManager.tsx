import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BriefcaseBusiness,
  CalendarDays,
  Eye,
  FileImage,
  ImagePlus,
  LoaderCircle,
  Pencil,
  Plus,
  Save,
  Search,
  Send,
  Trash2,
  X,
} from "lucide-react";
import { EMPTY_CASE_STUDY } from "../data";
import type { CaseStudy, CaseStudyDraft, PublicationStatus } from "../types";
import { formatDate } from "../utils";
import { SERVICE_CATEGORIES } from "../../../types/case";
import { useAuth } from "../../../auth/useAuth";
import { uploadImage } from "../../../services/imageUploadApi";
import { ApiRequestError } from "../../../auth/api";

interface CaseManagerProps {
  onNotify: (message: string) => void;
}

type CaseErrors = Partial<Record<keyof CaseStudyDraft, string>>;

type CaseStatus = "DRAFT" | "PUBLISHED";

interface PageResponse<T> {
  content: T[];
  totalPages: number;
}

function getErrorMessage(error: unknown) {
  if (error instanceof ApiRequestError || error instanceof Error) {
    return error.message;
  }
  return "Não foi possível concluir a operação.";
}

export default function CaseManager({ onNotify }: CaseManagerProps) {
  const { apiRequest } = useAuth();
  const [cases, setCases] = useState<CaseStudy[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestError, setRequestError] = useState("");
  const [view, setView] = useState<"list" | "form">("list");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState<CaseStudyDraft>({
    ...EMPTY_CASE_STUDY,
  });
  const [errors, setErrors] = useState<CaseErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | PublicationStatus>(
    "ALL",
  );
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  useEffect(() => {
    let active = true;

    void (async () => {
      const firstPage = await apiRequest<PageResponse<CaseStudy>>(
        "/api/admin/cases?page=0&size=50&sort=id,desc",
      );
      if (firstPage.totalPages <= 1) return firstPage.content;

      const remainingPages = await Promise.all(
        Array.from({ length: firstPage.totalPages - 1 }, (_, index) =>
          apiRequest<PageResponse<CaseStudy>>(
            `/api/admin/cases?page=${index + 1}&size=50&sort=id,desc`,
          ),
        ),
      );
      return [
        ...firstPage.content,
        ...remainingPages.flatMap((page) => page.content),
      ];
    })()
      .then((loadedCases) => {
        if (active) {
          setCases(loadedCases);
          setRequestError("");
        }
      })
      .catch((error: unknown) => {
        if (active) setRequestError(getErrorMessage(error));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [apiRequest]);

  const filteredCases = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("pt-BR");

    const sorted = [...cases].sort((first, second) => {
      const firstDate = first.projectDate
        ? new Date(first.projectDate).getTime()
        : 0;
      const secondDate = second.projectDate
        ? new Date(second.projectDate).getTime()
        : 0;
      return secondDate - firstDate || second.id - first.id;
    });

    return sorted.filter((caseStudy) => {
      const matchesSearch =
        !normalizedSearch ||
        caseStudy.clientName.toLocaleLowerCase("pt-BR").includes(normalizedSearch) ||
        (caseStudy.serviceCategory ?? "")
          .toLocaleLowerCase("pt-BR")
          .includes(normalizedSearch);
      const matchesStatus =
        statusFilter === "ALL" || caseStudy.status === statusFilter;
      const matchesCategory =
        categoryFilter === "ALL" ||
        caseStudy.serviceCategory === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [cases, categoryFilter, search, statusFilter]);

  function updateDraft<K extends keyof CaseStudyDraft>(
    field: K,
    value: CaseStudyDraft[K],
  ) {
    setDraft((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function openEditor(caseStudy?: CaseStudy) {
    setEditingId(caseStudy?.id ?? null);
    setDraft(
      caseStudy
        ? {
            clientName: caseStudy.clientName,
            serviceCategory: caseStudy.serviceCategory,
            problem: caseStudy.problem,
            solution: caseStudy.solution,
            result: caseStudy.result,
            coverImageUrl: caseStudy.coverImageUrl,
            testimonial: caseStudy.testimonial,
            projectDate: caseStudy.projectDate,
            status: caseStudy.status,
          }
        : { ...EMPTY_CASE_STUDY },
    );
    setErrors({});
    setRequestError("");
    setView("form");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function closeEditor() {
    setEditingId(null);
    setErrors({});
    setRequestError("");
    setView("list");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function validate() {
    const nextErrors: CaseErrors = {};

    if (!draft.clientName.trim()) {
      nextErrors.clientName = "Informe o nome do cliente.";
    }
    if (!draft.serviceCategory) {
      nextErrors.serviceCategory = "Selecione a categoria do serviço.";
    }
    if (!draft.problem.trim()) {
      nextErrors.problem = "Descreva o problema enfrentado.";
    }
    if (!draft.solution.trim()) {
      nextErrors.solution = "Descreva a solução aplicada.";
    }
    if (!draft.result.trim()) {
      nextErrors.result = "Descreva os resultados obtidos.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function saveCase(status: CaseStatus) {
    if (!validate()) {
      onNotify("Revise os campos obrigatórios antes de salvar.");
      return;
    }

    setSubmitting(true);
    setRequestError("");

    const payload: CaseStudyDraft = {
      clientName: draft.clientName.trim(),
      serviceCategory: draft.serviceCategory,
      problem: draft.problem.trim(),
      solution: draft.solution.trim(),
      result: draft.result.trim(),
      coverImageUrl: draft.coverImageUrl,
      testimonial: draft.testimonial,
      projectDate: draft.projectDate,
      status,
    };

    try {
      if (editingId) {
        const saved = await apiRequest<CaseStudy>(
          `/api/admin/cases/${editingId}`,
          {
            method: "PUT",
            body: JSON.stringify(payload),
          },
        );
        setCases((current) =>
          current.map((caseStudy) =>
            caseStudy.id === editingId ? saved : caseStudy,
          ),
        );
        onNotify(
          status === "PUBLISHED"
            ? "Case publicado com sucesso."
            : "Rascunho do case salvo.",
        );
      } else {
        const saved = await apiRequest<CaseStudy>("/api/admin/cases", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setCases((current) => [saved, ...current]);
        onNotify(
          status === "PUBLISHED"
            ? "Case publicado com sucesso."
            : "Rascunho do case salvo.",
        );
      }
      closeEditor();
    } catch (error) {
      setRequestError(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  async function deleteCase(caseStudy: CaseStudy) {
    if (!window.confirm(`Excluir o case de “${caseStudy.clientName}”?`)) return;

    setRequestError("");
    try {
      await apiRequest<void>(`/api/admin/cases/${caseStudy.id}`, {
        method: "DELETE",
      });
      setCases((current) =>
        current.filter((item) => item.id !== caseStudy.id),
      );
      onNotify("Case excluído.");
    } catch (error) {
      setRequestError(getErrorMessage(error));
    }
  }

  async function handleCoverUpload(file?: File) {
    if (!file) return;

    setCoverUploading(true);
    setRequestError("");
    try {
      const uploaded = await uploadImage(apiRequest, "cases", file);
      updateDraft("coverImageUrl", uploaded.url);
    } catch (error) {
      setRequestError(getErrorMessage(error));
    } finally {
      setCoverUploading(false);
    }
  }

  if (view === "form") {
    return (
      <section className="admin-module admin-editor-page">
        <header className="admin-editor-head">
          <div className="admin-editor-head__title">
            <button
              type="button"
              className="admin-icon-button"
              onClick={closeEditor}
              aria-label="Voltar para a lista de cases"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <span className="admin-eyebrow">Cases de sucesso</span>
              <h1>{editingId ? "Editar case" : "Novo case"}</h1>
            </div>
          </div>
          <div className="admin-editor-head__actions">
            <button
              type="button"
              className="admin-button admin-button--secondary"
              disabled={submitting}
              onClick={() => void saveCase("DRAFT")}
            >
              <Save size={16} />
              Salvar rascunho
            </button>
            <button
              type="button"
              className="admin-button admin-button--primary"
              disabled={submitting}
              onClick={() => void saveCase("PUBLISHED")}
            >
              <Send size={16} />
              Publicar case
            </button>
          </div>
        </header>

        {requestError && <div className="admin-request-error">{requestError}</div>}

        <div className="admin-editor-grid">
          <div className="admin-editor-grid__main">
            <article className="admin-card admin-form-card">
              <div className="admin-card__heading">
                <div>
                  <h2>Informações do projeto</h2>
                  <p>Identifique o cliente e a frente de atuação da LASTRO.</p>
                </div>
                <span className="admin-step">01</span>
              </div>
              <div className="admin-field-row">
                <div className="admin-field">
                  <label htmlFor="case-client">Cliente ou projeto</label>
                  <input
                    id="case-client"
                    value={draft.clientName}
                    className={errors.clientName ? "is-invalid" : ""}
                    placeholder="Ex.: Empresa cliente"
                    onChange={(event) =>
                      updateDraft("clientName", event.target.value)
                    }
                  />
                  {errors.clientName && (
                    <span className="admin-field__error">
                      {errors.clientName}
                    </span>
                  )}
                </div>
                <div className="admin-field">
                  <label htmlFor="case-category">Categoria do serviço</label>
                  <select
                    id="case-category"
                    value={draft.serviceCategory ?? ""}
                    className={errors.serviceCategory ? "is-invalid" : ""}
                    onChange={(event) =>
                      updateDraft(
                        "serviceCategory",
                        event.target.value === ""
                          ? null
                          : event.target.value,
                      )
                    }
                  >
                    <option value="">Selecione uma categoria</option>
                    {SERVICE_CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  {errors.serviceCategory && (
                    <span className="admin-field__error">
                      {errors.serviceCategory}
                    </span>
                  )}
                </div>
              </div>
              <div className="admin-field">
                <label htmlFor="case-date">Data do projeto</label>
                <input
                  id="case-date"
                  type="date"
                  value={draft.projectDate ?? ""}
                  onChange={(event) =>
                    updateDraft("projectDate", event.target.value || null)
                  }
                />
              </div>
            </article>

            <article className="admin-card admin-form-card">
              <div className="admin-card__heading">
                <div>
                  <h2>História do case</h2>
                  <p>Apresente a evolução do projeto de forma objetiva.</p>
                </div>
                <span className="admin-step">02</span>
              </div>
              <div className="admin-case-flow">
                <div className="admin-case-flow__item">
                  <span>1</span>
                  <div className="admin-field">
                    <label htmlFor="case-problem">Problema</label>
                    <textarea
                      id="case-problem"
                      value={draft.problem}
                      className={errors.problem ? "is-invalid" : ""}
                      placeholder="Qual era o cenário antes do projeto?"
                      onChange={(event) =>
                        updateDraft("problem", event.target.value)
                      }
                    />
                    {errors.problem && (
                      <span className="admin-field__error">
                        {errors.problem}
                      </span>
                    )}
                  </div>
                </div>
                <div className="admin-case-flow__item">
                  <span>2</span>
                  <div className="admin-field">
                    <label htmlFor="case-solution">Solução</label>
                    <textarea
                      id="case-solution"
                      value={draft.solution}
                      className={errors.solution ? "is-invalid" : ""}
                      placeholder="O que a equipe da LASTRO realizou?"
                      onChange={(event) =>
                        updateDraft("solution", event.target.value)
                      }
                    />
                    {errors.solution && (
                      <span className="admin-field__error">
                        {errors.solution}
                      </span>
                    )}
                  </div>
                </div>
                <div className="admin-case-flow__item">
                  <span>3</span>
                  <div className="admin-field">
                    <label htmlFor="case-result">Resultado</label>
                    <textarea
                      id="case-result"
                      value={draft.result}
                      className={errors.result ? "is-invalid" : ""}
                      placeholder="Quais mudanças e resultados reais foram alcançados?"
                      onChange={(event) =>
                        updateDraft("result", event.target.value)
                      }
                    />
                    {errors.result && (
                      <span className="admin-field__error">
                        {errors.result}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </article>

            <article className="admin-card admin-form-card">
              <div className="admin-card__heading">
                <div>
                  <h2>Depoimento</h2>
                  <p>Campo opcional para reforçar a percepção do cliente.</p>
                </div>
                <span className="admin-step">03</span>
              </div>
              <div className="admin-field">
                <label htmlFor="case-testimonial">Texto do depoimento</label>
                <textarea
                  id="case-testimonial"
                  value={draft.testimonial ?? ""}
                  placeholder="Compartilhe uma fala aprovada pelo cliente."
                  onChange={(event) =>
                    updateDraft("testimonial", event.target.value || null)
                  }
                />
              </div>
            </article>
          </div>

          <aside className="admin-editor-grid__side">
            <article className="admin-card admin-form-card">
              <div className="admin-card__heading admin-card__heading--compact">
                <div>
                  <h2>Publicação</h2>
                  <p>Defina o estado deste case.</p>
                </div>
              </div>
              <div className="admin-status-selector">
                <button
                  type="button"
                  className={draft.status === "DRAFT" ? "is-active" : ""}
                  onClick={() => updateDraft("status", "DRAFT")}
                >
                  Rascunho
                </button>
                <button
                  type="button"
                  className={draft.status === "PUBLISHED" ? "is-active" : ""}
                  onClick={() => updateDraft("status", "PUBLISHED")}
                >
                  Publicado
                </button>
              </div>
              <div className="admin-publish-note">
                <CalendarDays size={16} />
                <span>
                  Cases publicados ficam disponíveis para a página pública.
                </span>
              </div>
              <button
                type="button"
                className="admin-button admin-button--primary admin-button--full"
                disabled={submitting}
                onClick={() => void saveCase(draft.status)}
              >
                {submitting ? (
                  <LoaderCircle className="is-spinning" size={16} />
                ) : draft.status === "PUBLISHED" ? (
                  <Send size={16} />
                ) : (
                  <Save size={16} />
                )}
                {draft.status === "PUBLISHED"
                  ? "Publicar agora"
                  : "Salvar rascunho"}
              </button>
            </article>

            <article className="admin-card admin-form-card">
              <div className="admin-card__heading admin-card__heading--compact">
                <div>
                  <h2>Imagem de capa</h2>
                  <p>Imagem usada no card e no detalhe do projeto.</p>
                </div>
              </div>
              {draft.coverImageUrl ? (
                <div className="admin-cover-preview">
                  <img src={draft.coverImageUrl} alt="" />
                  <button
                    type="button"
                    onClick={() => updateDraft("coverImageUrl", null)}
                    aria-label="Remover imagem de capa"
                  >
                    <X size={15} />
                  </button>
                </div>
              ) : (
                <label className="admin-dropzone" htmlFor="case-cover-file">
                  {coverUploading ? (
                    <LoaderCircle className="is-spinning" size={25} />
                  ) : (
                    <ImagePlus size={25} />
                  )}
                  <strong>{coverUploading ? "Enviando..." : "Adicionar imagem"}</strong>
                  <span>PNG ou JPG, proporção 16:10</span>
                </label>
              )}
              <input
                id="case-cover-file"
                className="visually-hidden"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                disabled={coverUploading}
                onChange={(event) => void handleCoverUpload(event.target.files?.[0])}
              />
              <div className="admin-field admin-field--compact">
                <label htmlFor="case-cover-url">Ou cole a URL</label>
                <input
                  id="case-cover-url"
                  type="url"
                  value={draft.coverImageUrl ?? ""}
                  placeholder="https://..."
                  onChange={(event) =>
                    updateDraft("coverImageUrl", event.target.value || null)
                  }
                />
              </div>
            </article>

            <article className="admin-card admin-preview admin-preview--case">
              <div className="admin-preview__label">
                <Eye size={15} />
                Pré-visualização
              </div>
              <div className="admin-preview__media">
                {draft.coverImageUrl ? (
                  <img src={draft.coverImageUrl} alt="" />
                ) : (
                  <FileImage size={30} />
                )}
              </div>
              <div className="admin-preview__body">
                <span className="admin-preview__category">
                  {draft.serviceCategory || "Categoria"}
                </span>
                <h3>{draft.clientName || "Nome do cliente"}</h3>
                <p>
                  {draft.result ||
                    "O principal resultado do projeto aparecerá neste espaço."}
                </p>
                <div className="admin-preview__meta">
                  {draft.projectDate
                    ? formatDate(draft.projectDate)
                    : "Data do projeto"}
                </div>
              </div>
            </article>
          </aside>
        </div>
      </section>
    );
  }

  return (
    <section className="admin-module">
      <header className="admin-page-head">
        <div>
          <span className="admin-eyebrow">Portfólio</span>
          <h1>Cases de sucesso</h1>
          <p>Conte histórias reais de problema, solução e resultado.</p>
        </div>
        <button
          type="button"
          className="admin-button admin-button--primary"
          onClick={() => openEditor()}
        >
          <Plus size={17} />
          Novo case
        </button>
      </header>

      <div className="admin-toolbar">
        <label className="admin-search">
          <Search size={17} />
          <span className="visually-hidden">Buscar cases</span>
          <input
            value={search}
            placeholder="Buscar por cliente ou serviço..."
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
        <select
          aria-label="Filtrar por status"
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value as "ALL" | PublicationStatus)
          }
        >
          <option value="ALL">Todos os status</option>
          <option value="PUBLISHED">Publicados</option>
          <option value="DRAFT">Rascunhos</option>
        </select>
        <select
          aria-label="Filtrar por categoria"
          value={categoryFilter}
          onChange={(event) => setCategoryFilter(event.target.value)}
        >
          <option value="ALL">Todos os serviços</option>
          {SERVICE_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {requestError && <div className="admin-request-error">{requestError}</div>}

      <div className="admin-table-card">
        {loading ? (
          <div className="admin-empty-state">
            <LoaderCircle className="is-spinning" size={25} />
            <h2>Carregando cases</h2>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Serviço</th>
                <th>Data do projeto</th>
                <th>Status</th>
                <th aria-label="Ações" />
              </tr>
            </thead>
            <tbody>
              {filteredCases.map((caseStudy) => (
                <tr key={caseStudy.id}>
                  <td data-label="Cliente">
                    <div className="admin-content-cell">
                      <div className="admin-content-cell__image">
                        {caseStudy.coverImageUrl ? (
                          <img src={caseStudy.coverImageUrl} alt="" />
                        ) : (
                          <BriefcaseBusiness size={20} />
                        )}
                      </div>
                      <div>
                        <strong>{caseStudy.clientName}</strong>
                        <span>{caseStudy.result}</span>
                      </div>
                    </div>
                  </td>
                  <td data-label="Serviço">
                    <span className="admin-category-badge">
                      {caseStudy.serviceCategory ?? "—"}
                    </span>
                  </td>
                  <td data-label="Data do projeto">
                    {caseStudy.projectDate
                      ? formatDate(caseStudy.projectDate)
                      : "Não informada"}
                  </td>
                  <td data-label="Status">
                    <span
                      className={`admin-status admin-status--${caseStudy.status.toLowerCase()}`}
                    >
                      {caseStudy.status === "PUBLISHED"
                        ? "Publicado"
                        : "Rascunho"}
                    </span>
                  </td>
                  <td>
                    <div className="admin-row-actions">
                      <button
                        type="button"
                        onClick={() => openEditor(caseStudy)}
                        aria-label={`Editar case de ${caseStudy.clientName}`}
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        className="is-danger"
                        onClick={() => void deleteCase(caseStudy)}
                        aria-label={`Excluir case de ${caseStudy.clientName}`}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && filteredCases.length === 0 && (
          <div className="admin-empty-state">
            <Search size={24} />
            <h2>Nenhum case encontrado</h2>
            <p>Ajuste os filtros ou crie um novo case.</p>
          </div>
        )}
      </div>
    </section>
  );
}