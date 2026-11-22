import type { Clima, Contexto } from "../../services/api";
import { DIAS, DIA_LABEL, LOCAIS, REFEICOES, UFS } from "../../utils/constantes";
import { dataBR } from "../../utils/formatar";
import "./simulador.css";

type Props = {
  ctx: Contexto;
  clima: Clima | null;
  carregando: boolean;
  set: <K extends keyof Contexto>(k: K, v: Contexto[K]) => void;
  mudarUf: (uf: string) => void;
  mudarDia: (dia: string) => void;
  onCalcular: () => void;
  onConsultarClima: () => void;
};

/** Formulário do simulador: quando, onde e quem. */
export default function FormularioContexto({ ctx, clima, carregando, set, mudarUf, mudarDia, onCalcular, onConsultarClima }: Props) {
  return (
    <form className="cartao formulario" onSubmit={(e) => { e.preventDefault(); onCalcular(); }}>
      <h2>Contexto</h2>

      <fieldset>
        <legend>Quando</legend>
        <label>Dia da semana
          <select value={ctx.dia_semana} onChange={(e) => mudarDia(e.target.value)}>
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
            <select value={ctx.uf} onChange={(e) => mudarUf(e.target.value)}>
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
          <button type="button" className="secundario" onClick={onConsultarClima}>Consultar previsão do tempo</button>
          {clima && (
            <span>
              Previsão para {DIA_LABEL[ctx.dia_semana].toLowerCase()}, {dataBR(clima.data)}:{" "}
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
  );
}
