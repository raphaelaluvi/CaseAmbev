import "./comum.css";

/** Cartão de achado de negócio. tom "positivo" = verde (Guaraná forte); "oportunidade" = azul. */
export default function Insight({ titulo, texto, tom }: { titulo: string; texto: string; tom: "positivo" | "oportunidade" }) {
  return (
    <div className={`insight ${tom}`}>
      <span className="insight-tag">{tom === "positivo" ? "Guaraná forte" : "Oportunidade"}</span>
      <h3>{titulo}</h3>
      <p>{texto}</p>
    </div>
  );
}
