// src/pages/site/Cases.tsx
import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { type Case, SERVICE_CATEGORIES } from "../../types/case";
import { getPublicCases } from "../../services/casesApi";
import "./Cases.css";

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

  const filtrados = useMemo(() => {
    return cases
      .filter((c) => categoria === "Todos" || c.serviceCategory === categoria)
      .sort((a, b) => new Date(b.projectDate).getTime() - new Date(a.projectDate).getTime());
  }, [cases, categoria]);

  const visiveis = filtrados.slice(0, visibleCount);
  const primeiroComDepoimento = cases.find((c) => c.testimonial);

  function formatDateBR(dateString: string) {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  }

  return (
    <div className="cases-page container">
      <section className="cases__hero">
        <span className="cases__eyebrow">Casos</span>
        <h1>Conheça nossos projetos</h1>
      </section>

      <div className="cases__filters">
        {CATEGORIAS.map((cat) => (
          <button
            key={cat}
            className={`cases__filter-btn ${categoria === cat ? "active" : ""}`}
            onClick={() => { setCategoria(cat); setVisibleCount(PAGE_SIZE); }}
          >
            {cat}
          </button>
        ))}
      </div>

      {carregando && <p style={{ textAlign: "center", color: "var(--color-text-secondary)" }}>Carregando cases...</p>}
      {erro && <p style={{ textAlign: "center", color: "var(--color-text-secondary)" }}>{erro}</p>}

      {!carregando && !erro && (
        <>
          <div className="cases__grid">
            {visiveis.map((c) => (
              <Link key={c.id} to={`/cases/${c.id}`} className="cases__card">
                <div className="cases__media">
                  <img src={c.coverImageUrl} alt={c.clientName} />
                  <div className="cases__media-content">
                    <span className="cases__cat">{c.serviceCategory}</span>
                    <h3>{c.clientName}</h3>
                    <span className="cases__date">{formatDateBR(c.projectDate)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {visiveis.length === 0 && (
            <p style={{ textAlign: "center", color: "var(--color-text-secondary)", marginBottom: 60 }}>
              Nenhum case encontrado nessa categoria.
            </p>
          )}

          {visibleCount < filtrados.length && (
            <div className="cases__show-more">
              <button className="cases__btn-outline" onClick={() => setVisibleCount((v) => v + PAGE_SIZE)}>
                Mostrar mais
              </button>
            </div>
          )}
        </>
      )}

      <section className="cases__impact">
        <div className="cases__impact-media">
          <img src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=700&q=80&auto=format&fit=crop" alt="Análise de gráficos e planejamento financeiro" />
        </div>
        <div className="cases__impact-text">
          <h2>Transformamos desafios financeiros em oportunidades de crescimento</h2>
          <p>Cada projeto desenvolvido pela Lastro é conduzido com análise, planejamento e dedicação para entregar soluções que geram impacto real nos resultados dos nossos clientes.</p>
        </div>
      </section>

      {primeiroComDepoimento && (
        <section className="cases__testimonial-wrap">
          <span className="cases__eyebrow" style={{ textAlign: "center" }}>Depoimento</span>
          <h2 style={{ fontSize: "var(--font-size-h2)", marginBottom: "var(--space-lg)", textAlign: "center", color: "var(--color-primary-900)" }}>
            Conheça quem já confiou na Lastro
          </h2>
          <div className="cases__testimonial-card">
            <svg className="cases__quote-mark" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9.98 8C7.23 8 5 10.24 5 13c0 2.76 2.24 5 5 5-1.5 0-3-1.5-3-3.5V14c.32.16.68.25 1.06.25C9.5 14.25 11 12.75 11 11c0-1.75-1.5-3-3.02-3zm9 0C16.23 8 14 10.24 14 13c0 2.76 2.24 5 5 5-1.5 0-3-1.5-3-3.5V14c.32.16.68.25 1.06.25 1.44 0 2.94-1.5 2.94-3.25 0-1.75-1.5-3-3.02-3z" />
            </svg>
            <div>
              <blockquote>"{primeiroComDepoimento.testimonial}"</blockquote>
              <cite>{primeiroComDepoimento.clientName}</cite>
            </div>
          </div>
        </section>
      )}

      <section className="cases__cta">
        <h2>Sua empresa pode ser a próxima história de sucesso.</h2>
        <a
          href="https://wa.me/5584998009936?text=Ol%C3%A1!%20Vi%20os%20cases%20de%20sucesso%20da%20Lastro%20e%20gostaria%20de%20falar%20com%20um%20consultor."
          target="_blank"
          rel="noopener noreferrer"
          className="cases__btn-primary"
        >
          Falar com um consultor
        </a>
      </section>
    </div>
  );
}