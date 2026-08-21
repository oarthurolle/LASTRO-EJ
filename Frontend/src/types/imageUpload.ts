export type ImageUploadTarget = "blog" | "partners" | "cases";

export interface ImageUploadResponse {
  url: string;
  contentType: "image/jpeg" | "image/png" | "image/webp";
  size: number;
}
