// src/services/casesApi.ts
import { type Case, type CaseInput } from "../types/case.ts";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const texto = await res.text().catch(() => "");
    throw new Error(`Erro ${res.status}: ${texto || res.statusText}`);
  }
  return res.json();
}

export async function getCases(): Promise<Case[]> {
  const res = await fetch(`${API_URL}/cases`);
  return handleResponse<Case[]>(res);
}

export async function getCaseById(id: number): Promise<Case | null> {
  const res = await fetch(`${API_URL}/cases/${id}`);
  if (res.status === 404) return null;
  return handleResponse<Case>(res);
}

export async function getCaseBySlug(slug: string): Promise<Case | null> {
  const res = await fetch(`${API_URL}/cases?slug=${encodeURIComponent(slug)}`);
  const data = await handleResponse<Case[]>(res);
  return data[0] ?? null;
}

export async function createCase(data: CaseInput): Promise<Case> {
  const res = await fetch(`${API_URL}/cases`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<Case>(res);
}

export async function updateCase(id: number, data: CaseInput): Promise<Case> {
  const res = await fetch(`${API_URL}/cases/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<Case>(res);
}

export async function deleteCase(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/cases/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`Erro ${res.status} ao excluir case`);
}

export function slugify(texto: string): string {
  return texto
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}