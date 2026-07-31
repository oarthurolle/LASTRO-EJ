// src/components/admin/ImageUploader.tsx
interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
}

export default function ImageUploader({ value, onChange }: ImageUploaderProps) {
  return (
    <div className="field">
      <label>URL da imagem de capa</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="https://cdn.lastro.org/cases/sua-imagem.jpg"
      />
      <div className="hint">
        Cole a URL de uma imagem já hospedada. Upload direto de arquivo será adicionado quando o
        back-end expuser um endpoint de upload (multipart/form-data).
      </div>

      {value && (
        <div className="cover-preview" style={{ marginTop: 12 }}>
          <img src={value} alt="Pré-visualização da capa" onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0.3"; }} />
          <button type="button" className="remove-cover" onClick={() => onChange("")}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>
      )}
    </div>
  );
}