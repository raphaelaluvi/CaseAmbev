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
  onConsultarClima: () => void;
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

/** Formulário horizontal: o resultado se atualiza sozinho a cada mudança. */
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

      <div className="form-bloco">
        <span className="rotulo">Quando</span>
        <Chips opcoes={DIAS.map((d) => [d, DIA_LABEL[d]])} valor={ctx.dia_semana} onEscolher={mudarDia} />
        <Chips opcoes={REFEICOES} valor={ctx.refeicao} onEscolher={(v) => set("refeicao", v)} />
        <label className="campo-hora">Horário: <b>{ctx.hora}h</b>
          <input type="range" min={0} max={23} value={ctx.hora} onChange={(e) => set("hora", num(e))} />
        </label>
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
          <div className="clima">
            <button type="button" className="secundario" onClick={onConsultarClima}>Previsão do tempo</button>
            {clima && <span>{dataBR(clima.data)}: {clima.prob_chuva_max}% de chuva → <b>{clima.chuva_prevista ? "chuva prevista" : "sem chuva"}</b></span>}
          </div>
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
          <label>Anos de estudo: <b>{ctx.anos_estudo}</b>
            <input type="range" min={0} max={16} value={ctx.anos_estudo} onChange={(e) => set("anos_estudo", num(e))} />
          </label>
          <label>Moradores<input type="number" min={1} max={20} value={ctx.n_moradores} onChange={(e) => set("n_moradores", num(e))} /></label>
          <label>Crianças<input type="number" min={0} max={15} value={ctx.n_criancas} onChange={(e) => set("n_criancas", num(e))} /></label>
          <label>Adolescentes<input type="number" min={0} max={15} value={ctx.n_adolescentes} onChange={(e) => set("n_adolescentes", num(e))} /></label>
        </div>
      </div>
    </form>
  );
}
