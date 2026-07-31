// src/types/case.ts

export interface Case {
  id: number;
  clientName: string;
  serviceCategory: string;
  problem: string;
  solution: string;
  result: string;
  coverImageUrl: string;
  testimonial?: string;
  projectDate: string;              
  status?: "DRAFT" | "PUBLISHED";    
}


export type CaseInput = Omit<Case, "id">;

export const SERVICE_CATEGORIES = [
  "Diagnóstico Financeiro",
  "Plano de Negócios",
  "Estudo de Mercado e Viabilidade",
  "Planejamento Estratégico",
  "Gestão de Custos e Precificação",
  "Indicadores e Relatórios Gerenciais",
  "Otimização de Processos",
] as const;