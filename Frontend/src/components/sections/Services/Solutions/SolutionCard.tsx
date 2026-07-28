import type { IconType } from "react-icons";

type SolutionCardProps = {
  icon: IconType;
  title: string;
  description: string;
  services: string[];
};

const SolutionCard = ({
  icon: Icon,
  title,
  description,
  services,
}: SolutionCardProps) => {
  return (
    <article className="solution-card">
      <div className="solution-card__icon">
        <Icon />
      </div>

      <h3 className="solution-card__title">
        {title}
      </h3>

      <p className="solution-card__description">
        {description}
      </p>

      <ul className="solution-card__list">
        {services.map((service) => (
          <li key={service}>{service}</li>
        ))}
      </ul>
    </article>
  );
};

export default SolutionCard;