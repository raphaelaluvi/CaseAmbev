import { useSimulador } from "./hooks/useSimulador";
import BarraTopo from "./components/layout/BarraTopo";
import Hero from "./components/layout/Hero";
import Rodape from "./components/layout/Rodape";
import SecaoMapa from "./secoes/SecaoMapa";
import SecaoJobs from "./secoes/SecaoJobs";
import SecaoSimulador from "./secoes/SecaoSimulador";

/** A página inteira, de cima para baixo. Para mudar a ordem das seções, mude a ordem aqui. */
export default function App() {
  const sim = useSimulador();

  return (
    <>
      <BarraTopo />
      <Hero opo={sim.opo} res={sim.res} />
      <main className="pagina">
        <SecaoMapa opo={sim.opo} onSimularUf={sim.selecionarUfNoMapa} />
        <SecaoJobs opo={sim.opo} />
        <SecaoSimulador sim={sim} />
      </main>
      <Rodape />
    </>
  );
}
