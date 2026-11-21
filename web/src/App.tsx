import { useEffect, useState } from "react";
import { api, type Clima, type Contexto, type Oportunidades, type Predicao } from "./api";
import "./App.css";

const DIAS = ["Segunda-Feira", "Terca-Feira", "Quarta-Feira", "Quinta-Feira", "Sexta-Feira", "Sabado", "Domingo"];
const DIA_LABEL: Record<string, string> = {
  "Segunda-Feira": "Segunda", "Terca-Feira": "Terça", "Quarta-Feira": "Quarta", "Quinta-Feira": "Quinta",
  "Sexta-Feira": "Sexta", Sabado: "Sábado", Domingo: "Domingo",
};
const REFEICOES: [string, string][] = [
  ["cafe", "Café da manhã"], ["almoco", "Almoço"], ["lanche", "Lanche"], ["jantar", "Jantar"], ["ceia", "Ceia"], ["outra", "Outra"],
];
const LOCAIS: [string, string][] = [
  ["casa", "Em casa (inclui delivery)"], ["restaurante", "Restaurante"], ["lanchonete", "Lanchonete / fast food"],
  ["fora_outros", "Fora de casa — outros"], ["rest_quilo", "Restaurante por quilo"], ["ambulante", "Ambulante"],
];
const UFS = ["AC", "AL", "AM", "AP", "BA", "CE", "DF", "ES", "GO", "MA", "MG", "MS", "MT", "PA", "PB", "PE", "PI", "PR", "RJ", "RN", "RO", "RR", "RS", "SC", "SE", "SP", "TO"];

const PADRAO: Contexto = {
  dia_semana: "Sexta-Feira", hora: 20, refeicao: "jantar", local: "casa", uf: "SP", urbano: 1, idade: 32, sexo: "F",
  anos_estudo: 12, renda_pc: 1500, n_moradores: 4, n_criancas: 1, n_adolescentes: 0, chuva_prevista: null,
};

const pct = (v: number, d = 0) => `${(v * 100).toFixed(d)}%`;
const CLASSE_LABEL = { alta: "Propensão alta", media: "Propensão média", baixa: "Propensão baixa" };

