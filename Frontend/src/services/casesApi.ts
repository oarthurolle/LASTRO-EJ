// src/services/casesApi.ts
import { type Case, type CaseInput } from "../types/case";

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

// ==================== ADMIN ====================

export async function getAdminCases(): Promise<Case[]> {
  const res = await fetch(`${API_URL}/api/admin/cases`);
  return handleResponse<Case[]>(res);
}

export async function getAdminCaseById(id: number): Promise<Case> {
  const res = await fetch(`${API_URL}/api/admin/cases/${id}`);
  return handleResponse<Case>(res);
}

export async function createCase(data: CaseInput): Promise<Case> {
  const res = await fetch(`${API_URL}/api/admin/cases`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return handleResponse<Case>(res);
}

export async function updateCase(id: number, data: CaseInput): Promise<Case> {
  const res = await fetch(`${API_URL}/api/admin/cases/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return handleResponse<Case>(res);
}

export async function deleteCase(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/api/admin/cases/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const payload = (await res.json().catch(() => null)) as ApiErrorPayload | null;
    throw new ApiError(res.status, payload?.message ?? res.statusText);
  }
}