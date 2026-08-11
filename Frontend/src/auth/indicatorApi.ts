import { fetchApi, parseApiResponse } from "./api";
import type { Indicator } from "../pages/Admin/types";

export async function getIndicators() {
  const response = await fetchApi("/api/public/indicators");
  return parseApiResponse<Indicator[]>(response);
}

export async function updateIndicator(
  id: number,
  data: {
    value: string;
    description: string;
  },
) {
  const response = await fetchApi(`/api/admin/indicators/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return parseApiResponse<Indicator>(response);
}