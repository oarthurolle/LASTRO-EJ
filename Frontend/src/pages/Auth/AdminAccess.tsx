import { LoaderCircle, LogOut, ShieldX } from "lucide-react";
import logoBlue from "../../assets/logos/logoBlue.png";
import { useAuth } from "../../auth/useAuth";
import Admin from "../Admin/Admin";
import AdminLogin from "./AdminLogin";

const ADMIN_PRIVILEGES = [
  "PRIV_BLOG_ADMIN",
  "PRIV_CASES_ADMIN",
  "PRIV_PARTNERS_ADMIN",
  "PRIV_INDICATORS_ADMIN",
  "PRIV_CONTACTS_VIEW",
  "PRIV_USER_MANAGEMENT",
  "PRIV_COMPANY_INFO_ADMIN",
];

export default function AdminAccess() {
  const { status, user, logout } = useAuth();

  if (status === "loading") {
    return (
      <main className="admin-access-state" aria-live="polite">
        <LoaderCircle className="is-spinning" size={25} />
        <strong>Validando sua sessão</strong>
        <span>Aguarde um instante.</span>
      </main>
    );
  }

  if (status === "anonymous" || !user) {
    return <AdminLogin />;
  }

  const canAccessAdmin =
    user.roles.some((role) => role === "ADMIN" || role === "DIRECTOR") ||
    ADMIN_PRIVILEGES.some((privilege) =>
      user.privileges.includes(privilege),
    );

  if (!canAccessAdmin) {
    return (
      <main className="admin-access-state admin-access-state--denied">
        <img src={logoBlue} alt="LASTRO" />
        <div className="admin-access-state__icon">
          <ShieldX size={27} />
        </div>
        <span className="admin-login__kicker">Acesso restrito</span>
        <h1>Esta conta não possui acesso administrativo.</h1>
        <p>
          Você entrou como <strong>{user.email}</strong>, mas sua função atual
          não permite acessar os módulos internos.
        </p>
        <div>
          <a href="/">Voltar ao site</a>
          <button type="button" onClick={() => void logout()}>
            <LogOut size={16} />
            Sair desta conta
          </button>
        </div>
      </main>
    );
  }

  return <Admin />;
}
