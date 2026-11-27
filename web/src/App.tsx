import { useSimulador } from "./hooks/useSimulador";
import BarraTopo from "./components/layout/BarraTopo";
import Hero from "./components/layout/Hero";
import Kpis from "./components/layout/Kpis";
import Rodape from "./components/layout/Rodape";
import Revelar from "./components/comum/Revelar";
import SecaoMapa from "./secoes/SecaoMapa";
import SecaoJobs from "./secoes/SecaoJobs";
import SecaoSimulador from "./secoes/SecaoSimulador";

/** A página inteira, de cima para baixo. Para mudar a ordem das seções, mude a ordem aqui. */
export default function App() {
  const sim = useSimulador();

  return (
    <>
      <BarraTopo />
      <Hero />
      <main className="pagina">
        <Kpis opo={sim.opo} res={sim.res} />
        <Revelar><SecaoMapa opo={sim.opo} onSimularUf={sim.selecionarUfNoMapa} /></Revelar>
        <Revelar><SecaoJobs opo={sim.opo} /></Revelar>
        <Revelar><SecaoSimulador sim={sim} /></Revelar>
      </main>
      <Rodape />
    </>
  );
}
