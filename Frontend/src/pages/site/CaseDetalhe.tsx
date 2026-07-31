// src/pages/site/CaseDetalhe.tsx
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { type Case } from "../../types/case";
import { getPublicCaseById } from "../../services/casesApi";
import "./CaseDetalhe.css";

export default function CaseDetalhe() {
  const { id } = useParams<{ id: string }>();
  const [c, setC] = useState<Case | null>(null);
  const [carregando, setCarregando] = useState<boolean>(true);
  const [erro, setErro] = useState<string>("");

  useEffect(() => {
    if (!id) return;
    getPublicCaseById(Number(id))
      .then(setC)
      .catch(() => setErro("Não foi possível carregar este case agora."))
      .finally(() => setCarregando(false));
  }, [id]);

  if (carregando) {
    return (
      <div className="case-detail-page container">
        <p style={{ padding: "60px 0", color: "var(--color-text-secondary)" }}>Carregando case...</p>
      </div>
    );
  }

  if (erro || !c) {
    return (
      <div className="case-detail-page container">
        <p style={{ padding: "60px 0", color: "var(--color-text-secondary)" }}>{erro || "Case não encontrado."}</p>
        <Link to="/cases" className="case-detail__back">← Voltar para os cases</Link>
      </div>
    );
  }

  function formatDateBR(dateString: string) {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  }

  return (
    <div className="case-detail-page container">
      <Link to="/cases" className="case-detail__back">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
        Voltar para os cases
      </Link>

      <div className="case-detail__hero">
        <img src={c.coverImageUrl} alt={c.clientName} />
        <div className="case-detail__hero-content">
          <span className="case-detail__cat">{c.serviceCategory}</span>
          <h1>{c.clientName}</h1>
          <span className="case-detail__date">{formatDateBR(c.projectDate)}</span>
        </div>
      </div>

      <div className="case-detail__stepper">
        <div className="case-detail__step"><span className="case-detail__step-dot">01</span><span className="case-detail__step-label">Desafio</span></div>
        <div className="case-detail__step"><span className="case-detail__step-dot">02</span><span className="case-detail__step-label">Solução</span></div>
        <div className="case-detail__step"><span className="case-detail__step-dot">03</span><span className="case-detail__step-label">Resultado</span></div>
      </div>

      <section className="case-detail__section">
        <h2>01. Desafio</h2>
        <p>{c.problem}</p>
      </section>

      <section className="case-detail__section">
        <h2>02. Solução</h2>
        <p>{c.solution}</p>
      </section>

      <section className="case-detail__section">
        <h2>03. Resultado</h2>
        <p>{c.result}</p>
      </section>

      {c.testimonial && (
        <div className="case-detail__testimonial">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M9.98 8C7.23 8 5 10.24 5 13c0 2.76 2.24 5 5 5-1.5 0-3-1.5-3-3.5V14c.32.16.68.25 1.06.25C9.5 14.25 11 12.75 11 11c0-1.75-1.5-3-3.02-3zm9 0C16.23 8 14 10.24 14 13c0 2.76 2.24 5 5 5-1.5 0-3-1.5-3-3.5V14c.32.16.68.25 1.06.25 1.44 0 2.94-1.5 2.94-3.25 0-1.75-1.5-3-3.02-3z" /></svg>
          <div>
            <blockquote>"{c.testimonial}"</blockquote>
            <cite>{c.clientName}</cite>
          </div>
        </div>
      )}

      <div className="case-detail__cta">
        <h3>Gostou do resultado? Sua empresa pode ser a próxima.</h3>
        <a
          href="https://wa.me/5584998009936?text=Ol%C3%A1!%20Vi%20um%20case%20de%20sucesso%20da%20Lastro%20e%20gostaria%20de%20falar%20com%20um%20consultor."
          target="_blank"
          rel="noopener noreferrer"
          className="case-detail__btn-primary"
        >
          Falar com um consultor
        </a>
      </div>

      <div className="case-detail__waves">
        <svg viewBox="0 0 1440 200" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,120 C240,180 480,60 720,100 C960,140 1200,60 1440,110 L1440,200 L0,200 Z" fill="var(--color-primary-400)" />
          <path d="M0,150 C240,90 480,190 720,140 C960,90 1200,170 1440,130 L1440,200 L0,200 Z" fill="var(--color-primary-700)" />
        </svg>
      </div>
    </div>
  );
}