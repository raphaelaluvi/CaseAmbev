import { useEffect, useState } from "react";
import { api, type Clima, type Contexto, type Oportunidades, type Predicao } from "../services/api";
import { CONTEXTO_PADRAO } from "../utils/constantes";

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

  async function prever(c: Contexto = ctx) {
    setCarregando(true);
    setErro(null);
    try {
      setRes(await api.predict(c));
    } catch (e) {
      setErro(`Não foi possível falar com a API (${String(e)}). Ela está rodando em localhost:8000?`);
    } finally {
      setCarregando(false);
    }
  }

  /** Clique no mapa: leva o estado ao simulador, recalcula e rola até a seção 3. */
  function selecionarUfNoMapa(uf: string) {
    const novo = { ...ctx, uf, chuva_prevista: null };
    setCtx(novo);
    setClima(null);
    prever(novo);
    document.getElementById("ato3")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function consultarClima() {
    try {
      const c = await api.clima(ctx.uf, ctx.dia_semana);
      setClima(c);
      const novo = { ...ctx, chuva_prevista: c.chuva_prevista };
      setCtx(novo);
      prever(novo);
    } catch (e) {
      setErro(`Previsão do tempo indisponível: ${String(e)}`);
    }
  }

  // ao abrir a página: calcula o contexto padrão e carrega mapa + jobs
  useEffect(() => {
    prever(CONTEXTO_PADRAO);
    api.oportunidades().then(setOpo).catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { ctx, res, opo, clima, erro, carregando, set, mudarUf, mudarDia, prever, consultarClima, selecionarUfNoMapa };
}
