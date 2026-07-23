import "./Testimonials.css";

const testimonials = [
  {
    text: "A LASTRO trouxe clareza para decisões que a gente vinha adiando havia meses.",
    author: "Nome do cliente",
  },
  {
    text: "Foi a primeira vez que enxerguei o fluxo de caixa da empresa organizado em um só lugar.",
    author: "Nome do cliente",
  },
  {
    text: "O acompanhamento próximo fez diferença — não foi só um relatório entregue e pronto.",
    author: "Nome do cliente",
  },
];

export default function Testimonials() {
  return (
    <section className="testimonials">
      <h2 className="testimonials__title">
        O que dizem sobre trabalhar com a <span>LASTRO</span>
      </h2>

      <div className="testimonials__container">
        {testimonials.map((item, index) => (
          <article className="testimonial-card" key={index}>
            
            <span className="testimonial-card__quote">
              ”
            </span>

            <p className="testimonial-card__text">
              {item.text}
            </p>

            <strong className="testimonial-card__author">
              {item.author}
            </strong>

          </article>
        ))}
      </div>
    </section>
  );
}