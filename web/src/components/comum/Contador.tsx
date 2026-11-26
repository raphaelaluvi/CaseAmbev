import { useEffect, useRef, useState } from "react";

/** Número que "conta" de 0 até o valor final (800 ms). */
export default function Contador({ fim, decimais = 0, sufixo = "" }: { fim: number; decimais?: number; sufixo?: string }) {
  const [v, setV] = useState(0);
  const ultimo = useRef(0);
  useEffect(() => {
    const inicio = ultimo.current;
    const t0 = performance.now();
    let id = 0;
    const passo = (t: number) => {
      const k = Math.min((t - t0) / 800, 1);
      const atual = inicio + (fim - inicio) * (1 - (1 - k) ** 3);
      ultimo.current = atual;
      setV(atual);
      if (k < 1) id = requestAnimationFrame(passo);
    };
    id = requestAnimationFrame(passo);
    return () => cancelAnimationFrame(id);
  }, [fim]);
  return <>{v.toFixed(decimais)}{sufixo}</>;
}
