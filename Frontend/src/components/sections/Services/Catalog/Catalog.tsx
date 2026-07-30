import "./Catalog.css";

import ServiceCatalogCard from "./ServiceCatalogCard";

import fluxoCaixa from "../../../../assets/images/services/fluxo-caixa.png";
import pesquisaMercado from "../../../../assets/images/services/pesquisa-mercado.png";
import planejamento from "../../../../assets/images/services/planejamento.png";
import precificacao from "../../../../assets/images/services/precificação.png";
import investimentos from "../../../../assets/images/services/investimentos.png";

const services = [
  {
    image: fluxoCaixa,
    title: "Análise e acompanhamento do fluxo de caixa",
    description:
      "Monitoramos entradas e saídas financeiras para proporcionar maior controle do caixa, apoiando decisões mais seguras e estratégicas.",
    tag: "Gestão Financeira",
  },
  {
    image: pesquisaMercado,
    title: "Pesquisa de mercado",
    description:
      "Analisamos o mercado, o comportamento do consumidor e a concorrência para identificar oportunidades e reduzir riscos.",
    tag: "Inteligência de Mercado",
  },
  {
    image: planejamento,
    title: "Planejamento e acompanhamento estratégicos",
    description:
      "Construímos um planejamento alinhado aos objetivos da empresa e acompanhamos sua execução para garantir melhores resultados.",
    tag: "Estratégia Empresarial",
  },
  {
    image: precificacao,
    title: "Precificação",
    description:
      "Definimos preços considerando custos, despesas, margem de lucro e posicionamento para tornar seu negócio mais competitivo.",
    tag: "Gestão Comercial",
  },
  {
    image: investimentos,
    title: "Investimentos",
    description:
      "Auxiliamos na análise de investimentos e na avaliação da viabilidade econômica para decisões mais assertivas.",
    tag: "Análise Financeira",
  },
];

const Catalog = () => {
  return (
    <section id="catalog" className="catalog">
      <div className="container">

        <div className="catalog__header">

          <div>
            <span className="catalog__subtitle">
              CATÁLOGO COMPLETO
            </span>

            <h2 className="catalog__title">
              Nossos serviços
            </h2>
          </div>

          <p className="catalog__description">
            Conheça as soluções desenvolvidas pela Lastro para impulsionar
            empresas em diferentes momentos da sua jornada.
          </p>

        </div>

        <div className="catalog__grid">

          {services.map((service, index) => (
            <div
              key={service.title}
              className={`catalog__item ${
                index >= 3 ? "catalog__item--bottom" : ""
              }`}
            >
              <ServiceCatalogCard {...service} />
            </div>
          ))}

        </div>

      </div>
    </section>
  );
};

export default Catalog;