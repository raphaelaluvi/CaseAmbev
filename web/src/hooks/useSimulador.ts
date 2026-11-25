import { useEffect, useRef, useState } from "react";
import { api, type Clima, type Contexto, type Oportunidades, type Predicao } from "../services/api";
import { CONTEXTO_PADRAO } from "../utils/constantes";
import { PERFIL_JOB } from "../utils/jobs";

/** Todo o "estado" da página num lugar só: o contexto do simulador, a resposta da API,
 *  a previsão do tempo e os dados de oportunidade (mapa e jobs). */
export function useSimulador() {
  const [ctx, setCtx] = useState<Contexto>(CONTEXTO_PADRAO);
  const [res, setRes] = useState<Predicao | null>(null);
  const [opo, setOpo] = useState<Oportunidades | null>(null);
  const [clima, setClima] = useState<Clima | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  /** Altera um campo do contexto. */
  const set = <K extends keyof Contexto>(k: K, v: Contexto[K]) => setCtx((c) => ({ ...c, [k]: v }));

  /** Trocar dia ou UF invalida a previsão do tempo consultada antes. */
  const limparClima = () => { setClima(null); set("chuva_prevista", null); };
  const mudarUf = (uf: string) => { set("uf", uf); limparClima(); };
  const mudarDia = (dia: string) => { set("dia_semana", dia); limparClima(); };

  // contador para descartar respostas antigas quando o usuário muda o contexto rápido
  const pedido = useRef(0);

  async function prever(c: Contexto) {
    const n = ++pedido.current;
    setCarregando(true);
    setErro(null);
    try {
      const r = await api.predict(c);
      if (n === pedido.current) setRes(r);
    } catch (e) {
      if (n === pedido.current) setErro(`Não foi possível falar com a API (${String(e)}). Ela está rodando em localhost:8000?`);
    } finally {
      if (n === pedido.current) setCarregando(false);
    }
  }

  // recalcula sozinho 350 ms depois de qualquer mudança no formulário
  useEffect(() => {
    const t = setTimeout(() => prever(ctx), 350);
    return () => clearTimeout(t);
  }, [ctx]);

  useEffect(() => { api.oportunidades().then(setOpo).catch(() => undefined); }, []);

  /** Clique no mapa: leva o estado ao simulador e rola até a seção 3. */
  function selecionarUfNoMapa(uf: string) {
    mudarUf(uf);
    document.getElementById("ato3")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  /** Clique num job: preenche o simulador com o perfil típico dele e rola até a seção 3. */
  function aplicarJob(nome: string) {
    setCtx((c) => ({ ...c, ...PERFIL_JOB[nome], chuva_prevista: null }));
    setClima(null);
    document.getElementById("ato3")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function consultarClima() {
    try {
      const c = await api.clima(ctx.uf, ctx.dia_semana);
      setClima(c);
      set("chuva_prevista", c.chuva_prevista);
    } catch (e) {
      setErro(`Previsão do tempo indisponível: ${String(e)}`);
    }
  }

  return { ctx, res, opo, clima, erro, carregando, set, mudarUf, mudarDia, consultarClima, selecionarUfNoMapa, aplicarJob };
}
