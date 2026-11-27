import type { Oportunidades } from "../services/api";
import CabecalhoSecao from "../components/comum/CabecalhoSecao";
import ExploradorJobs from "../components/jobs/ExploradorJobs";

/** Ato 2 — que tipo de ocasião é (jobs) e onde o Guaraná ainda não está. */
export default function SecaoJobs({ opo }: { opo: Oportunidades | null }) {
  return (
    <section id="ato2" className="secao">
      <CabecalhoSecao num={2} titulo="Da ocasião à oportunidade: onde entra Guaraná?"
        texto="As ocasiões de consumo de pizza foram agrupadas pelo algoritmo K-means, revelando diferentes Jobs to Be Done. Clique em um achado ou job para explorar." />

      {opo ? <ExploradorJobs opo={opo} /> : <p className="mudo">Carregando…</p>}
    </section>
  );
}
