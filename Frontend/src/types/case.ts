// src/types/case.ts

export type CasePublicationStatus = "DRAFT" | "PUBLISHED";

export interface Case {
  id: number;
  clientName: string;
  serviceCategory: string | null;
  problem: string;
  solution: string;
  result: string;
  coverImageUrl: string | null;
  testimonial?: string | null;
  projectDate: string | null;
  status?: CasePublicationStatus;
}

export type CaseInput = Omit<Case, "id"> & {
  clientName: string;
  serviceCategory: string | null;
  coverImageUrl: string | null;
  projectDate: string | null;
  status?: CasePublicationStatus;
};

export const SERVICE_CATEGORIES = [
  "Diagnóstico Financeiro",
  "Plano de Negócios",
  "Estudo de Mercado e Viabilidade",
  "Planejamento Estratégico",
  "Gestão de Custos e Precificação",
  "Indicadores e Relatórios Gerenciais",
  "Otimização de Processos",
] as const;