import type { Contexto } from "../services/api";

/** Opções dos campos do formulário do simulador (valores aceitos pela API). */
export const DIAS = ["Segunda-Feira", "Terca-Feira", "Quarta-Feira", "Quinta-Feira", "Sexta-Feira", "Sabado", "Domingo"];

export const DIA_LABEL: Record<string, string> = {
  "Segunda-Feira": "Segunda", "Terca-Feira": "Terça", "Quarta-Feira": "Quarta", "Quinta-Feira": "Quinta",
  "Sexta-Feira": "Sexta", Sabado: "Sábado", Domingo: "Domingo",
};

export const REFEICOES: [string, string][] = [
  ["cafe", "Café da manhã"], ["almoco", "Almoço"], ["lanche", "Lanche"], ["jantar", "Jantar"], ["ceia", "Ceia"], ["outra", "Outra"],
];

export const LOCAIS: [string, string][] = [
  ["casa", "Em casa (inclui delivery)"], ["restaurante", "Restaurante"], ["lanchonete", "Lanchonete / fast food"],
  ["fora_outros", "Fora de casa — outros"], ["rest_quilo", "Restaurante por quilo"], ["ambulante", "Ambulante"],
];

export const UFS = ["AC", "AL", "AM", "AP", "BA", "CE", "DF", "ES", "GO", "MA", "MG", "MS", "MT", "PA", "PB", "PE", "PI",
  "PR", "RJ", "RN", "RO", "RR", "RS", "SC", "SE", "SP", "TO"];

/** Contexto que o simulador mostra ao abrir a página. */
export const CONTEXTO_PADRAO: Contexto = {
  dia_semana: "Sexta-Feira", hora: 20, refeicao: "jantar", local: "casa", uf: "SP", urbano: 1, idade: 32, sexo: "F",
  anos_estudo: 12, renda_pc: 1500, n_moradores: 4, n_criancas: 1, n_adolescentes: 0, chuva_prevista: null,
};

export const CLASSE_LABEL = { alta: "Propensão alta", media: "Propensão média", baixa: "Propensão baixa" };
