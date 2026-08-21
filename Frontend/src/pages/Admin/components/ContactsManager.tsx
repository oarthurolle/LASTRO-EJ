import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  Inbox,
  LoaderCircle,
  Mail,
  MessageSquareText,
  Phone,
  Search,
  UserRound,
} from "lucide-react";
import { useAuth } from "../../../auth/useAuth";
import { ApiRequestError } from "../../../auth/api";

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  createdAt: string;
}

interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
}

interface ContactsManagerProps {
  onNotify: (message: string) => void;
}

function getErrorMessage(error: unknown) {
  if (error instanceof ApiRequestError || error instanceof Error) {
    return error.message;
  }
  return "Não foi possível concluir a operação.";
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

const PAGE_SIZE = 10;

export default function ContactsManager({ onNotify }: ContactsManagerProps) {
  const { apiRequest } = useAuth();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [requestError, setRequestError] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<ContactMessage | null>(null);

  const loadPage = useCallback(
    (targetPage: number) => {
      return apiRequest<PageResponse<ContactMessage>>(
        `/api/admin/contacts?page=${targetPage}&size=${PAGE_SIZE}&sort=createdAt,desc`,
      );
    },
    [apiRequest],
  );

  useEffect(() => {
    let active = true;

    void loadPage(page)
      .then((response) => {
        if (!active) return;
        setMessages(response.content);
        setTotalPages(response.totalPages);
        setTotalElements(response.totalElements);
        setRequestError("");
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
  }, [page, loadPage]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [selected]);

  const filteredMessages = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("pt-BR");
    if (!normalizedSearch) return messages;
    return messages.filter((message) => {
      return (
        message.name.toLocaleLowerCase("pt-BR").includes(normalizedSearch) ||
        message.email.toLocaleLowerCase("pt-BR").includes(normalizedSearch) ||
        message.subject.toLocaleLowerCase("pt-BR").includes(normalizedSearch)
      );
    });
  }, [messages, search]);

  function openMessage(message: ContactMessage) {
    setSelected(message);
    onNotify(`Mensagem de ${message.name} aberta.`);
  }

  function goToPage(targetPage: number) {
    setSearch("");
    setSelected(null);
    setLoading(true);
    setRequestError("");
    setPage(targetPage);
  }

  if (selected) {
    return (
      <section className="admin-module">
        <header className="admin-editor-head">
          <div className="admin-editor-head__title">
            <button
              type="button"
              className="admin-icon-button"
              onClick={() => setSelected(null)}
              aria-label="Voltar para a lista de contatos"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <span className="admin-eyebrow">Relacionamento</span>
              <h1>Mensagem de {selected.name}</h1>
            </div>
          </div>
          <span className="admin-status admin-status--published">
            Recebida em {formatDateTime(selected.createdAt)}
          </span>
        </header>

        <div className="admin-editor-grid">
          <div className="admin-editor-grid__main">
            <article className="admin-card admin-form-card">
              <div className="admin-card__heading">
                <div>
                  <h2>{selected.subject}</h2>
                  <p>Mensagem enviada pelo formulário de contato do site.</p>
                </div>
              </div>
              <div className="admin-field">
                <label htmlFor="contact-message-body">Mensagem</label>
                <textarea
                  id="contact-message-body"
                  className="admin-message-body"
                  rows={12}
                  value={selected.message}
                  readOnly
                />
              </div>
            </article>
          </div>

          <aside className="admin-editor-grid__side">
            <article className="admin-card admin-form-card">
              <div className="admin-card__heading admin-card__heading--compact">
                <div>
                  <h2>Remetente</h2>
                  <p>Dados informados no formulário.</p>
                </div>
              </div>
              <dl className="admin-contact-detail">
                <div>
                  <dt>
                    <UserRound size={15} />
                    Nome
                  </dt>
                  <dd>{selected.name}</dd>
                </div>
                <div>
                  <dt>
                    <Mail size={15} />
                    E-mail
                  </dt>
                  <dd>
                    <a href={`mailto:${selected.email}`}>{selected.email}</a>
                  </dd>
                </div>
                <div>
                  <dt>
                    <Phone size={15} />
                    Telefone
                  </dt>
                  <dd>{selected.phone || "Não informado"}</dd>
                </div>
                <div>
                  <dt>
                    <CalendarClock size={15} />
                    Recebida em
                  </dt>
                  <dd>{formatDateTime(selected.createdAt)}</dd>
                </div>
              </dl>
              <div className="admin-publish-note">
                <Inbox size={16} />
                <span>
                  A caixa administrativa é somente para leitura. Não é possível
                  editar ou excluir mensagens.
                </span>
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
          <span className="admin-eyebrow">Relacionamento</span>
          <h1>Contatos recebidos</h1>
          <p>Leia as mensagens enviadas pelo formulário de contato do site.</p>
        </div>
      </header>

      <div className="admin-toolbar">
        <label className="admin-search">
          <Search size={17} />
          <span className="visually-hidden">Buscar contatos</span>
          <input
            value={search}
            placeholder="Buscar por nome, e-mail ou assunto..."
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
        <span className="admin-toolbar__info">
          {totalElements === 1
            ? "1 mensagem recebida"
            : `${totalElements} mensagens recebidas`}
        </span>
      </div>

      {requestError && <div className="admin-request-error">{requestError}</div>}

      <div className="admin-table-card">
        {loading ? (
          <div className="admin-empty-state">
            <LoaderCircle className="is-spinning" size={25} />
            <h2>Carregando contatos</h2>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Recebida em</th>
                <th>Nome</th>
                <th>E-mail</th>
                <th>Assunto</th>
                <th aria-label="Abertura" />
              </tr>
            </thead>
            <tbody>
              {filteredMessages.map((message) => (
                <tr
                  key={message.id}
                  className="admin-clickable-row"
                  onClick={() => openMessage(message)}
                >
                  <td data-label="Recebida em">
                    {formatDateTime(message.createdAt)}
                  </td>
                  <td data-label="Nome">
                    <strong>{message.name}</strong>
                  </td>
                  <td data-label="E-mail">{message.email}</td>
                  <td data-label="Assunto">
                    <span className="admin-category-badge">
                      {message.subject}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="admin-row-action-link"
                      aria-label={`Abrir mensagem de ${message.name}`}
                    >
                      <MessageSquareText size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && filteredMessages.length === 0 && (
          <div className="admin-empty-state">
            <Inbox size={27} />
            <h2>Nenhuma mensagem encontrada</h2>
            <p>
              {search
                ? "Ajuste o filtro de busca."
                : "Mensagens enviadas pelo formulário de contato aparecerão aqui."}
            </p>
          </div>
        )}
      </div>

      {!loading && totalPages > 1 && (
        <nav className="admin-pagination" aria-label="Paginação de contatos">
          <button
            type="button"
            disabled={page === 0}
            onClick={() => goToPage(page - 1)}
            aria-label="Página anterior"
          >
            <ChevronLeft size={16} />
          </button>
          <span>
            Página {page + 1} de {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages - 1}
            onClick={() => goToPage(page + 1)}
            aria-label="Próxima página"
          >
            <ChevronRight size={16} />
          </button>
        </nav>
      )}
    </section>
  );
}