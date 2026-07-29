import type { BlogPostDraft, CaseStudyDraft } from "./types";

export const EMPTY_BLOG_POST: BlogPostDraft = {
  title: "",
  summary: "",
  content: "",
  coverImageUrl: "",
  author: "",
  category: "",
  status: "DRAFT",
};

export const EMPTY_CASE_STUDY: CaseStudyDraft = {
  clientName: "",
  serviceCategory: "",
  problem: "",
  solution: "",
  result: "",
  coverImageUrl: "",
  testimonial: "",
  projectDate: "",
  status: "DRAFT",
};

export const BLOG_CATEGORIES = [
  "Finanças",
  "Gestão",
  "Mercado",
  "Empreendedorismo",
  "LASTRO",
];

export const CASE_CATEGORIES = [
  "Diagnóstico Financeiro",
  "Planejamento Financeiro",
  "Precificação",
  "Fluxo de Caixa",
  "Análise de Viabilidade",
];
