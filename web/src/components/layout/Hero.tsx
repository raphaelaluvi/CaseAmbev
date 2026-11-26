import "./layout.css";

/** Abertura: texto à esquerda e foto à direita. */
export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-conteudo">
        <div className="hero-texto">
          <p className="sobretitulo">Case Inteli Academy × Ambev</p>
          <h1>Onde a pizza reúne, Guaraná faz parte.</h1>
          <h1><span className="hero-destaque">É coisa nossa!</span></h1>
          <p className="hero-sub">
            Um modelo de machine learning estima <b>onde e quando</b> a ocasião de pizza é mais provável, mede{" "}
            <b>quanto o Guaraná já está nela</b> e recomenda <b>que tipo de ativação</b> faz sentido em cada contexto.
          </p>
        </div>
        <img className="hero-foto" src="/hero-guarana-pizza.jpg" alt="Lata de Guaraná Antarctica sobre uma pizza de pepperoni" />
      </div>
    </section>
  );
}
