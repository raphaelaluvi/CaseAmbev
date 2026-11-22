import type { Predicao } from "../../services/api";
import { pct } from "../../utils/formatar";
import "./metodo.css";

/** Métricas do modelo no teste final (vêm de models/metadata.json, via API). */
export default function Metricas({ r }: { r: Predicao }) {
  const m = r.model_metadata.metricas_teste;
  return (
    <div className="metricas">
      <div><span className="rotulo">PR-AUC (teste)</span><b>{m["PR-AUC"].toFixed(3)}</b><span className="mudo pequeno">taxa base {pct(r.model_metadata.taxa_base, 2)}</span></div>
      <div><span className="rotulo">ROC-AUC</span><b>{m["ROC-AUC"].toFixed(3)}</b></div>
      <div><span className="rotulo">Lift no top 10%</span><b>{m["lift_top10"].toFixed(1)}×</b></div>
      <div><span className="rotulo">Pizzas cobertas no top 10%</span><b>{pct(m["recall_top10"])}</b></div>
    </div>
  );
}
