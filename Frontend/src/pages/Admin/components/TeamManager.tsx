import { useEffect, useState } from "react";
import {
  Check,
  Clock3,
  LoaderCircle,
  Mail,
  RefreshCw,
  ShieldCheck,
  ShieldOff,
  UserRoundCheck,
  UsersRound,
  X,
} from "lucide-react";
import { ApiRequestError } from "../../../auth/api";
import { useAuth } from "../../../auth/useAuth";

type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED";

interface UserApproval {
  id: number;
  presentationName: string | null;
  email: string;
  approvalStatus: ApprovalStatus;
  roles: string[];
  createdAt: string;
}

interface TeamManagerProps {
  onNotify: (message: string) => void;
}

const FILTERS: Array<{ status: ApprovalStatus; label: string }> = [
  { status: "PENDING", label: "Pendentes" },
  { status: "APPROVED", label: "Aprovados" },
  { status: "REJECTED", label: "Reprovados" },
];

function formatRequestDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function getErrorMessage(error: unknown) {
  if (error instanceof ApiRequestError || error instanceof Error) {
    return error.message;
  }
  return "Não foi possível carregar as solicitações.";
}

function hasAdministrativeAccess(user: UserApproval) {
  return user.roles.includes("ADMIN") || user.roles.includes("DIRECTOR");
}

