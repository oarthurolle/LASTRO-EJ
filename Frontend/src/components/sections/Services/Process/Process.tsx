import "./Process.css";

export default function Process() {
  return (
    <section className="process">
      <div className="container">

        <div className="process__card">

          <div className="process__item">

            <div className="process__number">
              1
            </div>
            <div className="process__content">

              <h3>Diagnóstico gratuito</h3>

              <p>
                Entendemos seu momento e sua necessidade em uma conversa
                inicial, sem custo.
              </p>

            </div>

          </div>

          <div className="process__divider"></div>

          <div className="process__item">

            <div className="process__number">
              2
            </div>

            <div className="process__content">

              <h3>Proposta sob medida</h3>

              <p>
                Você recebe um escopo claro, com prazo e investimento
                definidos antes de começar.
              </p>

            </div>

          </div>

          <div className="process__divider"></div>

          <div className="process__item">

            <div className="process__number">
              3
            </div>

            <div className="process__content">

              <h3>Execução acompanhada</h3>

              <p>
                Entregamos com acompanhamento próximo até o resultado
                combinado.
              </p>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}