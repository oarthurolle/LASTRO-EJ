import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  LoaderCircle,
  Settings2,
  Pencil,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { ApiRequestError } from "../../../auth/api";
import { useAuth } from "../../../auth/useAuth";
import type {
  SmtpConfig,
  SmtpConfigDraft,
  SmtpConfigInput,
} from "../../../types/smtp";

interface EmailConfigManagerProps {
  onNotify: (message: string) => void;
}

type FieldName = keyof SmtpConfigDraft;
type EmailConfigErrors = Partial<Record<FieldName, string>>;

const EMPTY_DRAFT: SmtpConfigDraft = {
  name: "",
  host: "",
  port: "587",
  username: "",
  password: "",
  fromName: "",
  fromAddress: "",
  contactRecipient: "",
  auth: false,
  starttls: true,
};

function getErrorMessage(error: unknown) {
  if (error instanceof ApiRequestError || error instanceof Error) {
    return error.message;
  }
  return "Não foi possível concluir a operação.";
}

function toInput(draft: SmtpConfigDraft): SmtpConfigInput {
  return {
    name: draft.name.trim(),
    host: draft.host.trim(),
    port: Number(draft.port),
    username: draft.username.trim(),
    password: draft.password,
    fromName: draft.fromName.trim(),
    fromAddress: draft.fromAddress.trim(),
    contactRecipient: draft.contactRecipient.trim(),
    auth: draft.auth,
    starttls: draft.starttls,
  };
}

