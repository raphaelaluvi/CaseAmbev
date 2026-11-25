import { useRef, useState } from "react";
import type { Oportunidades } from "../services/api";
import CabecalhoSecao from "../components/comum/CabecalhoSecao";
import MapaBrasil from "../components/mapa/MapaBrasil";
import RankingUF from "../components/mapa/RankingUF";

/** Ato 1 — mapa por UF. 1º clique fixa a ficha; 2º clique no mesmo estado leva ao simulador. */
export default function SecaoMapa({ opo, onSimularUf }: {
  opo: Oportunidades | null;
  onSimularUf: (uf: string) => void;
}) {
  const [ufFixada, setUfFixada] = useState<string | null>(null);
  const modal = useRef<HTMLDialogElement>(null);

  const clicar = (sigla: string) => (sigla === ufFixada ? onSimularUf(sigla) : setUfFixada(sigla));

  return (
    <section id="ato1" className="secao">
      <CabecalhoSecao num={1} titulo="Onde tem pizza, tem espaço para Guaraná."
        texto="Potencial = quanto a ocasião de pizza acontece × quanto falta de Guaraná. Troque a métrica para ver cada parte." />
      <div className="cartao">
        {opo?.ufs?.length ? (
          <>
            <MapaBrasil ufs={opo.ufs} selecionada={ufFixada} onSelecionar={clicar} onSimular={onSimularUf} />
            <div className="mapa-rodape">
              <span className="mudo pequeno">Clique num estado para fixar os detalhes; clique de novo para simulá-lo.</span>
              <button type="button" className="secundario" onClick={() => modal.current?.showModal()}>Ver ranking</button>
            </div>
            <dialog ref={modal} className="modal" onClick={(e) => e.target === modal.current && modal.current.close()}>
              <div className="modal-cab">
                <h3>Ranking dos 27 estados</h3>
                <button type="button" className="secundario" onClick={() => modal.current?.close()}>Fechar</button>
              </div>
              <RankingUF ufs={opo.ufs} />
            </dialog>
          </>
        ) : <p className="mudo">Carregando…</p>}
      </div>
    </section>
  );
}
