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
  serviceCategory: null,
  problem: "",
  solution: "",
  result: "",
  coverImageUrl: null,
  testimonial: null,
  projectDate: null,
  status: "DRAFT",
};

export const BLOG_CATEGORIES = [
  "Finanças",
  "Gestão",
  "Mercado",
  "Empreendedorismo",
  "LASTRO",
];
