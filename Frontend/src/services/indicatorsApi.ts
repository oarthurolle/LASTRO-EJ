import type { Indicator } from "../types/indicator";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

export async function getPublicIndicators(): Promise<Indicator[]> {
  const res = await fetch(`${API_URL}/api/public/indicators`);
  if (!res.ok) {
    throw new Error("Não foi possível carregar os indicadores.");
  }
  return res.json();
}