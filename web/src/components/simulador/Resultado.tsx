import type { Predicao } from "../../services/api";
import { CLASSE_LABEL } from "../../utils/constantes";
import { pct } from "../../utils/formatar";
import Comparacao from "../comum/Comparacao";
import "./simulador.css";

/** Tudo o que a API devolve para um contexto: score, recomendação, fatores, job e Guaraná no segmento. */
export default function Resultado({ r }: { r: Predicao }) {
  return (
    <>
      <PlacarScore r={r} />
      <Recomendacao r={r} />
      <Fatores r={r} />
      <div className="grade-2">
        <div className="cartao">
          <span className="rotulo">Job provável</span>
          {!r.job && <p className="mudo">Não se aplica: a ocasião de pizza é pouco provável neste contexto.</p>}
          {r.job && <h3>{r.job.nome}</h3>}
          {r.job?.share_guarana !== undefined && (
            <p className="mudo">Neste job, o guaraná é {pct(r.job.share_guarana)} dos refrigerantes da pizza.</p>
          )}
        </div>
        <div className="cartao">
          <span className="rotulo">Guaraná no segmento · {r.segmento.regiao}, faixa de renda {r.segmento.classe_renda} (quintil)</span>
          <Comparacao nome="Attach de refrigerante" v={r.segmento.attach_refri} br={r.segmento.brasil.attach_refri} />
          <Comparacao nome="Share de guaraná" v={r.segmento.share_guarana} br={r.segmento.brasil.share_guarana} />
        </div>
      </div>
    </>
  );
}

/** Cartão azul-marinho com o Occasion Score e o lift. */
function PlacarScore({ r }: { r: Predicao }) {
  return (
    <div className="cartao destaque">
      <div className="score">
        <span className="rotulo">Occasion Score</span>
        <span className="numero">{r.occasion_score_pct.toFixed(2)}%</span>
        <span className="mudo">chance de a ocasião ter pizza</span>
      </div>
      <div className="score">
        <span className="rotulo">Lift vs. média Brasil</span>
        <span className="numero">{r.lift.toFixed(1)}×</span>
        <span className={`selo ${r.classification}`}>{CLASSE_LABEL[r.classification]}</span>
      </div>
    </div>
  );
}

/** Recomendação do Decision Engine, com a justificativa e as ações complementares. */
function Recomendacao({ r }: { r: Predicao }) {
  return (
    <div className="cartao recomendacao">
      <span className="rotulo">Recomendação · regra {r.rule_fired}</span>
      <h3>{r.recommendation_label}</h3>
      <p>{r.recommendation_reason}</p>
      {r.acoes_complementares.length > 0 && (
        <>
          <span className="rotulo">Também se aplica</span>
          <ul>
            {r.acoes_complementares.map((a) => <li key={a.categoria}><b>{a.label}</b> — {a.motivo}</li>)}
          </ul>
        </>
      )}
    </div>
  );
}

/** Os fatores do SHAP que mais empurraram o score para cima ou para baixo. */
function Fatores({ r }: { r: Predicao }) {
  const maxImp = Math.max(...r.top_factors.map((f) => Math.abs(f.impacto)), 0.01);
  return (
    <div className="cartao">
      <span className="rotulo">Principais fatores do score (SHAP)</span>
      <ul className="fatores">
        {r.top_factors.map((f) => (
          <li key={f.variavel} title={`contribuição ${f.impacto.toFixed(3)} (log-odds)`}>
            <span className="nome">{f.fator} <span className="mudo">= {String(f.valor)}</span></span>
            <span className="trilho">
              <span className={`barra ${f.direcao}`} style={{ width: `${(Math.abs(f.impacto) / maxImp) * 100}%` }} />
            </span>
            <span className="valor">{f.direcao === "aumenta" ? "▲ aumenta" : "▼ reduz"}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
