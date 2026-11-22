import type { UFOportunidade } from "../../services/api";
import { pct } from "../../utils/formatar";
import "./mapa.css";

/** Tabela com os 27 estados ordenados pelo potencial. */
export default function RankingUF({ ufs }: { ufs: UFOportunidade[] }) {
  const max = Math.max(...ufs.map((u) => u.potencial));
  return (
    <div className="tabela-rolagem">
      <table className="ranking">
        <thead>
          <tr><th>#</th><th>UF</th><th>Região</th><th className="col-barra">Potencial</th><th>Lift médio</th><th>Share guaraná (região)</th><th>Pizzarias / 100 mil</th><th>Canal sugerido</th></tr>
        </thead>
        <tbody>
          {ufs.map((u) => (
            <tr key={u.sigla}>
              <td className="mudo">{u.ranking}</td>
              <td><b>{u.sigla}</b></td>
              <td>{u.regiao}</td>
              <td className="col-barra">
                <span className="trilho"><span className="barra" style={{ width: `${(u.potencial / max) * 100}%` }} /></span>
                <span className="num">{u.potencial.toFixed(2)}</span>
              </td>
              <td className="num">{u.lift_medio.toFixed(2)}×</td>
              <td className="num">{pct(u.share_guarana_regiao)}</td>
              <td className="num">{u.pizzarias_100k.toFixed(1)}</td>
              <td>{u.canal_sugerido}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
