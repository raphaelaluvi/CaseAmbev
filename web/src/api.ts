export const API_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

export type Contexto = {
  dia_semana: string;
  hora: number;
  refeicao: string;
  local: string;
  uf: string;
  urbano: number;
  idade: number;
  sexo: "M" | "F";
  anos_estudo: number;
  renda_pc: number;
  n_moradores: number;
  n_criancas: number;
  n_adolescentes: number;
  chuva_prevista: boolean | null;
};

export type Fator = {
  fator: string;
  variavel: string;
  valor: string | number;
  impacto: number;
  direcao: "aumenta" | "reduz";
};

export type Predicao = {
  occasion_score: number;
  occasion_score_pct: number;
  lift: number;
  classification: "alta" | "media" | "baixa";
  top_factors: Fator[];
  job: { nome: string; ocasioes?: number; attach_refri?: number; share_guarana?: number } | null;
  segmento: {
    regiao: string;
    classe_renda: string;
    attach_refri: number;
    share_guarana: number;
    brasil: { attach_refri: number; share_guarana: number };
  };
  recommendation_category: string;
  recommendation_label: string;
  recommendation_reason: string;
  rule_fired: string;
  acoes_complementares: { categoria: string; label: string; motivo: string }[];
  model_metadata: {
    modelo: string;
    versao: string;
    taxa_base: number;
    limiar_alta: number;
    metricas_teste: Record<string, number>;
    versao_contrato?: string;
    aviso?: string | null;
  };
};

export type UFOportunidade = {
  uf: string;
  sigla: string;
  regiao: string;
  lift_medio: number;
  pizzarias_100k: number;
  share_guarana_regiao: number;
  potencial: number;
  canal_sugerido: string;
  ranking: number;
};

export type Job = { cluster: number; job: string; ocasioes: number; attach_refri: number; share_guarana: number };

export type Oportunidades = {
  brasil: { attach_refri: number; share_guarana: number };
  jobs: Job[];
  ufs: UFOportunidade[];
};

export type Clima = { uf: string; data: string; prob_chuva_max: number; chuva_mm: number; temp_max: number; chuva_prevista: boolean };

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const r = await fetch(`${API_URL}${path}`, init);
  if (!r.ok) throw new Error(`${r.status} ${await r.text()}`);
  return r.json() as Promise<T>;
}

export const api = {
  predict: (c: Contexto) =>
    req<Predicao>("/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // metadados de versão na entrada: o site declara o contrato que espera e quem está chamando
      body: JSON.stringify({ ...c, metadata: { versao_contrato: "1.0", versao_modelo_esperada: "1.0.0", origem: "site" } }),
    }),
  oportunidades: () => req<Oportunidades>("/oportunidades"),
  clima: (uf: string) => req<Clima>(`/clima/${uf}`),
};
