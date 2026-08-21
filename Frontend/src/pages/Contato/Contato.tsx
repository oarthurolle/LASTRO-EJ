// src/pages/Contato/Contato.tsx
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  CheckCircle2,
  LoaderCircle,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import { fetchApi, parseApiResponse } from "../../auth/api";
import logo from "../../assets/logos/logoWhite.png";
import mascot from "../../assets/images/Home/mascot.png";
import "./Contato.css";

interface ContactPayload {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

interface ContactErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
  consent?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Contato() {
  const [form, setForm] = useState<ContactPayload>({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [requestError, setRequestError] = useState("");
  const [sent, setSent] = useState(false);

  function updateField<K extends keyof ContactPayload>(
    field: K,
    value: ContactPayload[K],
  ) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function validate() {
    const nextErrors: ContactErrors = {};

    if (!form.name.trim()) nextErrors.name = "Informe seu nome.";
    if (!form.email.trim()) {
      nextErrors.email = "Informe seu e-mail.";
    } else if (!EMAIL_REGEX.test(form.email.trim())) {
      nextErrors.email = "Informe um e-mail válido.";
    }
    if (!form.subject.trim()) nextErrors.subject = "Informe o assunto.";
    if (!form.message.trim()) {
      nextErrors.message = "Escreva sua mensagem.";
    } else if (form.message.trim().length < 10) {
      nextErrors.message = "Sua mensagem deve ter ao menos 10 caracteres.";
    }
    if (!consent) nextErrors.consent = "É necessário aceitar a política de privacidade.";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setRequestError("");

    if (!validate()) return;

    setSubmitting(true);
    try {
      await parseApiResponse<{ message: string }>(
        await fetchApi("/api/public/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name.trim(),
            email: form.email.trim(),
            phone: form.phone.trim() || undefined,
            subject: form.subject.trim(),
            message: form.message.trim(),
          }),
        }),
      );
      setSent(true);
    } catch (error) {
      setRequestError(
        error instanceof Error
          ? error.message
          : "Não foi possível enviar sua mensagem agora. Tente novamente em instantes.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <section className="contato-page">
        <div className="container">
          <section className="contato__success">
            <CheckCircle2 size={44} />
            <span className="contato__eyebrow">Mensagem enviada</span>
            <h1>Recebemos seu contato!</h1>
            <p>
              Sua mensagem foi registrada e nossa equipe responderá o mais breve
              possível pelo e-mail informado.
            </p>
            <Link to="/" className="contato__btn-primary">
              Voltar ao início
            </Link>
          </section>
        </div>
      </section>
    );
  }

  return (
    <section className="contato-page">
      <div className="container">
        <header className="contato__hero">
          <img src={logo} alt="Logo Lastro" className="contato__logo" />
          <span className="contato__eyebrow">Contato</span>
          <h1>Contate-nos. Fale com a LASTRO</h1>
        </header>

        <div className="contato__layout">
          <div className="contato__left">
            <img src={mascot} alt="Mascote da Lastro" className="contato__mascot" />

            <div className="contato__info">
              <div className="contato__card">
                <h3>
                  <MapPin size={18} /> Localização
                </h3>
                <p>Universidade do Estado do Rio Grande do Norte</p>
                <p>Rua Professor Antônio Campos</p>
                <p>Bairro Costa e Silva</p>
                <p>Mossoró - RN</p>
                <p>CEP: 59600-000</p>
              </div>

              <div className="contato__card">
                <h3>
                  <Mail size={18} /> E-mail
                </h3>
                <p>lastro.ej@uern.br</p>
              </div>

              <div className="contato__card">
                <h3>
                  <Phone size={18} /> Telefone
                </h3>
                <p>(84) 99460-7110</p>
              </div>
            </div>
          </div>

          <form className="contato__form" onSubmit={handleSubmit} noValidate>
            <div className="contato__form-header">
              <h2>Formulário de Contato</h2>
              <p>Envie sua mensagem</p>
              <p>Preencha o formulário e entraremos em contato o mais breve possível</p>
            </div>

            <div className="contato__form-row">
              <div className={"contato__field" + (errors.name ? " has-error" : "")}>
                <label htmlFor="ct-name">Nome <span>*</span></label>
                <input
                  id="ct-name"
                  type="text"
                  value={form.name}
                  placeholder="Seu nome completo"
                  onChange={(e) => updateField("name", e.target.value)}
                />
                {errors.name && <small>{errors.name}</small>}
              </div>
              <div className={"contato__field" + (errors.email ? " has-error" : "")}>
                <label htmlFor="ct-email">E-mail <span>*</span></label>
                <input
                  id="ct-email"
                  type="email"
                  value={form.email}
                  placeholder="voce@empresa.com.br"
                  onChange={(e) => updateField("email", e.target.value)}
                />
                {errors.email && <small>{errors.email}</small>}
              </div>
            </div>

            <div className="contato__field">
              <label htmlFor="ct-phone">Telefone / WhatsApp <span className="contato__optional">(opcional)</span></label>
              <input
                id="ct-phone"
                type="tel"
                value={form.phone}
                placeholder="(84) 99999-9999"
                onChange={(e) => updateField("phone", e.target.value)}
              />
            </div>

            <div className={"contato__field" + (errors.subject ? " has-error" : "")}>
              <label htmlFor="ct-subject">Assunto <span>*</span></label>
              <select
                id="ct-subject"
                value={form.subject}
                onChange={(e) => updateField("subject", e.target.value)}
              >
                <option value="">Selecione o assunto...</option>
                <option>Quero um diagnóstico financeiro</option>
                <option>Plano de negócios e viabilidade</option>
                <option>Gestão de custos e precificação</option>
                <option>Indicadores e relatórios gerenciais</option>
                <option>Quero ser parceiro da LASTRO</option>
                <option>Outro assunto</option>
              </select>
              {errors.subject && <small>{errors.subject}</small>}
            </div>

            <div className={"contato__field" + (errors.message ? " has-error" : "")}>
              <label htmlFor="ct-message">Mensagem <span>*</span></label>
              <textarea
                id="ct-message"
                rows={6}
                value={form.message}
                placeholder="Descreva o contexto da sua empresa e o que você busca resolver."
                onChange={(e) => updateField("message", e.target.value)}
              />
              {errors.message && <small>{errors.message}</small>}
            </div>

            <div className={"contato__consent" + (errors.consent ? " has-error" : "")}>
              <label>
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => {
                    setConsent(e.target.checked);
                    setErrors((current) => ({ ...current, consent: undefined }));
                  }}
                />
                <span>
                  Ao enviar, você declara que leu e concorda com a{" "}
                  <Link to="/privacidade">Política de Privacidade</Link> da LASTRO.
                </span>
              </label>
              {errors.consent && <small>{errors.consent}</small>}
            </div>

            {requestError && (
              <div className="contato__error">{requestError}</div>
            )}

            <button
              type="submit"
              className="contato__btn-primary"
              disabled={submitting}
            >
              {submitting ? (
                <LoaderCircle className="is-spinning" size={18} />
              ) : (
                <Mail size={18} />
              )}
              {submitting ? "Enviando..." : "Enviar mensagem"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}