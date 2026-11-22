import { useState } from "react";
import type { Oportunidades } from "../services/api";
import CabecalhoSecao from "../components/comum/CabecalhoSecao";
import MapaBrasil from "../components/mapa/MapaBrasil";
import RankingUF from "../components/mapa/RankingUF";

/** Ato 1 — onde a ocasião de pizza acontece e onde falta Guaraná (mapa por UF).
 *  1º clique num estado: destaca e fixa a ficha ao lado. 2º clique no mesmo estado: leva ao simulador. */
export default function SecaoMapa({ opo, onSimularUf }: {
  opo: Oportunidades | null;
  onSimularUf: (uf: string) => void;
}) {
  const [ufFixada, setUfFixada] = useState<string | null>(null);

  const clicar = (sigla: string) => {
    if (sigla === ufFixada) onSimularUf(sigla); // segundo clique
    else setUfFixada(sigla); // primeiro clique
  };

  return (
    <section id="ato1" className="secao">
      <CabecalhoSecao num={1} titulo="Onde a ocasião de pizza acontece — e onde falta Guaraná"
        texto="Potencial de cada estado = quanto a ocasião de pizza acontece (score médio do modelo) × quanto falta de Guaraná (share Brasil ÷ share da região). É uma regra documentada aplicada ao território, não uma nova previsão." />
      <div className="cartao">
        {opo?.ufs?.length ? (
          <>
            <MapaBrasil ufs={opo.ufs} selecionada={ufFixada} onSelecionar={clicar} onSimular={onSimularUf} />
            <p className="mudo pequeno dica">Clique num estado para fixar os detalhes; clique de novo para simulá-lo no ato 3.</p>
            <details className="detalhes">
              <summary>Ver o ranking completo dos 27 estados</summary>
              <RankingUF ufs={opo.ufs} />
            </details>
          </>
        ) : <p className="mudo">Carregando…</p>}
      </div>
    </section>
  );
}
