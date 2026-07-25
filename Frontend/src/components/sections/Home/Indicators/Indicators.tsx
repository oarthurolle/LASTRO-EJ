import "./Indicators.css";
import { indicators } from "./data";

const Indicators = () => {
  return (
    <section className="indicators">
      <div className="container">
        <div className="indicators__card">
          {indicators.map((indicator) => (
            <div className="indicator" key={indicator.id}>
              <h2 className="indicator__value">{indicator.value}</h2>

              <p className="indicator__title">{indicator.name}</p>

              {indicator.description && (
                <p className="indicator__description">
                  {indicator.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Indicators;