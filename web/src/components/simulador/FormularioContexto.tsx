import { useState } from "react";
import type { Clima, Contexto } from "../../services/api";
import { DIAS, DIA_LABEL, LOCAIS, REFEICOES, UFS } from "../../utils/constantes";
import { dataBR } from "../../utils/formatar";
import { CENARIOS } from "../../utils/cenarios";
import "./simulador.css";

type Props = {
  ctx: Contexto;
  clima: Clima | null;
  carregando: boolean;
  set: <K extends keyof Contexto>(k: K, v: Contexto[K]) => void;
  mudarUf: (uf: string) => void;
  mudarDia: (dia: string) => void;
  onConsultarClima: () => Promise<void>;
  onCenario: (parcial: Partial<Contexto>) => void;
};

function Chips({ opcoes, valor, onEscolher }: { opcoes: [string, string][]; valor: string; onEscolher: (v: string) => void }) {
  return (
    <div className="chips">
      {opcoes.map(([v, l]) => (
        <button key={v} type="button" className="chip" aria-pressed={v === valor} onClick={() => onEscolher(v)}>{l}</button>
      ))}
    </div>
  );
}

const num = (e: React.ChangeEvent<HTMLInputElement>) => +e.target.value;

/** Formulário em grade de duas colunas: o resultado se atualiza sozinho a cada mudança.
 *  Escolaridade (anos_estudo) não aparece aqui: segue para o modelo com o valor padrão. */
export default function FormularioContexto({ ctx, clima, carregando, set, mudarUf, mudarDia, onConsultarClima, onCenario }: Props) {
  return (
    <form className="cartao formulario" onSubmit={(e) => e.preventDefault()}>
      <div className="form-topo">
        <h3>Descreva a ocasião</h3>
        <span className="mudo pequeno">{carregando ? "Calculando…" : "Atualiza sozinho"}</span>
      </div>

      <div className="cenarios">
        <span className="rotulo">Cenários rápidos</span>
        <div className="chips">
          {CENARIOS.map((c) => (
            <button key={c.nome} type="button" className="chip cenario" onClick={() => onCenario(c.ctx)}>{c.nome}</button>
          ))}
        </div>
      </div>

      <div className="form-grade">
        <div className="form-bloco">
          <span className="rotulo">Quando</span>
          <Chips opcoes={DIAS.map((d) => [d, DIA_LABEL[d]])} valor={ctx.dia_semana} onEscolher={mudarDia} />
          <Chips opcoes={REFEICOES} valor={ctx.refeicao} onEscolher={(v) => set("refeicao", v)} />
        </div>

        <div className="form-bloco">
          <label className="campo-hora">Horário: <b>{ctx.hora}h</b>
            <input type="range" min={0} max={23} value={ctx.hora} onChange={(e) => set("hora", num(e))} />
          </label>
          <PainelClima ctx={ctx} clima={clima} onConsultar={onConsultarClima} />
        </div>

        <div className="form-bloco">
          <span className="rotulo">Onde</span>
          <Chips opcoes={LOCAIS} valor={ctx.local} onEscolher={(v) => set("local", v)} />
          <div className="form-linha">
            <label>UF
              <select value={ctx.uf} onChange={(e) => mudarUf(e.target.value)}>{UFS.map((u) => <option key={u}>{u}</option>)}</select>
            </label>
            <label>Área
              <select value={ctx.urbano} onChange={(e) => set("urbano", +e.target.value)}>
                <option value={1}>Urbana</option><option value={0}>Rural</option>
              </select>
            </label>
          </div>
        </div>

        <div className="form-bloco">
          <span className="rotulo">Quem</span>
          <div className="form-linha quem">
            <label>Idade<input type="number" min={10} max={100} value={ctx.idade} onChange={(e) => set("idade", num(e))} /></label>
            <label>Sexo
              <select value={ctx.sexo} onChange={(e) => set("sexo", e.target.value as "M" | "F")}>
                <option value="F">Feminino</option><option value="M">Masculino</option>
              </select>
            </label>
            <label>Renda por pessoa (R$)<input type="number" min={0} step={100} value={ctx.renda_pc} onChange={(e) => set("renda_pc", num(e))} /></label>
            <label>Moradores<input type="number" min={1} max={20} value={ctx.n_moradores} onChange={(e) => set("n_moradores", num(e))} /></label>
            <label>Crianças <span className="faixa">(0 a 11 anos)</span><input type="number" min={0} max={15} value={ctx.n_criancas} onChange={(e) => set("n_criancas", num(e))} /></label>
            <label>Adolescentes <span className="faixa">(12 a 17 anos)</span><input type="number" min={0} max={15} value={ctx.n_adolescentes} onChange={(e) => set("n_adolescentes", num(e))} /></label>
          </div>
        </div>
      </div>
    </form>
  );
}

/** Chuva no dia: um botão busca a previsão real (Open-Meteo) para a UF e o dia; o card toma o lugar dele.
 *  Trocar UF, dia ou cenário limpa a previsão e o botão volta. */
function PainelClima({ ctx, clima, onConsultar }: {
  ctx: Contexto; clima: Clima | null; onConsultar: () => Promise<void>;
}) {
  const [buscando, setBuscando] = useState(false);
  async function buscar() {
    setBuscando(true);
    await onConsultar();
    setBuscando(false);
  }
  const chove = clima?.chuva_prevista;

  return (
    <div className="clima">
      <span className="rotulo-campo">Chuva no dia</span>
      {!clima && (
        <button type="button" className="secundario buscar-clima" onClick={buscar} disabled={buscando}>
          {buscando ? "Consultando…" : `Ver previsão do tempo · ${ctx.uf}, ${DIA_LABEL[ctx.dia_semana].toLowerCase()}`}
        </button>
      )}

      {clima && (
        <div key={clima.data + clima.uf} className={`clima-cartao ${chove ? "chuva" : "sol"}`}>
          <IconeTempo chuva={!!chove} />
          <div className="clima-info">
            <span className="clima-data">{dataBR(clima.data)} · {clima.uf} · máx. {Math.round(clima.temp_max)}°C</span>
            <div className="clima-prob">
              <span className="clima-trilho"><span className="clima-barra" style={{ width: `${clima.prob_chuva_max}%` }} /></span>
              <b>{clima.prob_chuva_max}%</b>
            </div>
            <span className="clima-txt">
              {chove ? `Chuva prevista (${clima.chuva_mm.toFixed(1)} mm)` : "Sem chuva prevista"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function IconeTempo({ chuva }: { chuva: boolean }) {
  return chuva ? (
    <svg className="icone-tempo" viewBox="0 0 48 48" aria-hidden="true">
      <path d="M14 30a8 8 0 0 1 1-15.9A11 11 0 0 1 36 16a7 7 0 0 1-1 14z" className="nuvem" />
      <line x1="17" y1="35" x2="15" y2="41" className="gota" />
      <line x1="25" y1="35" x2="23" y2="41" className="gota g2" />
      <line x1="33" y1="35" x2="31" y2="41" className="gota g3" />
    </svg>
  ) : (
    <svg className="icone-tempo" viewBox="0 0 48 48" aria-hidden="true">
      <g className="raios">
        {Array.from({ length: 8 }, (_, i) => (
          <line key={i} x1="24" y1="4" x2="24" y2="9" transform={`rotate(${i * 45} 24 24)`} />
        ))}
      </g>
      <circle cx="24" cy="24" r="9" className="sol-disco" />
    </svg>
  );
}
