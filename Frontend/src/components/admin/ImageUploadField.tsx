import { FileImage, LoaderCircle, Upload, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { useAuth } from "../../auth/useAuth";
import { uploadImage } from "../../services/imageUploadApi";
import type { ImageUploadTarget } from "../../types/imageUpload";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

interface ImageUploadFieldProps {
  label: string;
  value: string;
  target: ImageUploadTarget;
  optional?: boolean;
  error?: string;
  recommendation?: string;
  onChange: (url: string) => void;
  onUploadingChange?: (uploading: boolean) => void;
}

export default function ImageUploadField({
  label,
  value,
  target,
  optional = false,
  error,
  recommendation,
  onChange,
  onUploadingChange,
}: ImageUploadFieldProps) {
  const { apiRequest } = useAuth();
  const inputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function setUploadState(next: boolean) {
    setUploading(next);
    onUploadingChange?.(next);
  }

  async function handleFile(file?: File) {
    if (!file) return;
    setUploadError("");

    if (file.type && !ALLOWED_TYPES.has(file.type)) {
      setUploadError("Use uma imagem JPEG, PNG ou WebP.");
      resetFileInput();
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setUploadError("A imagem deve possuir no máximo 5 MB.");
      resetFileInput();
      return;
    }

    setPreviewUrl(URL.createObjectURL(file));
    setUploadState(true);
    try {
      const uploaded = await uploadImage(apiRequest, target, file);
      onChange(uploaded.url);
      setPreviewUrl("");
    } catch (uploadFailure) {
      setPreviewUrl("");
      setUploadError(
        uploadFailure instanceof Error
          ? uploadFailure.message
          : "Não foi possível enviar a imagem.",
      );
    } finally {
      setUploadState(false);
      resetFileInput();
    }
  }

  function resetFileInput() {
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeImage() {
    setUploadError("");
    setPreviewUrl("");
    onChange("");
    resetFileInput();
  }

  const displayedImage = previewUrl || value;

  return (
    <div className="admin-image-upload">
      <div className="admin-image-upload__preview">
        {displayedImage ? (
          <img src={displayedImage} alt={`Pré-visualização: ${label}`} />
        ) : (
          <div className="admin-image-upload__empty">
            <FileImage size={27} />
            <span>Nenhuma imagem selecionada</span>
          </div>
        )}
        {displayedImage && !uploading && (
          <button
            type="button"
            onClick={removeImage}
            aria-label={`Remover ${label.toLocaleLowerCase("pt-BR")}`}
          >
            <X size={15} />
          </button>
        )}
        {uploading && (
          <div className="admin-image-upload__loading" role="status">
            <LoaderCircle className="is-spinning" size={24} />
            <span>Enviando imagem...</span>
          </div>
        )}
      </div>

      <div className="admin-image-upload__actions">
        <label className="admin-button admin-button--secondary" htmlFor={inputId}>
          <Upload size={16} />
          {displayedImage ? "Substituir arquivo" : "Selecionar arquivo"}
        </label>
        <input
          ref={fileInputRef}
          id={inputId}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          disabled={uploading}
          onChange={(event) => void handleFile(event.target.files?.[0])}
        />
        <span>JPEG, PNG ou WebP · máximo de 5 MB</span>
        {recommendation && <span>{recommendation}</span>}
      </div>

      <div className="admin-field admin-field--compact">
        <label htmlFor={`${inputId}-url`}>
          URL da imagem{optional ? " (opcional)" : ""}
        </label>
        <input
          id={`${inputId}-url`}
          type="url"
          value={value}
          maxLength={255}
          placeholder="https://..."
          className={error || uploadError ? "is-invalid" : ""}
          disabled={uploading}
          onChange={(event) => {
            setUploadError("");
            onChange(event.target.value);
          }}
        />
        <span className="admin-field__hint">
          Você também pode informar uma imagem já hospedada.
        </span>
        {(uploadError || error) && (
          <span className="admin-field__error" role="alert">
            {uploadError || error}
          </span>
        )}
      </div>
    </div>
  );
}