export default function TeamManager({ onNotify }: TeamManagerProps) {
  const { user: currentUser, apiRequest } = useAuth();
  const [status, setStatus] = useState<ApprovalStatus>("PENDING");
  const [users, setUsers] = useState<UserApproval[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  async function refreshUsers() {
    setLoading(true);
    setError("");

    try {
      const response = await apiRequest<UserApproval[]>(
        `/api/director/users?status=${status}`,
      );
      setUsers(response);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;

    void apiRequest<UserApproval[]>(
      `/api/director/users?status=${status}`,
    )
      .then((response) => {
        if (active) setUsers(response);
      })
      .catch((requestError: unknown) => {
        if (active) setError(getErrorMessage(requestError));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [apiRequest, status]);

  function changeStatus(nextStatus: ApprovalStatus) {
    setLoading(true);
    setError("");
    setStatus(nextStatus);
  }

  async function updateApproval(user: UserApproval, action: "approve" | "reject") {
    setProcessingId(user.id);
    setError("");

    try {
      await apiRequest<UserApproval>(
        `/api/director/users/${user.id}/${action}`,
        { method: "PATCH" },
      );
      setUsers((current) => current.filter((item) => item.id !== user.id));
      onNotify(
        action === "approve"
          ? `${user.presentationName || user.email} agora tem acesso administrativo.`
          : `A solicitação de ${user.presentationName || user.email} foi reprovada.`,
      );
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setProcessingId(null);
    }
  }

  async function revokeAdminAccess(user: UserApproval) {
    const name = user.presentationName || user.email;
    if (
      !window.confirm(
        `Remover o acesso administrativo de ${name}? A conta será mantida, mas não poderá mais acessar o painel.`,
      )
    ) {
      return;
    }

    setProcessingId(user.id);
    setError("");

    try {
      const updatedUser = await apiRequest<UserApproval>(
        `/api/director/users/${user.id}/revoke-admin`,
        { method: "PATCH" },
      );
      setUsers((current) =>
        current.map((item) => (item.id === user.id ? updatedUser : item)),
      );
      onNotify(`O acesso administrativo de ${name} foi removido.`);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <section className="admin-module admin-team">
      <header className="admin-page-head">
        <div>
          <span className="admin-eyebrow">Diretoria</span>
          <h1>Equipe e acessos</h1>
          <p>
            Analise as solicitações de cadastro antes de liberar o painel
            administrativo.
          </p>
        </div>
        <button
          type="button"
          className="admin-button admin-button--secondary"
          onClick={() => void refreshUsers()}
          disabled={loading}
        >
          <RefreshCw size={16} className={loading ? "is-spinning" : ""} />
          Atualizar
        </button>
      </header>

      <div className="admin-team__summary">
        <div>
          <span className="admin-team__summary-icon">
            <ShieldCheck size={20} />
          </span>
          <p>
            <strong>Aprovação pela diretoria</strong>
            Novas contas permanecem bloqueadas até sua decisão.
          </p>
        </div>
        <small>
          Ao aprovar, o usuário recebe o perfil de administrador e já pode
          entrar com a senha cadastrada.
        </small>
      </div>

      <div className="admin-team__filters" aria-label="Filtrar usuários">
        {FILTERS.map((filter) => (
          <button
            type="button"
            className={status === filter.status ? "is-active" : ""}
            key={filter.status}
            onClick={() => changeStatus(filter.status)}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {error && <div className="admin-team__error">{error}</div>}

      <div className="admin-card admin-team__list">
        {loading ? (
          <div className="admin-team__state">
            <LoaderCircle className="is-spinning" size={24} />
            <strong>Carregando solicitações</strong>
            <span>Aguarde um instante.</span>
          </div>
        ) : users.length === 0 ? (
          <div className="admin-team__state">
            {status === "PENDING" ? (
              <UserRoundCheck size={27} />
            ) : (
              <UsersRound size={27} />
            )}
            <strong>
              {status === "PENDING"
                ? "Nenhuma solicitação pendente"
                : "Nenhum usuário neste grupo"}
            </strong>
            <span>
              {status === "PENDING"
                ? "Os novos pedidos aparecerão aqui."
                : "Altere o filtro para consultar outros cadastros."}
            </span>
          </div>
        ) : (
          users.map((user) => (
            <article className="admin-team__user" key={user.id}>
              <div className="admin-team__avatar">
                {(user.presentationName || user.email).slice(0, 1).toUpperCase()}
              </div>
              <div className="admin-team__identity">
                <strong>{user.presentationName || "Nome não informado"}</strong>
                <span>
                  <Mail size={14} />
                  {user.email}
                </span>
              </div>
              <div className="admin-team__date">
                <Clock3 size={14} />
                <span>
                  Solicitado em
                  <strong>{formatRequestDate(user.createdAt)}</strong>
                </span>
              </div>
              <span
                className={`admin-team__status ${
                  user.approvalStatus === "APPROVED" &&
                  !hasAdministrativeAccess(user)
                    ? "is-revoked"
                    : `is-${user.approvalStatus.toLowerCase()}`
                }`}
              >
                {user.approvalStatus === "APPROVED" &&
                !hasAdministrativeAccess(user)
                  ? "Acesso removido"
                  : user.approvalStatus === "PENDING"
                  ? "Pendente"
                  : user.approvalStatus === "APPROVED"
                    ? "Aprovado"
                    : "Reprovado"}
              </span>
              {status === "PENDING" && (
                <div className="admin-team__actions">
                  <button
                    type="button"
                    className="is-reject"
                    disabled={processingId === user.id}
                    onClick={() => void updateApproval(user, "reject")}
                  >
                    <X size={16} />
                    Reprovar
                  </button>
                  <button
                    type="button"
                    className="is-approve"
                    disabled={processingId === user.id}
                    onClick={() => void updateApproval(user, "approve")}
                  >
                    {processingId === user.id ? (
                      <LoaderCircle className="is-spinning" size={16} />
                    ) : (
                      <Check size={16} />
                    )}
                    Aprovar
                  </button>
                </div>
              )}
              {status === "APPROVED" &&
                hasAdministrativeAccess(user) &&
                !user.roles.includes("DIRECTOR") &&
                user.id !== currentUser?.id && (
                  <div className="admin-team__actions">
                    <button
                      type="button"
                      className="is-reject"
                      disabled={processingId === user.id}
                      onClick={() => void revokeAdminAccess(user)}
                    >
                      {processingId === user.id ? (
                        <LoaderCircle className="is-spinning" size={16} />
                      ) : (
                        <ShieldOff size={16} />
                      )}
                      Remover acesso
                    </button>
                  </div>
                )}
            </article>
          ))
        )}
      </div>
    </section>
  );
}
