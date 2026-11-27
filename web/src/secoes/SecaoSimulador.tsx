import type { useSimulador } from "../hooks/useSimulador";
import CabecalhoSecao from "../components/comum/CabecalhoSecao";
import FormularioContexto from "../components/simulador/FormularioContexto";
import Resultado from "../components/simulador/Resultado";

/** Ato 3 — formulário horizontal em cima, resultado embaixo. */
export default function SecaoSimulador({ sim }: { sim: ReturnType<typeof useSimulador> }) {
  return (
    <section id="ato3" className="secao">
      <CabecalhoSecao num={3} titulo="ONDE A PIZZA ACONTECE, ONDE GUARANÁ PODE CHEGAR."
        texto="Descreva a ocasião. O score, a recomendação e o plano de campanha se atualizam sozinhos." />
      <FormularioContexto ctx={sim.ctx} clima={sim.clima} carregando={sim.carregando}
        set={sim.set} mudarUf={sim.mudarUf} mudarDia={sim.mudarDia} onConsultarClima={sim.consultarClima} onCenario={sim.aplicar} />
      <div className="resultado">
        {sim.erro && <div className="cartao erro">{sim.erro}</div>}
        {sim.res && (
          <Resultado r={sim.res} />
        )}
      </div>
    </section>
  );
}
