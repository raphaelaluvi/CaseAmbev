import { useEffect, useMemo, useState } from "react";
import type { UFOportunidade } from "../../services/api";
import IconeCanal from "../comum/IconeCanal";
import "./mapa.css";

/** Mapa coroplético do Brasil por UF (malha do IBGE em public/br_uf.json).
 *  Projeção simples: longitude escalada pelo cosseno da latitude média do Brasil (~-15°),
 *  suficiente para um mapa de visualização sem dependências extras. */

type Geometria = { type: "Polygon"; coordinates: number[][][] } | { type: "MultiPolygon"; coordinates: number[][][][] };
type Feature = { properties: { codarea: string }; geometry: Geometria };

const LARGURA = 560;
const ALTURA = 560;
const COS_LAT = Math.cos((-15 * Math.PI) / 180);

function projetar(features: Feature[]) {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  const aneis = (g: Geometria) => (g.type === "Polygon" ? g.coordinates : g.coordinates.flat());
  for (const f of features)
    for (const anel of aneis(f.geometry))
      for (const [lon, lat] of anel) {
        const x = lon * COS_LAT, y = -lat;
        minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y);
      }
  const escala = Math.min(LARGURA / (maxX - minX), ALTURA / (maxY - minY));
  const px = (lon: number) => (lon * COS_LAT - minX) * escala;
  const py = (lat: number) => (-lat - minY) * escala;
  return features.map((f) => {
    const d = aneis(f.geometry)
      .map((anel) => "M" + anel.map(([lon, lat]) => `${px(lon).toFixed(1)},${py(lat).toFixed(1)}`).join("L") + "Z")
      .join("");
    // centro aproximado (média dos pontos do maior anel) para o rótulo
    const maior = aneis(f.geometry).reduce((a, b) => (b.length > a.length ? b : a));
    const cx = maior.reduce((s, [lon]) => s + px(lon), 0) / maior.length;
    const cy = maior.reduce((s, [, lat]) => s + py(lat), 0) / maior.length;
    return { cod: f.properties.codarea, d, cx, cy };
  });
}

/** Ajuste manual (em px) de rótulos que se sobrepõem: DF fica dentro de GO. */
const DESLOCAMENTO: Record<string, [number, number]> = { "53": [16, -2], "52": [-14, 10] };

/** Rampa sequencial de uma cor (claro -> escuro), 5 faixas por quantil. */
const RAMPA = ["var(--seq-1)", "var(--seq-2)", "var(--seq-3)", "var(--seq-4)", "var(--seq-5)"];

/** Métricas que o mapa pode colorir. */
const METRICAS = {
  potencial: { rotulo: "Potencial de ativação", valor: (u: UFOportunidade) => u.potencial },
  lift: { rotulo: "Ocasião de pizza", valor: (u: UFOportunidade) => u.lift_medio },
  share: { rotulo: "Share de guaraná", valor: (u: UFOportunidade) => u.share_guarana_regiao },
  pizzarias: { rotulo: "Pizzarias por 100 mil hab.", valor: (u: UFOportunidade) => u.pizzarias_100k },
} as const;
type Metrica = keyof typeof METRICAS;

/** Destaque do estado selecionado: inverte a cor (escuro vira claro e vice-versa). */
const corInvertida = (faixa: number) => (faixa >= 3 ? "var(--seq-1)" : "var(--seq-5)");

