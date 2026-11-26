import type { Oportunidades, Predicao } from "../../services/api";
import Contador from "../comum/Contador";
import "./layout.css";

/** Os 4 números-chave, logo abaixo da abertura, sobre o fundo bege da página (vêm da API). */
export default function Kpis({ opo }: { opo: Oportunidades | null; res: Predicao | null }) {
  return (
    <div className="kpis">
      <Kpi texto="das pizzas vêm com refrigerante">{opo ? <Contador fim={opo.brasil.attach_refri * 100} sufixo="%" /> : "—"}</Kpi>
      <Kpi texto="desses refrigerantes são guaraná">{opo ? <Contador fim={opo.brasil.share_guarana * 100} sufixo="%" /> : "—"}</Kpi>
    </div>
  );
}

function Kpi({ texto, children }: { texto: string; children: React.ReactNode }) {
  return (
    <div className="kpi">
      <span className="kpi-valor">{children}</span>
      <span className="kpi-texto">{texto}</span>
    </div>
  );
}
