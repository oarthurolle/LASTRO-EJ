import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ExternalLink,
  Eye,
  EyeOff,
  Image,
  LoaderCircle,
  Pencil,
  Plus,
  Save,
  Search,
  Trash2,
} from "lucide-react";
import { ApiRequestError } from "../../../auth/api";
import { useAuth } from "../../../auth/useAuth";
import type { Partner, PartnerDraft } from "../types";
import ImageUploadField from "../../../components/admin/ImageUploadField";

interface PartnerManagerProps {
  onNotify: (message: string) => void;
}

type PartnerErrors = Partial<Record<keyof PartnerDraft, string>>;

const EMPTY_PARTNER: PartnerDraft = {
  name: "",
  logoUrl: "",
  externalLink: null,
  sortOrder: 0,
  active: true,
};

function getErrorMessage(error: unknown) {
  if (error instanceof ApiRequestError || error instanceof Error) {
    return error.message;
  }
  return "Não foi possível concluir a operação.";
}

export default function PartnerManager({ onNotify }: PartnerManagerProps) {
  const { apiRequest } = useAuth();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [view, setView] = useState<"list" | "form">("list");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState<PartnerDraft>({ ...EMPTY_PARTNER });
  const [errors, setErrors] = useState<PartnerErrors>({});
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">(
    "ALL",
  );
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [requestError, setRequestError] = useState("");
  const [imageUploading, setImageUploading] = useState(false);

  useEffect(() => {
    let active = true;

    void apiRequest<Partner[]>("/api/admin/partners")
      .then((response) => {
        if (active) setPartners(response);
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

  const filteredPartners = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("pt-BR");
    return partners.filter((partner) => {
      const matchesSearch =
        !normalizedSearch ||
        partner.name.toLocaleLowerCase("pt-BR").includes(normalizedSearch);
      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" ? partner.active : !partner.active);
      return matchesSearch && matchesStatus;
    });
  }, [partners, search, statusFilter]);

  function updateDraft<K extends keyof PartnerDraft>(
    field: K,
    value: PartnerDraft[K],
  ) {
    setDraft((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function openEditor(partner?: Partner) {
    setEditingId(partner?.id ?? null);
    setDraft(
      partner
        ? {
            name: partner.name,
            logoUrl: partner.logoUrl,
            externalLink: partner.externalLink,
            sortOrder: partner.sortOrder,
            active: partner.active,
          }
        : {
            ...EMPTY_PARTNER,
            sortOrder:
              partners.length === 0
                ? 0
                : Math.max(...partners.map((item) => item.sortOrder)) + 1,
          },
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
    const nextErrors: PartnerErrors = {};
    if (!draft.name.trim()) nextErrors.name = "Informe o nome do parceiro.";
    if (!/^https?:\/\/.+/i.test(draft.logoUrl.trim())) {
      nextErrors.logoUrl = "Informe uma URL HTTP ou HTTPS válida para a logo.";
    }
    if (
      draft.externalLink?.trim() &&
      !/^https?:\/\/.+/i.test(draft.externalLink.trim())
    ) {
      nextErrors.externalLink = "Informe uma URL HTTP ou HTTPS válida.";
    }
    if (!Number.isInteger(draft.sortOrder) || draft.sortOrder < 0) {
      nextErrors.sortOrder = "Use um número inteiro igual ou maior que zero.";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function savePartner() {
    if (!validate()) return;

    setSubmitting(true);
    setRequestError("");
    const payload = {
      ...draft,
      name: draft.name.trim(),
      logoUrl: draft.logoUrl.trim(),
      externalLink: draft.externalLink?.trim() || null,
    };

    try {
      const saved = await apiRequest<Partner>(
        editingId ? `/api/admin/partners/${editingId}` : "/api/admin/partners",
        {
          method: editingId ? "PUT" : "POST",
          body: JSON.stringify(payload),
        },
      );
      setPartners((current) =>
        editingId
          ? current
              .map((partner) => (partner.id === editingId ? saved : partner))
              .sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id)
          : [...current, saved].sort(
              (a, b) => a.sortOrder - b.sortOrder || a.id - b.id,
            ),
      );
      onNotify(editingId ? "Parceiro atualizado." : "Parceiro cadastrado.");
      closeEditor();
    } catch (error) {
      setRequestError(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  async function deletePartner(partner: Partner) {
    if (!window.confirm(`Excluir o parceiro “${partner.name}”?`)) return;

    setRequestError("");
    try {
      await apiRequest<void>(`/api/admin/partners/${partner.id}`, {
        method: "DELETE",
      });
      setPartners((current) =>
        current.filter((item) => item.id !== partner.id),
      );
      onNotify("Parceiro excluído.");
    } catch (error) {
      setRequestError(getErrorMessage(error));
    }
  }

  async function togglePartner(partner: Partner) {
    setRequestError("");
    try {
      const updated = await apiRequest<Partner>(
        `/api/admin/partners/${partner.id}`,
        {
          method: "PUT",
          body: JSON.stringify({ ...partner, active: !partner.active }),
        },
      );
      setPartners((current) =>
        current.map((item) => (item.id === partner.id ? updated : item)),
      );
      onNotify(
        updated.active
          ? "Parceiro publicado na página inicial."
          : "Parceiro ocultado da página inicial.",
      );
    } catch (error) {
      setRequestError(getErrorMessage(error));
    }
  }

  if (view === "form") {
    return (
      <section className="admin-module admin-partner-editor">
        <header className="admin-editor-head">
          <div className="admin-editor-head__title">
            <button
              type="button"
              className="admin-icon-button"
              onClick={closeEditor}
              aria-label="Voltar para a lista de parceiros"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <span className="admin-eyebrow">Conteúdo da home</span>
              <h1>{editingId ? "Editar parceiro" : "Novo parceiro"}</h1>
            </div>
          </div>
          <button
            type="button"
            className="admin-button admin-button--primary"
            disabled={submitting || imageUploading}
            onClick={() => void savePartner()}
          >
            {submitting ? (
              <LoaderCircle className="is-spinning" size={16} />
            ) : (
              <Save size={16} />
            )}
            Salvar parceiro
          </button>
        </header>

        {requestError && (
          <div className="admin-request-error">{requestError}</div>
        )}

        <div className="admin-partner-editor__grid">
          <article className="admin-card admin-form-card">
            <div className="admin-card__heading">
              <div>
                <h2>Informações do parceiro</h2>
                <p>Use URLs públicas para que a logo funcione no site.</p>
              </div>
              <span className="admin-step">01</span>
            </div>

            <div className="admin-field">
              <label htmlFor="partner-name">Nome</label>
              <input
                id="partner-name"
                value={draft.name}
                maxLength={255}
                className={errors.name ? "is-invalid" : ""}
                placeholder="Ex.: CDL Mossoró"
                onChange={(event) => updateDraft("name", event.target.value)}
              />
              {errors.name && (
                <span className="admin-field__error">{errors.name}</span>
              )}
            </div>

            <ImageUploadField
              label="Logo do parceiro"
              value={draft.logoUrl}
              target="partners"
              error={errors.logoUrl}
              recommendation="Prefira imagens com fundo transparente."
              onChange={(url) => updateDraft("logoUrl", url)}
              onUploadingChange={setImageUploading}
            />

            <div className="admin-field">
              <label htmlFor="partner-link">Link externo</label>
              <input
                id="partner-link"
                type="url"
                value={draft.externalLink ?? ""}
                maxLength={255}
                className={errors.externalLink ? "is-invalid" : ""}
                placeholder="https://site-do-parceiro.com.br"
                onChange={(event) =>
                  updateDraft("externalLink", event.target.value || null)
                }
              />
              <span className="admin-field__hint">
                Opcional. O card abrirá este endereço em uma nova aba.
              </span>
              {errors.externalLink && (
                <span className="admin-field__error">
                  {errors.externalLink}
                </span>
              )}
            </div>

            <div className="admin-field-row">
              <div className="admin-field">
                <label htmlFor="partner-order">Ordem de exibição</label>
                <input
                  id="partner-order"
                  type="number"
                  min={0}
                  step={1}
                  value={draft.sortOrder}
                  className={errors.sortOrder ? "is-invalid" : ""}
                  onChange={(event) =>
                    updateDraft("sortOrder", Number(event.target.value))
                  }
                />
                {errors.sortOrder && (
                  <span className="admin-field__error">
                    {errors.sortOrder}
                  </span>
                )}
              </div>
              <div className="admin-field">
                <label htmlFor="partner-active">Visibilidade</label>
                <select
                  id="partner-active"
                  value={draft.active ? "ACTIVE" : "INACTIVE"}
                  onChange={(event) =>
                    updateDraft("active", event.target.value === "ACTIVE")
                  }
                >
                  <option value="ACTIVE">Visível no site</option>
                  <option value="INACTIVE">Oculto</option>
                </select>
              </div>
            </div>
          </article>

          <aside className="admin-card admin-form-card admin-partner-preview">
            <div className="admin-card__heading admin-card__heading--compact">
              <div>
                <h2>Pré-visualização</h2>
                <p>Como o card aparecerá na página inicial.</p>
              </div>
            </div>
            <div className="admin-partner-preview__card">
              <div>
                {draft.logoUrl ? (
                  <img src={draft.logoUrl} alt="" />
                ) : (
                  <Image size={34} />
                )}
              </div>
              <strong>{draft.name || "Nome do parceiro"}</strong>
              <span>
                {draft.active ? (
                  <>
                    <Eye size={14} /> Visível
                  </>
                ) : (
                  <>
                    <EyeOff size={14} /> Oculto
                  </>
                )}
              </span>
            </div>
          </aside>
        </div>
      </section>
    );
  }

  return (
    <section className="admin-module">
      <header className="admin-page-head">
        <div>
          <span className="admin-eyebrow">Conteúdo da home</span>
          <h1>Parceiros</h1>
          <p>Gerencie parceiros e envie seus logotipos diretamente pelo painel.</p>
        </div>
        <button
          type="button"
          className="admin-button admin-button--primary"
          onClick={() => openEditor()}
        >
          <Plus size={17} />
          Novo parceiro
        </button>
      </header>

      <div className="admin-toolbar">
        <label className="admin-search">
          <Search size={17} />
          <span className="visually-hidden">Buscar parceiros</span>
          <input
            value={search}
            placeholder="Buscar parceiro..."
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
        <select
          aria-label="Filtrar parceiros por visibilidade"
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(
              event.target.value as "ALL" | "ACTIVE" | "INACTIVE",
            )
          }
        >
          <option value="ALL">Todos</option>
          <option value="ACTIVE">Visíveis</option>
          <option value="INACTIVE">Ocultos</option>
        </select>
      </div>

      {requestError && <div className="admin-request-error">{requestError}</div>}

      <div className="admin-table-card">
        {loading ? (
          <div className="admin-empty-state">
            <LoaderCircle className="is-spinning" size={25} />
            <h2>Carregando parceiros</h2>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Parceiro</th>
                <th>Link</th>
                <th>Ordem</th>
                <th>Status</th>
                <th aria-label="Ações" />
              </tr>
            </thead>
            <tbody>
              {filteredPartners.map((partner) => (
                <tr key={partner.id}>
                  <td data-label="Parceiro">
                    <div className="admin-content-cell">
                      <div className="admin-content-cell__image admin-partner-logo">
                        <img src={partner.logoUrl} alt="" />
                      </div>
                      <div>
                        <strong>{partner.name}</strong>
                        <span>{partner.logoUrl}</span>
                      </div>
                    </div>
                  </td>
                  <td data-label="Link">
                    {partner.externalLink ? (
                      <a
                        className="admin-external-link"
                        href={partner.externalLink}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Abrir <ExternalLink size={13} />
                      </a>
                    ) : (
                      "Sem link"
                    )}
                  </td>
                  <td data-label="Ordem">{partner.sortOrder}</td>
                  <td data-label="Status">
                    <button
                      type="button"
                      className={`admin-status admin-status--${
                        partner.active ? "published" : "inactive"
                      }`}
                      onClick={() => void togglePartner(partner)}
                    >
                      {partner.active ? "Visível" : "Oculto"}
                    </button>
                  </td>
                  <td>
                    <div className="admin-row-actions">
                      <button
                        type="button"
                        onClick={() => openEditor(partner)}
                        aria-label={`Editar ${partner.name}`}
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        className="is-danger"
                        onClick={() => void deletePartner(partner)}
                        aria-label={`Excluir ${partner.name}`}
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
        {!loading && filteredPartners.length === 0 && (
          <div className="admin-empty-state">
            <Image size={27} />
            <h2>Nenhum parceiro encontrado</h2>
            <p>Cadastre um parceiro ou ajuste os filtros.</p>
          </div>
        )}
      </div>
    </section>
  );
}
