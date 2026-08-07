import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ChartNoAxesCombined,
  LoaderCircle,
  Pencil,
  Plus,
  Save,
  Search,
  Trash2,
} from "lucide-react";
import { ApiRequestError } from "../../../auth/api";
import { useAuth } from "../../../auth/useAuth";
import type { Indicator, IndicatorCreateInput, IndicatorUpdateInput } from "../../../types/indicator";

interface IndicatorManagerProps {
  onNotify: (message: string) => void;
}

type IndicatorErrors = Partial<Record<keyof IndicatorCreateInput, string>>;

const EMPTY_INDICATOR: IndicatorCreateInput = {
  name: "",
  value: "",
  description: "",
};

function getErrorMessage(error: unknown) {
  if (error instanceof ApiRequestError || error instanceof Error) {
    return error.message;
  }
  return "Não foi possível concluir a operação.";
}

export default function IndicatorManager({ onNotify }: IndicatorManagerProps) {
  const { apiRequest } = useAuth();
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [view, setView] = useState<"list" | "form">("list");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState<IndicatorCreateInput>({ ...EMPTY_INDICATOR });
  const [errors, setErrors] = useState<IndicatorErrors>({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [requestError, setRequestError] = useState("");

  useEffect(() => {
    let active = true;

    void apiRequest<Indicator[]>("/api/admin/indicators")
      .then((response) => {
        if (active) setIndicators(response);
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

  const filteredIndicators = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("pt-BR");
    return indicators.filter((indicator) => {
      return (
        !normalizedSearch ||
        indicator.name.toLocaleLowerCase("pt-BR").includes(normalizedSearch) ||
        indicator.value.toLocaleLowerCase("pt-BR").includes(normalizedSearch)
      );
    });
  }, [indicators, search]);

  function updateDraft<K extends keyof IndicatorCreateInput>(
    field: K,
    value: IndicatorCreateInput[K],
  ) {
    setDraft((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function openEditor(indicator?: Indicator) {
    setEditingId(indicator?.id ?? null);
    setDraft(
      indicator
        ? {
            name: indicator.name,
            value: indicator.value,
            description: indicator.description || "",
          }
        : { ...EMPTY_INDICATOR }
    );
    setErrors({});
    setRequestError("");
    setView("form");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function closeEditor() {
    setView("list");
    setEditingId(null);
    setErrors({});
    setRequestError("");
  }

  function validate() {
    const nextErrors: IndicatorErrors = {};
    if (!draft.name.trim()) nextErrors.name = "Informe o nome do indicador.";
    if (!draft.value.trim()) nextErrors.value = "Informe o valor do indicador (ex: 50+).";
    
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function saveIndicator() {
    if (!validate()) return;

    setSubmitting(true);
    setRequestError("");
    
    try {
      if (editingId) {
        const payload: IndicatorUpdateInput = {
          name: draft.name.trim(),
          value: draft.value.trim(),
          description: draft.description?.trim() || undefined,
        };
        const saved = await apiRequest<Indicator>(`/api/admin/indicators/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        setIndicators((current) =>
          current.map((ind) => (ind.id === editingId ? saved : ind))
        );
        onNotify("Indicador atualizado.");
      } else {
        const payload: IndicatorCreateInput = {
          name: draft.name.trim(),
          value: draft.value.trim(),
          description: draft.description?.trim() || undefined,
        };
        const saved = await apiRequest<Indicator>("/api/admin/indicators", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setIndicators((current) => [...current, saved]);
        onNotify("Indicador criado.");
      }
      closeEditor();
    } catch (error) {
      setRequestError(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  async function deleteIndicator(indicator: Indicator) {
    if (!window.confirm(`Excluir o indicador “${indicator.name}”?`)) return;

    setRequestError("");
    try {
      await apiRequest<void>(`/api/admin/indicators/${indicator.id}`, {
        method: "DELETE",
      });
      setIndicators((current) =>
        current.filter((item) => item.id !== indicator.id),
      );
      onNotify("Indicador excluído.");
    } catch (error) {
      setRequestError(getErrorMessage(error));
    }
  }

  if (view === "form") {
    return (
      <section className="admin-module admin-indicator-editor">
        <header className="admin-editor-head">
          <div className="admin-editor-head__title">
            <button
              type="button"
              className="admin-icon-button"
              onClick={closeEditor}
              aria-label="Voltar para a lista de indicadores"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <span className="admin-eyebrow">Conteúdo da home</span>
              <h1>{editingId ? "Editar indicador" : "Novo indicador"}</h1>
            </div>
          </div>
          <button
            type="button"
            className="admin-button admin-button--primary"
            disabled={submitting}
            onClick={() => void saveIndicator()}
          >
            {submitting ? (
              <LoaderCircle className="is-spinning" size={16} />
            ) : (
              <Save size={16} />
            )}
            Salvar indicador
          </button>
        </header>

        {requestError && (
          <div className="admin-request-error">{requestError}</div>
        )}

        <div className="admin-partner-editor__grid">
          <article className="admin-card admin-form-card">
            <div className="admin-card__heading">
              <div>
                <h2>Informações do indicador</h2>
                <p>Os indicadores são exibidos como números na página inicial.</p>
              </div>
            </div>

            <div className="admin-field">
              <label htmlFor="indicator-name">Nome</label>
              <input
                id="indicator-name"
                value={draft.name}
                maxLength={255}
                className={errors.name ? "is-invalid" : ""}
                placeholder="Ex.: Projetos Realizados"
                onChange={(event) => updateDraft("name", event.target.value)}
              />
              {errors.name && (
                <span className="admin-field__error">{errors.name}</span>
              )}
            </div>

            <div className="admin-field">
              <label htmlFor="indicator-value">Valor</label>
              <input
                id="indicator-value"
                value={draft.value}
                maxLength={255}
                className={errors.value ? "is-invalid" : ""}
                placeholder="Ex.: 42 ou 92%"
                onChange={(event) => updateDraft("value", event.target.value)}
              />
              {errors.value && (
                <span className="admin-field__error">{errors.value}</span>
              )}
            </div>

            <div className="admin-field">
              <label htmlFor="indicator-description">Descrição</label>
              <textarea
                id="indicator-description"
                value={draft.description ?? ""}
                className={errors.description ? "is-invalid" : ""}
                placeholder="Texto complementar opcional"
                onChange={(event) =>
                  updateDraft("description", event.target.value)
                }
                rows={3}
              />
            </div>
          </article>
        </div>
      </section>
    );
  }

  return (
    <section className="admin-module">
      <header className="admin-page-head">
        <div>
          <span className="admin-eyebrow">Conteúdo da home</span>
          <h1>Indicadores</h1>
          <p>Gerencie os números e resultados institucionais da página inicial.</p>
        </div>
        <button
          type="button"
          className="admin-button admin-button--primary"
          onClick={() => openEditor()}
        >
          <Plus size={17} />
          Novo indicador
        </button>
      </header>

      <div className="admin-toolbar">
        <label className="admin-search">
          <Search size={17} />
          <span className="visually-hidden">Buscar indicadores</span>
          <input
            value={search}
            placeholder="Buscar indicador..."
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
      </div>

      {requestError && <div className="admin-request-error">{requestError}</div>}

      <div className="admin-table-card">
        {loading ? (
          <div className="admin-empty-state">
            <LoaderCircle className="is-spinning" size={25} />
            <h2>Carregando indicadores</h2>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Indicador</th>
                <th>Valor</th>
                <th>Descrição</th>
                <th aria-label="Ações" />
              </tr>
            </thead>
            <tbody>
              {filteredIndicators.map((indicator) => (
                <tr key={indicator.id}>
                  <td data-label="Indicador">
                    <strong>{indicator.name}</strong>
                  </td>
                  <td data-label="Valor">
                    {indicator.value}
                  </td>
                  <td data-label="Descrição">
                    {indicator.description || "-"}
                  </td>
                  <td>
                    <div className="admin-row-actions">
                      <button
                        type="button"
                        onClick={() => openEditor(indicator)}
                        aria-label={`Editar ${indicator.name}`}
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        className="is-danger"
                        onClick={() => void deleteIndicator(indicator)}
                        aria-label={`Excluir ${indicator.name}`}
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
        {!loading && filteredIndicators.length === 0 && (
          <div className="admin-empty-state">
            <ChartNoAxesCombined size={27} />
            <h2>Nenhum indicador encontrado</h2>
            <p>Cadastre um indicador para exibi-lo na home.</p>
          </div>
        )}
      </div>
    </section>
  );
}
