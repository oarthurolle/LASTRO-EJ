// src/pages/site/Cases.tsx
import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { type Case, SERVICE_CATEGORIES } from "../../types/case";
import { getPublicCases } from "../../services/casesApi";
import Header from "../../components/site/Header";
import Footer from "../../components/site/Footer";

const CATEGORIAS = ["Todos", ...SERVICE_CATEGORIES];
const PAGE_SIZE = 6;

export default function Cases() {
  const [cases, setCases] = useState<Case[]>([]);
  const [carregando, setCarregando] = useState<boolean>(true);
  const [erro, setErro] = useState<string>("");
  const [categoria, setCategoria] = useState<string>("Todos");
  const [visibleCount, setVisibleCount] = useState<number>(PAGE_SIZE);

  useEffect(() => {
    getPublicCases()
      .then(setCases)
      .catch(() => setErro("Não foi possível carregar os cases agora. Tente novamente em instantes."))
      .finally(() => setCarregando(false));
  }, []);

  // Não há mais filtro client-side de status: a rota pública já devolve só PUBLISHED (ponto #8).
  const filtrados = useMemo(() => {
    return cases
      .filter((c) => categoria === "Todos" || c.serviceCategory === categoria)
      .sort((a, b) => new Date(b.projectDate).getTime() - new Date(a.projectDate).getTime());
  }, [cases, categoria]);

  const visiveis = filtrados.slice(0, visibleCount);
  const primeiroComDepoimento = cases.find((c) => c.testimonial);

  function formatDateBR(_projectDate: string): import("react").ReactNode {
    throw new Error("Function not implemented.");
  }

  return (
    <>
      <Header />
      <main className="wrap" style={{ paddingTop: 0 }}>
        <section className="hero">
          <span className="eyebrow">Casos</span>
          <h1>Conheça nossos projetos</h1>
        </section>

        <div className="filter-row">
          {CATEGORIAS.map((cat) => (
            <button
              key={cat}
              className={"pill" + (categoria === cat ? " active" : "")}
              onClick={() => { setCategoria(cat); setVisibleCount(PAGE_SIZE); }}
            >
              {cat}
            </button>
          ))}
        </div>

        {carregando && <p style={{ textAlign: "center", color: "var(--muted)" }}>Carregando cases...</p>}
        {erro && <p style={{ textAlign: "center", color: "var(--muted)" }}>{erro}</p>}

        {!carregando && !erro && (
          <>
            <div className="cases-grid">
              {visiveis.map((c) => (
                <Link key={c.id} to={`/cases/${c.id}`} className="case-card">
                  <div className="case-media">
                    <img src={c.coverImageUrl} alt={c.clientName} />
                    <div className="case-media-content">
                      <span className="case-cat">{c.serviceCategory}</span>
                      <h3>{c.clientName}</h3>
                      <span className="case-date">{formatDateBR(c.projectDate)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {visiveis.length === 0 && (
              <p style={{ textAlign: "center", color: "var(--muted)", marginBottom: 60 }}>
                Nenhum case encontrado nessa categoria.
              </p>
            )}

            {visibleCount < filtrados.length && (
              <div className="show-more-wrap">
                <button className="btn-outline-pill" onClick={() => setVisibleCount((v) => v + PAGE_SIZE)}>
                  Mostrar mais
                </button>
              </div>
            )}
          </>
        )}

        <section className="impact">
          <div className="impact-media">
            <img src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=700&q=80&auto=format&fit=crop" alt="Análise de gráficos e planejamento financeiro" />
          </div>
          <div className="impact-text">
            <h2>Transformamos desafios financeiros em oportunidades de crescimento</h2>
            <p>Cada projeto desenvolvido pela Lastro é conduzido com análise, planejamento e dedicação para entregar soluções que geram impacto real nos resultados dos nossos clientes.</p>
          </div>
        </section>

        {primeiroComDepoimento && (
          <section className="testimonial-wrap">
            <span className="eyebrow">Depoimento</span>
            <h2 style={{ fontSize: 24, marginBottom: 24, textAlign: "center" }}>Conheça quem já confiou na Lastro</h2>
            <div className="testimonial-card">
              <svg className="quote-mark" width="34" height="34" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9.98 8C7.23 8 5 10.24 5 13c0 2.76 2.24 5 5 5-1.5 0-3-1.5-3-3.5V14c.32.16.68.25 1.06.25C9.5 14.25 11 12.75 11 11c0-1.75-1.5-3-3.02-3zm9 0C16.23 8 14 10.24 14 13c0 2.76 2.24 5 5 5-1.5 0-3-1.5-3-3.5V14c.32.16.68.25 1.06.25 1.44 0 2.94-1.5 2.94-3.25 0-1.75-1.5-3-3.02-3z" />
              </svg>
              <div>
                <blockquote>"{primeiroComDepoimento.testimonial}"</blockquote>
                <cite>{primeiroComDepoimento.clientName}</cite>
              </div>
            </div>
          </section>
        )}

        <section className="closing-cta">
          <h2>Sua empresa pode ser a próxima história de sucesso.</h2>
          <a
            href="https://wa.me/5584998009936?text=Ol%C3%A1!%20Vi%20os%20cases%20de%20sucesso%20da%20Lastro%20e%20gostaria%20de%20falar%20com%20um%20consultor."
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
          >
            Falar com um consultor
          </a>
        </section>
      </main>
      <Footer />
    </>
  );
}