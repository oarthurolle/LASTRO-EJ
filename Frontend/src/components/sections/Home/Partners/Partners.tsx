import "./Partners.css";

import { useCallback, useEffect, useState } from "react";

import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

import { ChevronLeft, ChevronRight } from "lucide-react";

import PartnerCard from "./PartnerCard";
import { partnersMock } from "./partners.mock";

const autoplay = Autoplay({
  delay: 3500,
  stopOnInteraction: false,
  stopOnMouseEnter: true,
});

const Partners = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "start",
      dragFree: false,
    },
    [autoplay]
  );

  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollSnaps = emblaApi?.scrollSnapList() ?? [];

  const scrollPrev = useCallback(() => {
    emblaApi?.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    emblaApi?.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback(
    (index: number) => {
      emblaApi?.scrollTo(index);
    },
    [emblaApi]
  );

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };

    onSelect();

    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);

    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi]);

  return (
    <section className="partners">
      <div className="container">
        <span className="partners__subtitle">
          PARCEIROS
        </span>

        <h2 className="partners__title">
          Conheça nossos parceiros
        </h2>

        <div className="partners__wrapper">
          <button
            className="partners__arrow partners__arrow--left"
            onClick={scrollPrev}
            aria-label="Anterior"
          >
            <ChevronLeft size={26} />
          </button>

          <div
            className="partners__embla"
            ref={emblaRef}
          >
            <div className="partners__container">
              {partnersMock.map((partner) => (
                <div
                  key={partner.id}
                  className="partners__slide"
                >
                  <PartnerCard partner={partner} />
                </div>
              ))}
            </div>
          </div>

          <button
            className="partners__arrow partners__arrow--right"
            onClick={scrollNext}
            aria-label="Próximo"
          >
            <ChevronRight size={26} />
          </button>
        </div>

        <div className="partners__dots">
          {scrollSnaps.map((_, index) => (
            <button
              key={index}
              className={`partners__dot ${
                index === selectedIndex
                  ? "partners__dot--active"
                  : ""
              }`}
              onClick={() => scrollTo(index)}
              aria-label={`Ir para slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Partners;