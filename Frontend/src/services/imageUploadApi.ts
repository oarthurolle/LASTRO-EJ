import type { AuthContextValue } from "../auth/AuthContextValue";
import type {
  ImageUploadResponse,
  ImageUploadTarget,
} from "../types/imageUpload";

export function uploadImage(
  apiRequest: AuthContextValue["apiRequest"],
  target: ImageUploadTarget,
  file: File,
) {
  const body = new FormData();
  body.append("file", file);

  return apiRequest<ImageUploadResponse>(`/api/admin/uploads/${target}`, {
    method: "POST",
    body,
  });
}
