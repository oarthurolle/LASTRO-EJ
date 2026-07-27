export interface Case {
  id: number;
  slug: string;
  cliente: string;
  segmento: string;
  categoria: string;
  data: string;                     
  status: "Publicado" | "Rascunho";
  imagem: string;
  titulo: string;
  servico: string;

  desafio: string;
  solucaoResumo: string;
  solucaoItens: string[];
  resultados: string[];

  depoimentoTexto?: string;
  depoimentoAutor?: string;
  destaque?: boolean;
}

export type CaseInput = Omit<Case, "id">;

export const CATEGORIAS_CASE = [
  "Diagnóstico Financeiro",
  "Plano de Negócios",
  "Estudo de Mercado e Viabilidade",
  "Planejamento Estratégico",
  "Gestão de Custos e Precificação",
  "Indicadores e Relatórios Gerenciais",
] as const;