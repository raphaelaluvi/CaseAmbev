import "./comum.css";

/** Título de cada ato/seção: número no círculo azul + título + texto de apoio. */
export default function CabecalhoSecao({ num, titulo, texto }: { num: number; titulo: string; texto?: string }) {
  return (
    <div className="secao-cab">
      <span className="secao-num" aria-hidden="true">{num}</span>
      <div>
        <h2>{titulo}</h2>
        {texto && <p className="sub">{texto}</p>}
      </div>
    </div>
  );
}
