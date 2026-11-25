import "./layout.css";

/** Barra verde-escuro fixa no topo, com os links para cada seção. */
export default function BarraTopo() {
  return (
    <header className="barra-topo">
      <div className="barra-conteudo">
        <a className="marca" href="#">
          <img className="marca-logo" src="/logo.png" alt="" width="40" height="40" />
          <span>Occasion Intelligence <span className="marca-sub">Pizza + Guaraná</span></span>
        </a>
        <nav>
          <a href="#ato1">1 · Onde</a>
          <a href="#ato2">2 · O que falta</a>
          <a href="#ato3">3 · O que fazer</a>
        </nav>
      </div>
    </header>
  );
}
