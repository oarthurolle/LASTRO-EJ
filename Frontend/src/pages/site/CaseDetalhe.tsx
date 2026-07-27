import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { type Case } from "../../types/case";
import { getCaseBySlug } from "../../services/casesApi";
import Header from "../../components/site/Header";
import Footer from "../../components/site/Footer";

function formatDateBR(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y.slice(2)}`;
}

export default function CaseDetalhe() {
  const { slug } = useParams<{ slug: string }>();
  const [c, setC] = useState<Case | null>(null);
  const [carregando, setCarregando] = useState<boolean>(true);
  const [erro, setErro] = useState<string>("");

  useEffect(() => {
    if (!slug) return;
    setCarregando(true);
    getCaseBySlug(slug)
      .then(setC)
      .catch(() => setErro("Não foi possível carregar este case agora."))
      .finally(() => setCarregando(false));
  }, [slug]);

  if (carregando) {
    return (
      <>
        <Header />
        <main className="wrap"><p style={{ padding: "60px 0", color: "var(--muted)" }}>Carregando case...</p></main>
        <Footer />
      </>
    );
  }

  if (erro || !c) {
    return (
      <>
        <Header />
        <main className="wrap">
          <p style={{ padding: "60px 0", color: "var(--muted)" }}>{erro || "Case não encontrado."}</p>
          <Link to="/cases" className="back-link">← Voltar para os cases</Link>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="wrap">
        <Link to="/cases" className="back-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
          Voltar para os cases
        </Link>

        <div className="detail-hero">
          <img src={c.imagem} alt={c.titulo} />
          <div className="detail-hero-content">
            <span className="case-cat">{c.categoria}</span>
            <h1>{c.titulo}</h1>
            <span className="case-date">{formatDateBR(c.data)}</span>
          </div>
        </div>

        <div className="service-line">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /></svg>
          <div>
            <span className="label">Serviço prestado</span>
            <span className="value">{c.servico}</span>
          </div>
        </div>

        <div className="flow-stepper">
          <div className="flow-step"><span className="dot">01</span><span className="label">Desafio</span></div>
          <div className="flow-step"><span className="dot">02</span><span className="label">Solução</span></div>
          <div className="flow-step"><span className="dot">03</span><span className="label">Resultado</span></div>
        </div>

        <section className="section-block">
          <h2>01. Desafio</h2>
          <p>{c.desafio}</p>
        </section>

        <section className="section-block">
          <h2>02. Solução</h2>
          <p className="lead-text">{c.solucaoResumo}</p>
          <ul className="solution-list">
            {c.solucaoItens.map((item, i) => (
              <li key={i}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="section-block">
          <h2>03. Resultados</h2>
          <ul className="result-list">
            {c.resultados.map((item, i) => (
              <li key={i}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {c.depoimentoTexto && (
          <div className="depoimento-block">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M9.98 8C7.23 8 5 10.24 5 13c0 2.76 2.24 5 5 5-1.5 0-3-1.5-3-3.5V14c.32.16.68.25 1.06.25C9.5 14.25 11 12.75 11 11c0-1.75-1.5-3-3.02-3zm9 0C16.23 8 14 10.24 14 13c0 2.76 2.24 5 5 5-1.5 0-3-1.5-3-3.5V14c.32.16.68.25 1.06.25 1.44 0 2.94-1.5 2.94-3.25 0-1.75-1.5-3-3.02-3z" /></svg>
            <div>
              <blockquote>"{c.depoimentoTexto}"</blockquote>
              <cite>{c.depoimentoAutor}</cite>
            </div>
          </div>
        )}

        <div className="detail-cta">
          <h3>Gostou do resultado? Sua empresa pode ser a próxima.</h3>
          <p>Conte um pouco do seu negócio e receba uma recomendação personalizada de onde começar.</p>
          <a
            href="https://wa.me/5584998009936?text=Ol%C3%A1!%20Vi%20um%20case%20de%20sucesso%20da%20Lastro%20e%20gostaria%20de%20falar%20com%20um%20consultor."
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
          >
            Falar com um consultor
          </a>
        </div>

        <div className="wave-divider">
          <svg viewBox="0 0 1440 200" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,120 C240,180 480,60 720,100 C960,140 1200,60 1440,110 L1440,200 L0,200 Z" fill="#7bd3d8" />
            <path d="M0,150 C240,90 480,190 720,140 C960,90 1200,170 1440,130 L1440,200 L0,200 Z" fill="#5470ff" />
          </svg>
        </div>
      </main>
      <Footer />
    </>
  );
}