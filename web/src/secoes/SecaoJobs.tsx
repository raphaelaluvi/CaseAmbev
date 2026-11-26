import type { Oportunidades } from "../services/api";
import CabecalhoSecao from "../components/comum/CabecalhoSecao";
import ExploradorJobs from "../components/jobs/ExploradorJobs";

/** Ato 2 — que tipo de ocasião é (jobs) e onde o Guaraná ainda não está. */
export default function SecaoJobs({ opo, onSimularJob }: { opo: Oportunidades | null; onSimularJob: (job: string) => void }) {
  return (
    <section id="ato2" className="secao">
      <CabecalhoSecao num={2} titulo="Da ocasião à oportunidade: onde entra Guaraná?"
        texto="Agrupamos (K-means) as ocasiões de pizza da POF em jobs to be done: o “trabalho” que a pizza cumpre. Clique num achado ou num job para explorar." />

      {opo ? <ExploradorJobs opo={opo} onSimular={onSimularJob} /> : <p className="mudo">Carregando…</p>}
    </section>
  );
}