export default function EmailConfigManager({
  onNotify,
}: EmailConfigManagerProps) {
  const { apiRequest } = useAuth();
  const [configs, setConfigs] = useState<SmtpConfig[]>([]);
  const [view, setView] = useState<"list" | "form">("list");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState<SmtpConfigDraft>({ ...EMPTY_DRAFT });
  const [errors, setErrors] = useState<EmailConfigErrors>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [requestError, setRequestError] = useState("");

  useEffect(() => {
    let active = true;

    void apiRequest<SmtpConfig[]>("/api/admin/smtp-configs")
      .then((response) => {
        if (active) setConfigs(response);
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

  function updateDraft(field: FieldName, value: string | boolean) {
    setDraft((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function openEditor(config?: SmtpConfig) {
    setEditingId(config?.id ?? null);
    setDraft(
      config
        ? {
            name: config.name,
            host: config.host,
            port: String(config.port),
            username: config.username ?? "",
            password: config.password ?? "",
            fromName: config.fromName ?? "",
            fromAddress: config.fromAddress,
            contactRecipient: config.contactRecipient ?? "",
            auth: config.auth,
            starttls: config.starttls,
          }
        : { ...EMPTY_DRAFT },
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
    const nextErrors: EmailConfigErrors = {};
    if (!draft.name.trim()) nextErrors.name = "Informe um nome identificador.";
    if (!draft.host.trim()) {
      nextErrors.host = "Informe o servidor SMTP (ex.: smtp.gmail.com).";
    }
    const port = Number(draft.port);
    if (!draft.port.trim() || !Number.isInteger(port) || port < 1 || port > 65535) {
      nextErrors.port = "Porta inválida (ex.: 587).";
    }
    if (!draft.fromAddress.trim()) {
      nextErrors.fromAddress = "Informe o e-mail remetente.";
    }
    if (!draft.contactRecipient.trim()) {
      nextErrors.contactRecipient = "Informe para quem chegam os contatos.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function saveConfig() {
    if (!validate()) return;

    setSubmitting(true);
    setRequestError("");

    try {
      if (editingId) {
        const saved = await apiRequest<SmtpConfig>(
          `/api/admin/smtp-configs/${editingId}`,
          { method: "PUT", body: JSON.stringify(toInput(draft)) },
        );
        setConfigs((current) =>
          current.map((item) => (item.id === editingId ? saved : item)),
        );
        onNotify("Configuração SMTP atualizada.");
      } else {
        const saved = await apiRequest<SmtpConfig>("/api/admin/smtp-configs", {
          method: "POST",
          body: JSON.stringify(toInput(draft)),
        });
        setConfigs((current) => [...current, saved]);
        onNotify("Configuração SMTP criada.");
      }
      closeEditor();
    } catch (error) {
      setRequestError(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  async function activateConfig(config: SmtpConfig) {
    setRequestError("");
    try {
      const saved = await apiRequest<SmtpConfig>(
        `/api/admin/smtp-configs/${config.id}/activate`,
        { method: "POST" },
      );
      setConfigs((current) =>
        current.map((item) =>
          item.id === config.id ? saved : { ...item, active: false },
        ),
      );
      onNotify(`“${config.name}” agora é a configuração ativa.`);
    } catch (error) {
      setRequestError(getErrorMessage(error));
    }
  }

  async function deleteConfig(config: SmtpConfig) {
    if (!window.confirm(`Excluir a configuração “${config.name}”?`)) return;

    setRequestError("");
    try {
      await apiRequest<void>(`/api/admin/smtp-configs/${config.id}`, {
        method: "DELETE",
      });
      setConfigs((current) =>
        current.filter((item) => item.id !== config.id),
      );
      onNotify("Configuração SMTP excluída.");
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
              aria-label="Voltar para as configurações de e-mail"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <span className="admin-eyebrow">Diretoria e sistema</span>
              <h1>
                {editingId ? "Editar configuração SMTP" : "Nova configuração SMTP"}
              </h1>
            </div>
          </div>
          <button
            type="button"
            className="admin-button admin-button--primary"
            disabled={submitting}
            onClick={() => void saveConfig()}
          >
            {submitting ? (
              <LoaderCircle className="is-spinning" size={16} />
            ) : (
              <Save size={16} />
            )}
            Salvar configuração
          </button>
        </header>

        {requestError && (
          <div className="admin-request-error">{requestError}</div>
        )}

        <div className="admin-partner-editor__grid">
          <article className="admin-card admin-form-card">
            <div className="admin-card__heading">
              <div>
                <h2>Servidor SMTP</h2>
                <p>
                  Perfil usado no envio de e-mails do site. Somente o perfil
                  ativo é utilizado.
                </p>
              </div>
            </div>

            <div className="admin-field">
              <label htmlFor="smtp-name">Nome identificador</label>
              <input
                id="smtp-name"
                value={draft.name}
                maxLength={120}
                className={errors.name ? "is-invalid" : ""}
                placeholder="Ex.: Gmail Diretoria"
                onChange={(event) => updateDraft("name", event.target.value)}
              />
              {errors.name && (
                <span className="admin-field__error">{errors.name}</span>
              )}
            </div>

            <div className="admin-field">
              <label htmlFor="smtp-host">Servidor (host)</label>
              <input
                id="smtp-host"
                value={draft.host}
                className={errors.host ? "is-invalid" : ""}
                placeholder="Ex.: smtp.gmail.com"
                onChange={(event) => updateDraft("host", event.target.value)}
              />
              {errors.host && (
                <span className="admin-field__error">{errors.host}</span>
              )}
            </div>

            <div className="admin-field">
              <label htmlFor="smtp-port">Porta</label>
              <input
                id="smtp-port"
                type="number"
                min={1}
                max={65535}
                value={draft.port}
                className={errors.port ? "is-invalid" : ""}
                placeholder="587"
                onChange={(event) => updateDraft("port", event.target.value)}
              />
              {errors.port && (
                <span className="admin-field__error">{errors.port}</span>
              )}
            </div>

            <div className="admin-field">
              <label htmlFor="smtp-username">Usuário</label>
              <input
                id="smtp-username"
                value={draft.username}
                placeholder="E-mail do provedor SMTP"
                onChange={(event) => updateDraft("username", event.target.value)}
              />
            </div>

            <div className="admin-field">
              <label htmlFor="smtp-password">Senha</label>
              <input
                id="smtp-password"
                type="password"
                value={draft.password}
                placeholder="Senha ou App Password"
                onChange={(event) => updateDraft("password", event.target.value)}
              />
            </div>

            <div className="admin-field">
              <label htmlFor="smtp-from-name">Nome do remetente</label>
              <input
                id="smtp-from-name"
                value={draft.fromName}
                maxLength={255}
                placeholder="Ex.: LASTRO"
                onChange={(event) => updateDraft("fromName", event.target.value)}
              />
            </div>

            <div className="admin-field">
              <label htmlFor="smtp-from-address">E-mail remetente</label>
              <input
                id="smtp-from-address"
                type="email"
                value={draft.fromAddress}
                className={errors.fromAddress ? "is-invalid" : ""}
                placeholder="contato@lastro.com.br"
                onChange={(event) =>
                  updateDraft("fromAddress", event.target.value)
                }
              />
              {errors.fromAddress && (
                <span className="admin-field__error">{errors.fromAddress}</span>
              )}
            </div>

            <div className="admin-field">
              <label htmlFor="smtp-recipient">
                Destinatário dos contatos
              </label>
              <input
                id="smtp-recipient"
                type="email"
                value={draft.contactRecipient}
                className={errors.contactRecipient ? "is-invalid" : ""}
                placeholder="Para quem chegam os e-mails do formulário"
                onChange={(event) =>
                  updateDraft("contactRecipient", event.target.value)
                }
              />
              {errors.contactRecipient && (
                <span className="admin-field__error">
                  {errors.contactRecipient}
                </span>
              )}
            </div>

            <div className="admin-checkable-fields">
              <label className="admin-checkable">
                <input
                  type="checkbox"
                  checked={draft.auth}
                  onChange={(event) => updateDraft("auth", event.target.checked)}
                />
                <span>
                  <strong>Exigir autenticação</strong>
                  <small>SMTP requer usuário e senha</small>
                </span>
              </label>
              <label className="admin-checkable">
                <input
                  type="checkbox"
                  checked={draft.starttls}
                  onChange={(event) =>
                    updateDraft("starttls", event.target.checked)
                  }
                />
                <span>
                  <strong>Usar STARTTLS</strong>
                  <small>Conexão segura antes de autenticar (portas 587/25)</small>
                </span>
              </label>
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
          <span className="admin-eyebrow">Diretoria e sistema</span>
          <h1>Configurações de e-mail</h1>
          <p>
            Cadastre perfis de SMTP e escolha qual fica ativo para o envio dos
            e-mails do site.
          </p>
        </div>
        <button
          type="button"
          className="admin-button admin-button--primary"
          onClick={() => openEditor()}
        >
          <Plus size={17} />
          Nova configuração
        </button>
      </header>

      {requestError && <div className="admin-request-error">{requestError}</div>}

      <div className="admin-table-card">
        {loading ? (
          <div className="admin-empty-state">
            <LoaderCircle className="is-spinning" size={25} />
            <h2>Carregando configurações</h2>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Configuração</th>
                <th>Servidor</th>
                <th>Remetente</th>
                <th>Status</th>
                <th aria-label="Ações" />
              </tr>
            </thead>
            <tbody>
              {configs.map((config) => (
                <tr key={config.id}>
                  <td data-label="Configuração">
                    <strong>{config.name}</strong>
                  </td>
                  <td data-label="Servidor">
                    {config.host}:{config.port}
                  </td>
                  <td data-label="Remetente">
                    {config.fromName ? `${config.fromName} · ` : ""}
                    {config.fromAddress}
                    {config.contactRecipient ? (
                      <small style={{ display: "block" }}>
                        Contatos → {config.contactRecipient}
                      </small>
                    ) : null}
                  </td>
                  <td data-label="Status">
                    <span
                      className={`admin-status admin-status--${
                        config.active ? "published" : "inactive"
                      }`}
                    >
                      {config.active ? "Ativa" : "Inativa"}
                    </span>
                  </td>
                  <td>
                    <div className="admin-row-actions">
                      {!config.active && (
                        <button
                          type="button"
                          className="admin-activate-button"
                          onClick={() => void activateConfig(config)}
                        >
                          <CheckCircle2 size={15} />
                          Ativar
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => openEditor(config)}
                        aria-label={`Editar ${config.name}`}
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        className="is-danger"
                        onClick={() => void deleteConfig(config)}
                        aria-label={`Excluir ${config.name}`}
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
        {!loading && configs.length === 0 && (
          <div className="admin-empty-state">
            <Settings2 size={27} />
            <h2>Nenhuma configuração SMTP</h2>
            <p>
              Cadastre um perfil para habilitar o envio de e-mails do site. Sem
              perfil ativo, os envios são ignorados.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}