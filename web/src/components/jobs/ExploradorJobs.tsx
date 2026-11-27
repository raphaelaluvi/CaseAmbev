import { useState } from "react";
import type { Job, Oportunidades } from "../../services/api";
import { DIA_LABEL, LOCAIS } from "../../utils/constantes";
import { pct } from "../../utils/formatar";
import { PERFIL_JOB } from "../../utils/jobs";
import Contador from "../comum/Contador";
import "./jobs.css";

/** Cada "lente" é um achado: clicar nela acende os jobs que o sustentam. */
const LENTES = [
  { id: "familia", tag: "Guaraná forte", titulo: "Famílias com criança já escolhem guaraná",
    texto: "Em ocasiões com criança, o guaraná tem cerca do dobro do share das ocasiões sem criança (41% × 19%).",
    jobs: ["Jantar em família com crianças", "Pizza fora com a família"] },
  { id: "adultos", tag: "Oportunidade", titulo: "Ocasiões de adultos são a lacuna",
    texto: "Pizza fora de casa com amigos e pizza em casa no meio da semana têm os menores shares: espaço para awareness.",
    jobs: ["Pizza fora de casa (social)", "Pizza em casa no meio da semana (adultos)"] },
  { id: "renda", tag: "Oportunidade", titulo: "Mais pizza, menos guaraná nas faixas de renda mais altas",
    texto: "O quintil de renda mais alto come mais pizza, mas tem o menor share de guaraná (~17%).",
    jobs: ["Pizza fora de casa (social)", "Pizza em casa no meio da semana (adultos)", "Noite de fim de semana em casa (adultos)"] },
];

const METRICAS = {
  share: { rotulo: "Share de guaraná", valor: (j: Job) => j.share_guarana, formatar: (v: number) => pct(v) },
  attach: { rotulo: "Pizza com refrigerante", valor: (j: Job) => j.attach_refri, formatar: (v: number) => pct(v) },
  tamanho: { rotulo: "Ocasiões de pizza", valor: (j: Job) => j.ocasioes, formatar: (v: number) => `${v} ocasiões` },
} as const;
type Metrica = keyof typeof METRICAS;

const ALTURA_LINHA = 62;

export default function ExploradorJobs({ opo }: { opo: Oportunidades }) {
  const [metrica, setMetrica] = useState<Metrica>("share");
  const [lente, setLente] = useState<string | null>(null);
  const [escolhido, setEscolhido] = useState<string | null>(null);

  const { valor, formatar } = METRICAS[metrica];
  const ordem = [...opo.jobs].sort((a, b) => valor(a) - valor(b)).map((j) => j.job);
  const maximo = Math.max(...opo.jobs.map(valor)) * 1.15;
  const brasil = metrica === "share" ? opo.brasil.share_guarana : metrica === "attach" ? opo.brasil.attach_refri : null;
  const acesos = LENTES.find((l) => l.id === lente)?.jobs;
  // sem escolha do usuário, mostra o job com a maior lacuna (menor share)
  const menorShare = [...opo.jobs].sort((a, b) => a.share_guarana - b.share_guarana)[0];
  const atual = opo.jobs.find((j) => j.job === escolhido) ?? menorShare;

  function acender(id: string) {
    const nova = lente === id ? null : id;
    setLente(nova);
    const primeiro = LENTES.find((l) => l.id === nova)?.jobs[0];
    if (primeiro) setEscolhido(primeiro);
  }

  return (
    <>
      <div className="lentes">
        {LENTES.map((l) => (
          <button key={l.id} type="button" className={`lente ${l.tag === "Guaraná forte" ? "positivo" : ""}`} aria-pressed={lente === l.id} onClick={() => acender(l.id)}>
            <span className="lente-tag">{l.tag}</span>
            <strong>{l.titulo}</strong>
            <span className="lente-texto">{l.texto}</span>
          </button>
        ))}
      </div>

      <div className="explorador">
        <div className="cartao">
          <div className="chips">
            {(Object.keys(METRICAS) as Metrica[]).map((m) => (
              <button key={m} type="button" className="chip" aria-pressed={m === metrica} onClick={() => setMetrica(m)}>
                {METRICAS[m].rotulo}
              </button>
            ))}
          </div>
          <p className="mudo pequeno">{brasil !== null ? "O traço escuro é a média Brasil." : "Quantas ocasiões de pizza da POF cada job reúne."}</p>

          {/* as linhas têm posição fixa no DOM e deslizam até a posição do ranking */}
          <div className="ranking-jobs" style={{ height: opo.jobs.length * ALTURA_LINHA }}>
            {opo.jobs.map((j) => (
              <button key={j.job} type="button" aria-pressed={j.job === atual.job} onClick={() => setEscolhido(j.job)}
                className={`linha-job ${acesos && !acesos.includes(j.job) ? "apagada" : ""}`}
                style={{ transform: `translateY(${ordem.indexOf(j.job) * ALTURA_LINHA}px)` }}>
                <span className="linha-cab"><span>{j.job}</span><b>{formatar(valor(j))}</b></span>
                <span className="trilho">
                  <span className="barra" style={{ width: `${(valor(j) / maximo) * 100}%` }} />
                  {brasil !== null && <span className="marca-br" style={{ left: `${(brasil / maximo) * 100}%` }} />}
                </span>
              </button>
            ))}
          </div>
        </div>

        <Detalhe job={atual} brasil={opo.brasil} />
      </div>
    </>
  );
}