export default function App() {
  const [ctx, setCtx] = useState<Contexto>(PADRAO);
  const [res, setRes] = useState<Predicao | null>(null);
  const [opo, setOpo] = useState<Oportunidades | null>(null);
  const [clima, setClima] = useState<Clima | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  const set = <K extends keyof Contexto>(k: K, v: Contexto[K]) => setCtx((c) => ({ ...c, [k]: v }));

  async function prever(c: Contexto = ctx) {
    setCarregando(true);
    setErro(null);
    try {
      setRes(await api.predict(c));
    } catch (e) {
      setErro(`Não foi possível falar com a API (${String(e)}). Ela está rodando em localhost:8000?`);
    } finally {
      setCarregando(false);
    }
  }

  async function consultarClima() {
    try {
      const c = await api.clima(ctx.uf, ctx.dia_semana);
      setClima(c);
      const novo = { ...ctx, chuva_prevista: c.chuva_prevista };
      setCtx(novo);
      prever(novo);
    } catch (e) {
      setErro(`Previsão do tempo indisponível: ${String(e)}`);
    }
  }

  useEffect(() => {
    prever(PADRAO);
    api.oportunidades().then(setOpo).catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="pagina">
      <header className="topo">
        <div>
          <p className="sobretitulo">Occasion Intelligence</p>
          <h1>Pizza + Guaraná</h1>
          <p className="sub">
            Estima a propensão de um contexto para a ocasião de pizza, mede quanto o Guaraná já está nela e recomenda o tipo de ativação.
          </p>
        </div>
        <nav>
          <a href="#simulador">Simulador</a>
          <a href="#mapa">Mapa de oportunidade</a>
          <a href="#jobs">Jobs</a>
          <a href="#metodo">Como funciona</a>
        </nav>
      </header>

      {/* ------------------------------------------------ SIMULADOR */}
      <section id="simulador" className="grade-simulador">
        <form
          className="cartao formulario"
          onSubmit={(e) => {
            e.preventDefault();
            prever();
          }}
        >
          <h2>Contexto</h2>
          <fieldset>
            <legend>Quando</legend>
            <label>Dia da semana
              <select value={ctx.dia_semana} onChange={(e) => { set("dia_semana", e.target.value); setClima(null); set("chuva_prevista", null); }}>
                {DIAS.map((d) => <option key={d} value={d}>{DIA_LABEL[d]}</option>)}
              </select>
            </label>
            <label>Horário: <b>{ctx.hora}h</b>
              <input type="range" min={0} max={23} value={ctx.hora} onChange={(e) => set("hora", +e.target.value)} />
            </label>
            <label>Refeição
              <select value={ctx.refeicao} onChange={(e) => set("refeicao", e.target.value)}>
                {REFEICOES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </label>
          </fieldset>

          <fieldset>
            <legend>Onde</legend>
            <label>Canal / local
              <select value={ctx.local} onChange={(e) => set("local", e.target.value)}>
                {LOCAIS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </label>
            <div className="linha">
              <label>UF
                <select value={ctx.uf} onChange={(e) => { set("uf", e.target.value); setClima(null); set("chuva_prevista", null); }}>
                  {UFS.map((u) => <option key={u}>{u}</option>)}
                </select>
              </label>
              <label>Área
                <select value={ctx.urbano} onChange={(e) => set("urbano", +e.target.value)}>
                  <option value={1}>Urbana</option>
                  <option value={0}>Rural</option>
                </select>
              </label>
            </div>
            <div className="clima">
              <button type="button" className="secundario" onClick={consultarClima}>Consultar previsão do tempo</button>
              {clima && (
                <span>
                  Previsão para {DIA_LABEL[ctx.dia_semana].toLowerCase()}, {clima.data.split("-").reverse().join("/")}:{" "}
                  {clima.prob_chuva_max}% de chance de chuva, máx. {clima.temp_max}°C →{" "}
                  <b>{clima.chuva_prevista ? "chuva prevista" : "sem chuva relevante"}</b>
                </span>
              )}
            </div>
          </fieldset>

          <fieldset>
            <legend>Quem</legend>
            <div className="linha">
              <label>Idade<input type="number" min={10} max={100} value={ctx.idade} onChange={(e) => set("idade", +e.target.value)} /></label>
              <label>Sexo
                <select value={ctx.sexo} onChange={(e) => set("sexo", e.target.value as "M" | "F")}>
                  <option value="F">Feminino</option>
                  <option value="M">Masculino</option>
                </select>
              </label>
            </div>
            <label>Renda familiar por pessoa (R$/mês, valores de 2018)
              <input type="number" min={0} step={100} value={ctx.renda_pc} onChange={(e) => set("renda_pc", +e.target.value)} />
            </label>
            <label>Anos de estudo: <b>{ctx.anos_estudo}</b>
              <input type="range" min={0} max={16} value={ctx.anos_estudo} onChange={(e) => set("anos_estudo", +e.target.value)} />
            </label>
            <div className="linha tres">
              <label>Moradores<input type="number" min={1} max={20} value={ctx.n_moradores} onChange={(e) => set("n_moradores", +e.target.value)} /></label>
              <label>Crianças<input type="number" min={0} max={15} value={ctx.n_criancas} onChange={(e) => set("n_criancas", +e.target.value)} /></label>
              <label>Adolescentes<input type="number" min={0} max={15} value={ctx.n_adolescentes} onChange={(e) => set("n_adolescentes", +e.target.value)} /></label>
            </div>
          </fieldset>
          <button type="submit" disabled={carregando}>{carregando ? "Calculando…" : "Calcular Occasion Score"}</button>
        </form>

        <div className="resultado">
          {erro && <div className="cartao erro">{erro}</div>}
          {res && <Resultado r={res} />}
        </div>
      </section>

      {/* ------------------------------------------------ MAPA */}
      <section id="mapa" className="cartao">
        <h2>Mapa de oportunidade por UF</h2>
        <p className="sub">
          Potencial = quanto a ocasião acontece na UF (lift médio do Occasion Score) × quanto falta de Guaraná (share Brasil ÷ share da região).
          É uma regra documentada aplicada ao território, não uma nova previsão.
        </p>
        {opo?.ufs?.length ? <RankingUF ufs={opo.ufs} /> : <p className="mudo">Carregando…</p>}
      </section>

      {/* ------------------------------------------------ JOBS */}
      <section id="jobs" className="cartao">
        <h2>Jobs to be done da pizza</h2>
        <p className="sub">
          Clusters (K-means) das ocasiões de pizza na POF, lidos como “o trabalho” que a pizza cumpre. A barra mostra o share de guaraná entre os refrigerantes de cada job.
        </p>
        {opo ? <Jobs opo={opo} /> : <p className="mudo">Carregando…</p>}
      </section>

      {/* ------------------------------------------------ MÉTODO */}
      <section id="metodo" className="cartao metodo">
        <h2>Como funciona</h2>
        <ol className="fluxo">
          <li><b>Dados</b><span>POF 2017-18 (IBGE): 363 mil ocasiões de consumo; + SIDRA e OpenStreetMap por UF</span></li>
          <li><b>Modelo</b><span>LightGBM prevê P(pizza | contexto) → Occasion Score</span></li>
          <li><b>Explicação</b><span>SHAP mostra os fatores de cada previsão</span></li>
          <li><b>Jobs e marca</b><span>K-means + attach de refrigerante e share de guaraná por segmento</span></li>
          <li><b>Decision Engine</b><span>Regras R1–R6 documentadas → categoria de ativação</span></li>
        </ol>
        {res && <Metricas r={res} />}
        <h3>Limitações</h3>
        <ul className="limites">
          <li>A POF não identifica a marca: “refrigerante de guaraná” é a categoria, não Guaraná Antarctica.</li>
          <li>Dados de 2017-18 e sem data (só dia da semana): sem validação temporal; clima entra como regra, não como feature aprendida.</li>
          <li>“Em casa” mistura delivery, congelado e preparo próprio.</li>
          <li>O sistema não afirma causalidade: recomenda onde ativar, não garante quanto vai vender.</li>
        </ul>
      </section>
      <footer>Case Inteli Academy × Ambev · Fontes: IBGE (POF 2017-2018, SIDRA), OpenStreetMap, Open-Meteo</footer>
    </div>
  );
}

function Resultado({ r }: { r: Predicao }) {
  const maxImp = Math.max(...r.top_factors.map((f) => Math.abs(f.impacto)), 0.01);
  return (
    <>
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
          <span className="rotulo">Guaraná no segmento · {r.segmento.regiao}, classe {r.segmento.classe_renda}</span>
          <Comparacao nome="Attach de refrigerante" v={r.segmento.attach_refri} br={r.segmento.brasil.attach_refri} />
          <Comparacao nome="Share de guaraná" v={r.segmento.share_guarana} br={r.segmento.brasil.share_guarana} />
        </div>
      </div>
    </>
  );
}

function Comparacao({ nome, v, br }: { nome: string; v: number; br: number }) {
  const max = Math.max(v, br, 0.01) * 1.15;
  return (
    <div className="comparacao">
      <div className="cab"><span>{nome}</span><b>{pct(v)}</b></div>
      <div className="trilho">
        <span className="barra seg" style={{ width: `${(v / max) * 100}%` }} />
        <span className="marca-br" style={{ left: `${(br / max) * 100}%` }} title={`Brasil: ${pct(br)}`} />
      </div>
      <span className="mudo pequeno">Brasil: {pct(br)}</span>
    </div>
  );
}

function RankingUF({ ufs }: { ufs: Oportunidades["ufs"] }) {
  const max = Math.max(...ufs.map((u) => u.potencial));
  return (
    <div className="tabela-rolagem">
      <table className="ranking">
        <thead>
          <tr><th>#</th><th>UF</th><th>Região</th><th className="col-barra">Potencial</th><th>Lift médio</th><th>Share guaraná (região)</th><th>Pizzarias / 100 mil</th><th>Canal sugerido</th></tr>
        </thead>
        <tbody>
          {ufs.map((u) => (
            <tr key={u.sigla}>
              <td className="mudo">{u.ranking}</td>
              <td><b>{u.sigla}</b></td>
              <td>{u.regiao}</td>
              <td className="col-barra">
                <span className="trilho"><span className="barra seg" style={{ width: `${(u.potencial / max) * 100}%` }} /></span>
                <span className="num">{u.potencial.toFixed(2)}</span>
              </td>
              <td className="num">{u.lift_medio.toFixed(2)}×</td>
              <td className="num">{pct(u.share_guarana_regiao)}</td>
              <td className="num">{u.pizzarias_100k.toFixed(1)}</td>
              <td>{u.canal_sugerido}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Jobs({ opo }: { opo: Oportunidades }) {
  const jobs = [...opo.jobs].sort((a, b) => b.ocasioes - a.ocasioes);
  return (
    <div className="grade-jobs">
      {jobs.map((j) => (
        <div key={j.cluster} className="job">
          <h3>{j.job}</h3>
          <span className="mudo pequeno">{j.ocasioes} ocasiões de pizza na amostra</span>
          <Comparacao nome="Share de guaraná" v={j.share_guarana} br={opo.brasil.share_guarana} />
          <Comparacao nome="Attach de refrigerante" v={j.attach_refri} br={opo.brasil.attach_refri} />
        </div>
      ))}
    </div>
  );
}

function Metricas({ r }: { r: Predicao }) {
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
