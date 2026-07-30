import type { ApiErrorPayload } from "./types";

const configuredApiUrl = import.meta.env.VITE_API_URL?.trim() ?? "";

export const API_BASE_URL = configuredApiUrl.replace(/\/+$/, "");

export class ApiRequestError extends Error {
  status: number;
  payload: ApiErrorPayload | null;

  constructor(
    message: string,
    status: number,
    payload: ApiErrorPayload | null,
  ) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.payload = payload;
  }
}

export function buildApiUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
}

export async function fetchApi(path: string, init?: RequestInit) {
  try {
    return await fetch(buildApiUrl(path), init);
  } catch {
    throw new ApiRequestError(
      "Não foi possível conectar ao backend. Confirme se a API está ativa e se a origem do frontend está autorizada.",
      0,
      null,
    );
  }
}

export async function parseApiResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get("content-type") ?? "";
  const rawBody = await response.text();
  let body: T | ApiErrorPayload | string | undefined = rawBody || undefined;

  if (contentType.includes("application/json") && rawBody) {
    try {
      body = JSON.parse(rawBody) as T | ApiErrorPayload;
    } catch {
      if (response.ok) {
        throw new ApiRequestError(
          "O backend retornou uma resposta inválida.",
          response.status,
          null,
        );
      }
    }
  }

  if (!response.ok) {
    const payload =
      typeof body === "object" && body !== null
        ? (body as ApiErrorPayload)
        : null;
    const message =
      payload?.message ||
      (typeof body === "string" && body) ||
      "Não foi possível concluir a solicitação.";

    throw new ApiRequestError(message, response.status, payload);
  }

  return body as T;
}
