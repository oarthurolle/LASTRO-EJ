import "./PartnerCard.css";

import type { Partner } from "./types";

interface PartnerCardProps {
  partner: Partner;
}

const PartnerCard = ({ partner }: PartnerCardProps) => {
  const handleClick = () => {
    if (partner.website) {
      window.open(partner.website, "_blank", "noopener,noreferrer");
      return;
    }

    if (partner.instagram) {
      window.open(partner.instagram, "_blank", "noopener,noreferrer");
    }
  };

  const clickable = Boolean(partner.website || partner.instagram);

  return (
    <article
      className={`partner-card ${
        clickable ? "partner-card--clickable" : ""
      }`}
      onClick={clickable ? handleClick : undefined}
    >
      <div className="partner-card__logo-wrapper">
        <img
          src={partner.logo}
          alt={partner.name}
          className="partner-card__logo"
        />
      </div>

      <p className="partner-card__name">
        {partner.name}
      </p>
    </article>
  );
};

export default PartnerCard;