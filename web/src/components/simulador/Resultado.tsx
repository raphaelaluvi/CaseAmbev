import type { Predicao } from "../../services/api";
import Contador from "../comum/Contador";
import { CLASSE_LABEL } from "../../utils/constantes";
import Comparacao from "../comum/Comparacao";
import IconeCanal from "../comum/IconeCanal";
import "./simulador.css";

/** Resultado enxuto: placar, recomendação, plano de campanha e contexto de Guaraná. */
export default function Resultado({ r, children }: { r: Predicao; children?: React.ReactNode }) {
  return (
    <>
      <div className="resultado-topo">
        <PlacarScore r={r} />
        <Recomendacao r={r} />
      </div>
      {children}
      {r.briefing && <Briefing r={r} />}
      <div className="grade-2">
        <div className="cartao">
          <span className="rotulo">Job provável</span>
          {r.job ? <h3>{r.job.nome}</h3> : <p className="mudo">Não se aplica: pizza pouco provável neste contexto.</p>}
        </div>
        <div className="cartao">
          <span className="rotulo">Guaraná no segmento · {r.segmento.regiao}, faixa {r.segmento.classe_renda}</span>
          <Comparacao nome="Share de guaraná" v={r.segmento.share_guarana} br={r.segmento.brasil.share_guarana} />
        </div>
      </div>
    </>
  );
}

/** Posição (0-100) do marcador no termômetro: baixa < taxa base < média < limiar < alta. */
function posicao(r: Predicao) {
  const { taxa_base: t, limiar_alta: l } = r.model_metadata;
  const s = r.occasion_score;
  if (s < t) return (s / t) * 33;
  if (s < l) return 33 + ((s - t) / (l - t)) * 33;
  return 66 + Math.min((s - l) / l, 1) * 34;
}

function PlacarScore({ r }: { r: Predicao }) {
  return (
    <div className="cartao destaque">
      <span className="rotulo">Occasion Score</span>
      <div className="placar-linha">
        <span className="numero"><Contador fim={r.occasion_score_pct} decimais={2} sufixo="%" /></span>
        <span className={`selo ${r.classification}`}>{CLASSE_LABEL[r.classification]}</span>
      </div>
      <div className="termometro" aria-hidden="true">
        <span className="termo-marca" style={{ left: `${posicao(r)}%` }} />
      </div>
      <div className="termo-txt"><span>baixa</span><span>média</span><span>alta</span></div>
      <span className="mudo pequeno">{r.lift.toFixed(1)}× a média Brasil</span>
    </div>
  );
}

function Recomendacao({ r }: { r: Predicao }) {
  return (
    <div className="cartao recomendacao">
      <div className="reco-cab">
        {r.briefing && <IconeCanal canal={r.briefing.canal} tamanho={44} />}
        <div>
          <span className="rotulo">Recomendação · regra {r.rule_fired}</span>
          <h3>{r.recommendation_label}</h3>
        </div>
      </div>
      <div className="chips-fatores">
        {r.top_factors.slice(0, 3).map((f) => (
          <span key={f.variavel} className={`fator ${f.direcao}`} title={`SHAP ${f.impacto.toFixed(2)}`}>
            {f.direcao === "aumenta" ? "▲" : "▼"} {f.fator}: {String(f.valor)}
          </span>
        ))}
      </div>
      <div className="porque">
        <span className="rotulo">Por quê?</span>
        <p>{r.recommendation_reason}</p>
      </div>
    </div>
  );
}

function Briefing({ r }: { r: Predicao }) {
  const b = r.briefing!;
  return (
    <div className="briefing">
      <div className="briefing-cab"><h3>Plano de campanha</h3><span className="mudo pequeno">{b.aviso}</span></div>
      <div className="briefing-grade">
        {b.cartoes.map((c) => (
          <div key={c.titulo} className="briefing-cartao">
            <span className="rotulo">{c.titulo}</span>
            <p>{c.valor}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
