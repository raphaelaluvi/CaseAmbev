import { useEffect, useState } from "react";
import type { Oportunidades, Predicao } from "../../services/api";
import "./layout.css";

/** Número que "conta" de 0 até o valor final (800 ms). */
function Contador({ fim, decimais = 0, sufixo = "" }: { fim: number; decimais?: number; sufixo?: string }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const t0 = performance.now();
    let id = 0;
    const passo = (t: number) => {
      const k = Math.min((t - t0) / 800, 1);
      setV(fim * (1 - (1 - k) ** 3));
      if (k < 1) id = requestAnimationFrame(passo);
    };
    id = requestAnimationFrame(passo);
    return () => cancelAnimationFrame(id);
  }, [fim]);
  return <>{v.toFixed(decimais)}{sufixo}</>;
}

/** Abertura: texto à esquerda, foto à direita e os 4 números-chave (vêm da API). */
export default function Hero({ opo, res }: { opo: Oportunidades | null; res: Predicao | null }) {
  const m = res?.model_metadata.metricas_teste;
  return (
    <section className="hero">
      <div className="hero-conteudo">
        <div className="hero-texto">
          <p className="sobretitulo">Case Inteli Academy × Ambev</p>
          <h1>Onde a pizza acontece, o Guaraná pode estar junto.</h1>
          <p className="hero-sub">
            Um modelo de machine learning estima <b>onde e quando</b> a ocasião de pizza é mais provável, mede{" "}
            <b>quanto o Guaraná já está nela</b> e recomenda <b>que tipo de ativação</b> faz sentido em cada contexto.
          </p>
        </div>
        <img className="hero-foto" src="/hero-guarana-pizza.jpg" alt="Lata de Guaraná Antarctica sobre uma pizza de pepperoni" />
        <div className="kpis">
          <Kpi texto="das pizzas vêm com refrigerante">{opo ? <Contador fim={opo.brasil.attach_refri * 100} sufixo="%" /> : "—"}</Kpi>
          <Kpi texto="desses refrigerantes são guaraná">{opo ? <Contador fim={opo.brasil.share_guarana * 100} sufixo="%" /> : "—"}</Kpi>
          <Kpi texto="mais pizza nos 10% de contextos que o modelo aponta">{m ? <Contador fim={m["lift_top10"]} decimais={1} sufixo="×" /> : "—"}</Kpi>
          <Kpi texto="das ocasiões de pizza alcançadas ativando só esses 10%">{m ? <Contador fim={m["recall_top10"] * 100} sufixo="%" /> : "—"}</Kpi>
        </div>
      </div>
    </section>
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