export default function MapaBrasil({ ufs, selecionada, onSelecionar, onSimular }: {
  ufs: UFOportunidade[];
  selecionada: string | null;
  onSelecionar: (sigla: string) => void;
  onSimular: (sigla: string) => void;
}) {
  const [features, setFeatures] = useState<Feature[] | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const [metrica, setMetrica] = useState<Metrica>("potencial");

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}br_uf.json`).then((r) => r.json()).then((g) => setFeatures(g.features));
  }, []);

  const caminhos = useMemo(() => (features ? projetar(features) : []), [features]);
  const porCod = useMemo(() => new Map(ufs.map((u) => [u.uf, u])), [ufs]);
  const valorDe = METRICAS[metrica].valor;
  const cortes = useMemo(() => {
    const v = ufs.map(valorDe).sort((a, b) => a - b);
    return [0.2, 0.4, 0.6, 0.8].map((q) => v[Math.floor(q * (v.length - 1))]);
  }, [ufs, metrica]);
  const faixa = (p: number) => cortes.filter((c) => p > c).length;

  // com um estado fixado (1º clique), a ficha fica nele; sem estado fixado, a ficha segue o mouse
  const fixada = ufs.find((u) => u.sigla === selecionada) ?? null;
  const ativa = fixada ?? porCod.get(hover ?? "") ?? null;

  if (!features) return <p className="mudo">Carregando mapa…</p>;
  return (
    <>
    <div className="chips mapa-metricas">
      {(Object.keys(METRICAS) as Metrica[]).map((m) => (
        <button key={m} type="button" className="chip" aria-pressed={m === metrica} onClick={() => setMetrica(m)}>{METRICAS[m].rotulo}</button>
      ))}
    </div>
    <div className="mapa">
      <svg viewBox={`0 0 ${LARGURA} ${ALTURA}`} role="img" aria-label="Mapa do Brasil colorido pelo potencial de ativação por estado">
        {caminhos.map((c) => {
          const u = porCod.get(c.cod);
          const sel = u && u.sigla === selecionada;
          return (
            <path
              key={c.cod}
              d={c.d}
              fill={u ? (sel ? corInvertida(faixa(valorDe(u))) : RAMPA[faixa(valorDe(u))]) : "var(--trilho)"}
              className={`uf ${sel ? "selecionada" : ""}`}
              onMouseEnter={() => setHover(c.cod)}
              onMouseLeave={() => setHover(null)}
              onClick={() => u && onSelecionar(u.sigla)}
            >
              <title>{u ? `${u.sigla}: potencial ${u.potencial.toFixed(2)} (#${u.ranking})` : c.cod}</title>
            </path>
          );
        })}
        {caminhos.map((c) => {
          const u = porCod.get(c.cod);
          if (!u) return null;
          // o rótulo acompanha a cor do estado: fundo escuro -> texto branco (no selecionado, a cor é invertida)
          const escuro = faixa(valorDe(u)) >= 3;
          const fundoEscuro = u.sigla === selecionada ? !escuro : escuro;
          return (
            <text key={`t${c.cod}`} x={c.cx + (DESLOCAMENTO[c.cod]?.[0] ?? 0)} y={c.cy + (DESLOCAMENTO[c.cod]?.[1] ?? 0)}
              className={`rotulo-uf ${fundoEscuro && !DESLOCAMENTO[c.cod] ? "claro" : ""}`}>
              {u.sigla}
            </text>
          );
        })}
      </svg>
      <div className="mapa-lado">
        <div className="legenda-seq">
          <span className="rotulo">{METRICAS[metrica].rotulo}</span>
          <div className="escala">
            {RAMPA.map((c, i) => <span key={i} style={{ background: c }} />)}
          </div>
          <div className="escala-txt"><span>menor</span><span>maior</span></div>
        </div>
        {ativa ? (
          <div className="ficha-uf">
            <span className="rotulo">#{ativa.ranking} de 27 · {ativa.regiao}</span>
            <h3>{ativa.sigla}</h3>
            <dl>
              <dt>Ocasião de pizza</dt><dd>{ativa.lift_medio.toFixed(2)}× a média Brasil</dd>
              <dt>Share de guaraná (região)</dt><dd>{(ativa.share_guarana_regiao * 100).toFixed(0)}%</dd>
              <dt>Pizzarias / 100 mil hab.</dt><dd>{ativa.pizzarias_100k.toFixed(1)}</dd>
              <dt>Canal sugerido</dt>
              <dd className="canal-sug">
                <IconeCanal canal={ativa.canal_sugerido.startsWith("Delivery") ? "delivery" : "casa"} tamanho={28} />
                {ativa.canal_sugerido}
              </dd>
            </dl>
            {fixada && (
              <div className="ficha-acao">
                <button type="button" onClick={() => onSimular(fixada.sigla)}>Simular {fixada.sigla} →</button>
                <span className="pequeno">ou clique de novo no estado</span>
              </div>
            )}
          </div>
        ) : (
          <p className="mudo pequeno">Passe o mouse num estado para ver os detalhes, ou clique para fixá-los aqui.</p>
        )}
      </div>
    </div>
    </>
  );
}
