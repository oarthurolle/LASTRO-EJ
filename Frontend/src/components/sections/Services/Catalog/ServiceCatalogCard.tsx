import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";

type ServiceCatalogCardProps = {
  image: string;
  title: string;
  description: string;
  tag: string;
};

const ServiceCatalogCard = ({
  image,
  title,
  description,
  tag,
}: ServiceCatalogCardProps) => {
  return (
    <article className="catalog-card">
      <div className="catalog-card__image">
        <img src={image} alt={title} />
      </div>

      <div className="catalog-card__content">
        <h3 className="catalog-card__title">
          {title}
        </h3>

        <p className="catalog-card__description">
          {description}
        </p>

        <span className="catalog-card__tag">
          {tag}
        </span>

        <Link
          to="/contato"
          className="catalog-card__button"
        >
          Solicitar orçamento

          <FiArrowRight />
        </Link>
      </div>
    </article>
  );
};

export default ServiceCatalogCard;