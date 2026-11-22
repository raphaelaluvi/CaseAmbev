import type { useSimulador } from "../hooks/useSimulador";
import CabecalhoSecao from "../components/comum/CabecalhoSecao";
import FormularioContexto from "../components/simulador/FormularioContexto";
import Resultado from "../components/simulador/Resultado";

/** Ato 3 — o que fazer: formulário de contexto + resultado da API. */
export default function SecaoSimulador({ sim }: { sim: ReturnType<typeof useSimulador> }) {
  return (
    <section id="ato3" className="secao">
      <CabecalhoSecao num={3} titulo="O que fazer: simule um contexto"
        texto="Descreva quando, onde e para quem é a ocasião. O modelo calcula o Occasion Score, o SHAP mostra os fatores e o Decision Engine recomenda a ativação." />
      <div className="grade-simulador">
        <FormularioContexto
          ctx={sim.ctx} clima={sim.clima} carregando={sim.carregando}
          set={sim.set} mudarUf={sim.mudarUf} mudarDia={sim.mudarDia}
          onCalcular={() => sim.prever()} onConsultarClima={sim.consultarClima}
        />
        <div className="resultado">
          {sim.erro && <div className="cartao erro">{sim.erro}</div>}
          {sim.res && <Resultado r={sim.res} />}
        </div>
      </div>
    </section>
  );
}
