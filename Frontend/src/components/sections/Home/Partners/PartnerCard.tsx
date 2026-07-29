import "./PartnerCard.css";

import type { Partner } from "./types";

interface PartnerCardProps {
  partner: Partner;
}

const PartnerCard = ({ partner }: PartnerCardProps) => {
  const content = (
    <article className={`partner-card ${partner.externalLink ? "partner-card--clickable" : ""}`}>
      <div className="partner-card__logo-wrapper">
        <img
          src={partner.logoUrl}
          alt={partner.name}
          className="partner-card__logo"
        />
      </div>

      <p className="partner-card__name">
        {partner.name}
      </p>
    </article>
  );

  if (!partner.externalLink) return content;

  return (
    <a
      className="partner-card__link"
      href={partner.externalLink}
      target="_blank"
      rel="noreferrer"
      aria-label={`Visitar o site de ${partner.name}`}
    >
      {content}
    </a>
  );
};

export default PartnerCard;
