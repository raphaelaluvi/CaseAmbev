import type { useSimulador } from "../hooks/useSimulador";
import CabecalhoSecao from "../components/comum/CabecalhoSecao";
import FormularioContexto from "../components/simulador/FormularioContexto";
import Resultado from "../components/simulador/Resultado";
import { DIA_LABEL, LOCAIS, REFEICOES } from "../utils/constantes";

/** Ato 3 — formulário horizontal em cima, resultado embaixo. */
export default function SecaoSimulador({ sim }: { sim: ReturnType<typeof useSimulador> }) {
  const c = sim.ctx;
  const descricao = `${DIA_LABEL[c.dia_semana]} ${c.hora}h, ${REFEICOES.find(([v]) => v === c.refeicao)?.[1].toLowerCase()}, ${LOCAIS.find(([v]) => v === c.local)?.[1].split(" (")[0].toLowerCase()}`;
  return (
    <section id="ato3" className="secao">
      <CabecalhoSecao num={3} titulo="ONDE A PIZZA ACONTECE, ONDE GUARANÁ PODE CHEGAR."
        texto="Descreva a ocasião. O score, a recomendação e o plano de campanha se atualizam sozinhos." />
      <FormularioContexto ctx={sim.ctx} clima={sim.clima} carregando={sim.carregando}
        set={sim.set} mudarUf={sim.mudarUf} mudarDia={sim.mudarDia} onConsultarClima={sim.consultarClima} onCenario={sim.aplicar} />
      <div className="resultado">
        {sim.erro && <div className="cartao erro">{sim.erro}</div>}
        {sim.res && (
          <Resultado r={sim.res} descricao={descricao} />
        )}
      </div>
    </section>
  );
}
