import type { Oportunidades, Predicao } from "../../services/api";
import { pct } from "../../utils/formatar";
import "./layout.css";

/** Faixa azul de abertura: título, explicação e os 4 números-chave (vêm da API). */
export default function Hero({ opo, res }: { opo: Oportunidades | null; res: Predicao | null }) {
  const m = res?.model_metadata.metricas_teste;
  return (
    <section className="hero">
      <div className="hero-conteudo">
        <p className="sobretitulo">Case Inteli Academy × Ambev</p>
        <h1>Onde a pizza acontece, o Guaraná pode estar junto.</h1>
        <p className="hero-sub">
          Um modelo de machine learning estima <b>onde e quando</b> a ocasião de pizza é mais provável, mede{" "}
          <b>quanto o Guaraná já está nela</b> e recomenda <b>que tipo de ativação</b> faz sentido em cada contexto.
        </p>
        <div className="kpis">
          <Kpi valor={opo ? pct(opo.brasil.attach_refri) : "—"} texto="das pizzas vêm com refrigerante" />
          <Kpi valor={opo ? pct(opo.brasil.share_guarana) : "—"} texto="desses refrigerantes são guaraná" />
          <Kpi valor={m ? `${m["lift_top10"].toFixed(1)}×` : "—"} texto="mais pizza nos 10% de contextos que o modelo aponta" />
          <Kpi valor={m ? pct(m["recall_top10"]) : "—"} texto="das ocasiões de pizza alcançadas ativando só esses 10%" />
        </div>
      </div>
    </section>
  );
}

function Kpi({ valor, texto }: { valor: string; texto: string }) {
  return (
    <div className="kpi">
      <span className="kpi-valor">{valor}</span>
      <span className="kpi-texto">{texto}</span>
    </div>
  );
}
