import { pct } from "../../utils/formatar";
import "./comum.css";

/** Barra com o valor de um grupo e um traço marcando a média Brasil. */
export default function Comparacao({ nome, v, br }: { nome: string; v: number; br: number }) {
  const max = Math.max(v, br, 0.01) * 1.15;
  return (
    <div className="comparacao">
      <div className="cab"><span>{nome}</span><b>{pct(v)}</b></div>
      <div className="trilho">
        <span className="barra" style={{ width: `${(v / max) * 100}%` }} />
        <span className="marca-br" style={{ left: `${(br / max) * 100}%` }} title={`Brasil: ${pct(br)}`} />
      </div>
      <span className="mudo pequeno">Brasil: {pct(br)}</span>
    </div>
  );
}
