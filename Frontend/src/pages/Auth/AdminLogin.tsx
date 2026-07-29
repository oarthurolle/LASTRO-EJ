import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  LoaderCircle,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import logoWhite from "../../assets/logos/logoWhite.png";
import { ApiRequestError } from "../../auth/api";
import { useAuth } from "../../auth/useAuth";
import "./AdminLogin.css";

type LoginView = "login" | "register" | "success";

function getErrorMessage(error: unknown) {
  if (error instanceof ApiRequestError || error instanceof Error) {
    return error.message;
  }

  return "Não foi possível concluir a solicitação. Tente novamente.";
}

export default function AdminLogin() {
  const {
    login,
    requestRegistration,
    verifyMfa,
    cancelMfa,
    mfaRequired,
  } = useAuth();
  const [view, setView] = useState<LoginView>("login");
  const [presentationName, setPresentationName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await login(email, password);
    } catch (loginError) {
      setError(getErrorMessage(loginError));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRegistration(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (password !== passwordConfirmation) {
      setError("As senhas informadas não coincidem.");
      return;
    }

    setSubmitting(true);
    try {
      await requestRegistration({ presentationName, email, password });
      setView("success");
      setPassword("");
      setPasswordConfirmation("");
    } catch (registrationError) {
      setError(getErrorMessage(registrationError));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleMfa(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!/^\d{6}$/.test(mfaCode)) {
      setError("Digite o código de 6 dígitos do aplicativo autenticador.");
      return;
    }

    setSubmitting(true);
    try {
      await verifyMfa(mfaCode);
    } catch (mfaError) {
      setError(getErrorMessage(mfaError));
    } finally {
      setSubmitting(false);
    }
  }

  function showLogin() {
    cancelMfa();
    setView("login");
    setMfaCode("");
    setError("");
  }

  function showRegistration() {
    setView("register");
    setError("");
  }

  function renderForm() {
    if (mfaRequired) {
      return (
        <>
          <div className="admin-login__icon">
            <KeyRound size={24} />
          </div>
          <span className="admin-login__kicker">Verificação em duas etapas</span>
          <h2>Confirme que é você</h2>
          <p className="admin-login__description">
            Digite o código de 6 dígitos gerado pelo seu aplicativo autenticador.
          </p>

          <form onSubmit={handleMfa}>
            <label htmlFor="mfa-code">Código de autenticação</label>
            <input
              id="mfa-code"
              className="admin-login__code"
              value={mfaCode}
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="000000"
              autoFocus
              onChange={(event) =>
                setMfaCode(event.target.value.replace(/\D/g, ""))
              }
            />

            {error && <div className="admin-login__error">{error}</div>}

            <button
              type="submit"
              className="admin-login__submit"
              disabled={submitting}
            >
              {submitting ? (
                <LoaderCircle className="is-spinning" size={18} />
              ) : (
                <ShieldCheck size={18} />
              )}
              Verificar e entrar
            </button>
          </form>

          <button type="button" className="admin-login__back" onClick={showLogin}>
            <ArrowLeft size={16} />
            Usar outra conta
          </button>
        </>
      );
    }

    if (view === "success") {
      return (
        <div className="admin-login__success">
          <div className="admin-login__success-icon">
            <CheckCircle2 size={28} />
          </div>
          <span className="admin-login__kicker">Solicitação recebida</span>
          <h2>Agora falta a aprovação</h2>
          <p>
            Seu pedido para <strong>{email}</strong> foi enviado à diretoria.
            Você poderá entrar no painel assim que um diretor aprovar o cadastro.
          </p>
          <div className="admin-login__notice">
            Para facilitar os testes, não é necessário confirmar o e-mail nesta
            etapa.
          </div>
          <button type="button" className="admin-login__submit" onClick={showLogin}>
            Voltar para o login
            <ArrowRight size={18} />
          </button>
        </div>
      );
    }

    if (view === "register") {
      return (
        <>
          <span className="admin-login__kicker">Solicitar acesso</span>
          <h2>Crie sua solicitação</h2>
          <p className="admin-login__description">
            Preencha seus dados. O acesso será liberado depois da análise de um
            diretor.
          </p>

          <form onSubmit={handleRegistration}>
            <label htmlFor="register-name">Nome completo</label>
            <div className="admin-login__input">
              <UserRound size={18} />
              <input
                id="register-name"
                value={presentationName}
                autoComplete="name"
                minLength={3}
                maxLength={150}
                placeholder="Como você será identificado"
                required
                onChange={(event) => setPresentationName(event.target.value)}
              />
            </div>

            <label htmlFor="register-email">E-mail</label>
            <div className="admin-login__input">
              <Mail size={18} />
              <input
                id="register-email"
                type="email"
                value={email}
                autoComplete="email"
                placeholder="seuemail@uern.br"
                required
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>

            <label htmlFor="register-password">Senha</label>
            <div className="admin-login__input">
              <LockKeyhole size={18} />
              <input
                id="register-password"
                type={passwordVisible ? "text" : "password"}
                value={password}
                autoComplete="new-password"
                minLength={8}
                maxLength={64}
                placeholder="Mínimo de 8 caracteres"
                required
                onChange={(event) => setPassword(event.target.value)}
              />
              <button
                type="button"
                aria-label={passwordVisible ? "Ocultar senha" : "Exibir senha"}
                onClick={() => setPasswordVisible((visible) => !visible)}
              >
                {passwordVisible ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>

            <label htmlFor="register-password-confirmation">Confirmar senha</label>
            <div className="admin-login__input">
              <LockKeyhole size={18} />
              <input
                id="register-password-confirmation"
                type={passwordVisible ? "text" : "password"}
                value={passwordConfirmation}
                autoComplete="new-password"
                minLength={8}
                maxLength={64}
                placeholder="Digite a senha novamente"
                required
                onChange={(event) => setPasswordConfirmation(event.target.value)}
              />
            </div>

            {error && <div className="admin-login__error">{error}</div>}

            <button
              type="submit"
              className="admin-login__submit"
              disabled={submitting}
            >
              {submitting ? (
                <LoaderCircle className="is-spinning" size={18} />
              ) : (
                <>
                  Enviar solicitação
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <button type="button" className="admin-login__back" onClick={showLogin}>
            <ArrowLeft size={16} />
            Já tenho uma conta
          </button>
        </>
      );
    }

    return (
      <>
        <span className="admin-login__kicker">Painel administrativo</span>
        <h2>Bem-vindo de volta</h2>
        <p className="admin-login__description">
          Entre com sua conta institucional para continuar.
        </p>

        <form onSubmit={handleLogin}>
          <label htmlFor="admin-email">E-mail</label>
          <div className="admin-login__input">
            <Mail size={18} />
            <input
              id="admin-email"
              type="email"
              value={email}
              autoComplete="email"
              placeholder="seuemail@uern.br"
              required
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          <label htmlFor="admin-password">Senha</label>
          <div className="admin-login__input">
            <LockKeyhole size={18} />
            <input
              id="admin-password"
              type={passwordVisible ? "text" : "password"}
              value={password}
              autoComplete="current-password"
              placeholder="Digite sua senha"
              required
              onChange={(event) => setPassword(event.target.value)}
            />
            <button
              type="button"
              aria-label={passwordVisible ? "Ocultar senha" : "Exibir senha"}
              onClick={() => setPasswordVisible((visible) => !visible)}
            >
              {passwordVisible ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>

          {error && <div className="admin-login__error">{error}</div>}

          <button
            type="submit"
            className="admin-login__submit"
            disabled={submitting}
          >
            {submitting ? (
              <LoaderCircle className="is-spinning" size={18} />
            ) : (
              <>
                Entrar no painel
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="admin-login__registration">
          <span>Ainda não tem acesso?</span>
          <button type="button" onClick={showRegistration}>
            Solicitar cadastro
          </button>
        </div>

        <div className="admin-login__security">
          <ShieldCheck size={17} />
          Sua sessão é protegida e expira automaticamente.
        </div>
      </>
    );
  }

  return (
    <main className="admin-login">
      <section className="admin-login__brand-panel">
        <a href="/" className="admin-login__brand">
          <img src={logoWhite} alt="" />
          <span>
            <strong>LASTRO</strong>
            <small>Consultoria &amp; Investimentos</small>
          </span>
        </a>

        <div className="admin-login__message">
          <span className="admin-login__eyebrow">
            <ShieldCheck size={16} />
            Ambiente protegido
          </span>
          <h1>Gestão do site, no ritmo da sua equipe.</h1>
          <p>
            Publique conteúdo, acompanhe informações institucionais e acesse
            apenas as ferramentas relacionadas à sua função.
          </p>
          <div className="admin-login__roles">
            <div>
              <span>ADM</span>
              <p>
                <strong>Administrador</strong>
                Conteúdo e relacionamento
              </p>
            </div>
            <div>
              <span>DIR</span>
              <p>
                <strong>Diretor</strong>
                Gestão, equipe e acessos
              </p>
            </div>
          </div>
        </div>

        <p className="admin-login__footer">
          Empresa Júnior da Universidade do Estado do Rio Grande do Norte
        </p>
      </section>

      <section className="admin-login__form-panel">
        <div className="admin-login__form-wrap">{renderForm()}</div>
      </section>
    </main>
  );
}
