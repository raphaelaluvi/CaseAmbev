import type { Oportunidades } from "../services/api";
import CabecalhoSecao from "../components/comum/CabecalhoSecao";
import Insight from "../components/comum/Insight";
import ListaJobs from "../components/jobs/ListaJobs";

/** Ato 2 — que tipo de ocasião é (jobs) e onde o Guaraná ainda não está. */
export default function SecaoJobs({ opo }: { opo: Oportunidades | null }) {
  return (
    <section id="ato2" className="secao">
      <CabecalhoSecao num={2} titulo="Que tipo de ocasião é — e onde o Guaraná ainda não está"
        texto="Agrupamos (K-means) as ocasiões de pizza da POF em jobs to be done: o “trabalho” que a pizza cumpre. A barra mostra quantos dos refrigerantes de cada job são guaraná; o traço escuro é a média Brasil." />

      {/* achados dos notebooks 02 e 04 */}
      <div className="insights">
        <Insight tom="positivo" titulo="Famílias com criança já escolhem guaraná"
          texto="Em ocasiões com criança, o guaraná tem cerca do dobro do share das ocasiões sem criança (41% × 19%)." />
        <Insight tom="oportunidade" titulo="Ocasiões de adultos são a lacuna"
          texto="Pizza fora de casa com amigos e pizza em casa no meio da semana têm os menores shares: espaço para awareness." />
        <Insight tom="oportunidade" titulo="Mais pizza, menos guaraná nas faixas de renda mais altas"
          texto="O quintil de renda mais alto come mais pizza, mas tem o menor share de guaraná (~17%) — o oposto do que o TAPI relata nos dados internos." />
      </div>

      <div className="cartao">
        {opo ? <ListaJobs opo={opo} /> : <p className="mudo">Carregando…</p>}
      </div>
    </section>
  );
}
