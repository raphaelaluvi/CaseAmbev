import "./layout.css";

/** Barra azul-marinho fixa no topo, com os links para cada seção. */
export default function BarraTopo() {
  return (
    <header className="barra-topo">
      <div className="barra-conteudo">
        <span className="marca">Occasion Intelligence <span className="marca-sub">Pizza + Guaraná</span></span>
        <nav>
          <a href="#ato1">1 · Onde</a>
          <a href="#ato2">2 · O que falta</a>
          <a href="#ato3">3 · O que fazer</a>
        </nav>
      </div>
    </header>
  );
}
