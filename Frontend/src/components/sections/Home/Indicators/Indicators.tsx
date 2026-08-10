import { useEffect, useState } from "react";
import "./Indicators.css";
import { getPublicIndicators } from "../../../../services/indicatorsApi";
import type { Indicator } from "../../../../types/indicator";

interface IndicatorsProps {
  theme?: "light" | "dark";
  floating?: boolean;
}

const Indicators = ({
  theme = "light",
  floating = true,
}: IndicatorsProps) => {
  const [indicators, setIndicators] = useState<Indicator[]>([]);

  useEffect(() => {
    let active = true;
    getPublicIndicators().then((data) => {
      if (active) setIndicators(data);
    }).catch(console.error);
    return () => { active = false; };
  }, []);

  return (
    <section
      className={`
        indicators
        indicators--${theme}
        ${floating ? "indicators--floating" : ""}
      `}
    >
      <div className="container">
        <div className="indicators__card">
          {indicators.map((indicator) => (
            <div
              className="indicator"
              key={indicator.id}
            >
              <h2 className="indicator__value">
                {indicator.value}
              </h2>

              <p className="indicator__title">
                {indicator.name}
              </p>

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