import "./comum.css";

const ARQUIVOS = { casa: "/icone-casa.png", delivery: "/icone-delivery.png", ponto: "/icone-ponto.svg" };

/** Ícone do canal, pintado com a cor do texto ao redor (via máscara CSS). */
export default function IconeCanal({ canal, tamanho = 40 }: { canal: keyof typeof ARQUIVOS; tamanho?: number }) {
  const url = `url(${ARQUIVOS[canal]})`;
  return (
    <span className="icone-canal" aria-hidden="true"
      style={{ width: tamanho, height: tamanho, WebkitMaskImage: url, maskImage: url }} />
  );
}
