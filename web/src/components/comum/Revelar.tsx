import { useEffect, useRef, useState } from "react";
import "./comum.css";

/** Faz o conteúdo aparecer (subindo e surgindo) quando entra na tela. */
export default function Revelar({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => e.isIntersecting && (setVisivel(true), obs.disconnect()), { threshold: 0.08 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return <div ref={ref} className={`revelar ${visivel ? "visivel" : ""}`}>{children}</div>;
}
