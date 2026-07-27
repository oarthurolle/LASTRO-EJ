import "./SectionTitle.css";

interface SectionTitleProps {
  subtitle: string;
  title: string;
  description?: string;
  align?: "center" | "left";
}

export default function SectionTitle({
  subtitle,
  title,
  description,
  align = "center",
}: SectionTitleProps) {
  return (
    <div className={`section-title section-title--${align}`}>
      <span className="section-title__subtitle">
        {subtitle}
      </span>

      <h2 className="section-title__title">
        {title}
      </h2>

      {description && (
        <p className="section-title__description">
          {description}
        </p>
      )}
    </div>
  );
}