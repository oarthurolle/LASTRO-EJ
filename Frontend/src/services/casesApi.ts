// src/services/casesApi.ts
import { type Case } from "../types/case";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

interface ApiErrorPayload {
  message: string;
}

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const payload = (await res.json().catch(() => null)) as ApiErrorPayload | null;
    throw new ApiError(res.status, payload?.message ?? res.statusText);
  }

  return res.json();
}

// ==================== PÚBLICO ====================

export async function getPublicCases(): Promise<Case[]> {
  const res = await fetch(`${API_URL}/api/public/cases`);
  return handleResponse<Case[]>(res);
}

export async function getPublicCaseById(id: number): Promise<Case> {
  const res = await fetch(`${API_URL}/api/public/cases/${id}`);
  return handleResponse<Case>(res);
}