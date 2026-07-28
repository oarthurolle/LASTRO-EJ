import "./Solutions.css";

import SolutionCard from "./SolutionCard";

import {
  FiTrendingUp,
  FiBarChart2,
} from "react-icons/fi";

import { HiOutlineRocketLaunch } from "react-icons/hi2";

const cards = [
  {
    icon: HiOutlineRocketLaunch,
    title: "Estou começando um negócio",
    description:
      "Você tem uma ideia ou acabou de abrir a empresa e precisa validar se ela se sustenta antes de investir tempo e dinheiro.",
    services: [
      "Plano de Negócios",
      "Estudo de Mercado e Viabilidade",
    ],
  },
  {
    icon: FiTrendingUp,
    title: "Já tenho uma empresa e quero crescer",
    description:
      "O negócio está de pé, mas você quer expandir com mais segurança e um plano claro para os próximos passos.",
    services: [
      "Planejamento Estratégico",
      "Gestão de Custos e Precificação",
    ],
  },
  {
    icon: FiBarChart2,
    title: "Quero organizar a gestão",
    description:
      "Sente que falta controle sobre números e decisões e quer profissionalizar a forma como acompanha o negócio.",
    services: [
      "Diagnóstico Financeiro",
      "Indicadores e Relatórios Gerenciais",
    ],
  },
];

const Solutions = () => {
  return (
    <section className="solutions">
      <div className="container">

        <span className="solutions-tag">
          NÃO SABE POR ONDE COMEÇAR?
        </span>

        <h2 className="solutions-title">
          Qual solução é para você?
        </h2>

        <p className="solutions-description">
          Escolha a situação que mais se parece com a sua e veja os serviços
          recomendados para esse momento do seu negócio.
        </p>

        <div className="solutions-grid">
          {cards.map((card) => (
            <SolutionCard
              key={card.title}
              {...card}
            />
          ))}
        </div>

      </div>
    </section>
  );
};

export default Solutions;