import { type Indicator, type IndicatorCreateInput, type IndicatorUpdateInput } from "../types/indicator";

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

// Obter token (ajuste de acordo com a estratégia de Auth do projeto, ex: context, cookies ou localStorage)
function getAuthHeaders() {
  const token = localStorage.getItem("accessToken"); 
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function getPublicIndicators(): Promise<Indicator[]> {
  const res = await fetch(`${API_URL}/api/public/indicators`);
  return handleResponse<Indicator[]>(res);
}

export async function getAdminIndicators(): Promise<Indicator[]> {
  const res = await fetch(`${API_URL}/api/admin/indicators`, {
    headers: { ...getAuthHeaders() }
  });
  return handleResponse<Indicator[]>(res);
}

export async function createIndicator(data: IndicatorCreateInput): Promise<Indicator> {
  const res = await fetch(`${API_URL}/api/admin/indicators`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders()
    },
    body: JSON.stringify(data),
  });
  return handleResponse<Indicator>(res);
}

export async function updateIndicator(id: number, data: IndicatorUpdateInput): Promise<Indicator> {
  const res = await fetch(`${API_URL}/api/admin/indicators/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders()
    },
    body: JSON.stringify(data),
  });
  return handleResponse<Indicator>(res);
}

export async function deleteIndicator(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/api/admin/indicators/${id}`, {
    method: "DELETE",
    headers: { ...getAuthHeaders() }
  });

  if (!res.ok) {
    const payload = (await res.json().catch(() => null)) as ApiErrorPayload | null;
    throw new ApiError(res.status, payload?.message ?? res.statusText);
  }
}