function Detalhe({ job, brasil }: { job: Job; brasil: Oportunidades["brasil"] }) {
  const perfil = PERFIL_JOB[job.job];
  const dif = Math.round((job.share_guarana - brasil.share_guarana) * 100);
  // mesma ordem das regras R4–R6 do Decision Engine
  const caminho = job.attach_refri < brasil.attach_refri ? "Combo: fazer o refrigerante entrar no pedido"
    : job.share_guarana < brasil.share_guarana ? "Awareness: construir a associação com o Guaraná"
    : "Manutenção: o Guaraná já está presente";
  const raio = 52, volta = 2 * Math.PI * raio;

  return (
    <div key={job.job} className="detalhe-job">
      <span className="rotulo">Job escolhido</span>
      <h3>{job.job}</h3>

      <div className="anel">
        <svg viewBox="0 0 130 130" aria-hidden="true">
          <circle cx="65" cy="65" r={raio} className="anel-fundo" />
          <circle cx="65" cy="65" r={raio} className="anel-valor" strokeDasharray={volta}
            style={{ strokeDashoffset: volta * (1 - job.share_guarana), ["--volta" as string]: volta }} />
          <line x1="65" y1="3" x2="65" y2="23" className="anel-brasil" transform={`rotate(${brasil.share_guarana * 360} 65 65)`} />
        </svg>
        <div className="anel-texto">
          <span className="anel-numero"><Contador fim={job.share_guarana * 100} sufixo="%" /></span>
          <span>guaraná</span>
        </div>
      </div>
      <p className={`diferenca ${dif < 0 ? "abaixo" : ""}`}>
        {dif === 0 ? "Na média Brasil" : `${Math.abs(dif)} p.p. ${dif < 0 ? "abaixo" : "acima"} da média Brasil`}
      </p>

      {perfil && (
        <div className="perfil">
          <span>{DIA_LABEL[perfil.dia_semana!]}, {perfil.hora}h</span>
          <span>{LOCAIS.find(([v]) => v === perfil.local)?.[1].split(" (")[0]}</span>
          <span>{perfil.n_moradores} moradores</span>
          <span>{perfil.n_criancas ? `${perfil.n_criancas} criança(s)` : "sem crianças"}</span>
        </div>
      )}

      <span className="rotulo">Caminho sugerido</span>
      <p className="caminho">{caminho}</p>
    </div>
  );
}
