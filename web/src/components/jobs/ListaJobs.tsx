import type { Oportunidades } from "../../services/api";
import Comparacao from "../comum/Comparacao";
import "./jobs.css";

/** Um cartão por job (cluster K-means), do menor para o maior share de guaraná: a lacuna aparece primeiro. */
export default function ListaJobs({ opo }: { opo: Oportunidades }) {
  const jobs = [...opo.jobs].sort((a, b) => a.share_guarana - b.share_guarana);
  return (
    <div className="grade-jobs">
      {jobs.map((j) => (
        <div key={j.cluster} className="job">
          <h3>{j.job}</h3>
          <span className="mudo pequeno">{j.ocasioes} ocasiões de pizza na amostra</span>
          <Comparacao nome="Share de guaraná" v={j.share_guarana} br={opo.brasil.share_guarana} />
          <Comparacao nome="Attach de refrigerante" v={j.attach_refri} br={opo.brasil.attach_refri} />
        </div>
      ))}
    </div>
  );
}
