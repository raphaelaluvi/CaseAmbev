import type { Contexto } from "../services/api";

/** Perfil típico de cada job (arredondado a partir dos centroides do K-means, notebook 04).
 *  Clicar no job preenche o simulador com esses valores. */
export const PERFIL_JOB: Record<string, Partial<Contexto>> = {
  "Jantar em família com crianças": { dia_semana: "Sexta-Feira", hora: 20, refeicao: "jantar", local: "casa", idade: 30, renda_pc: 1200, n_moradores: 4, n_criancas: 2, n_adolescentes: 0 },
  "Pizza fora com a família": { dia_semana: "Sabado", hora: 20, refeicao: "jantar", local: "restaurante", idade: 29, renda_pc: 1000, n_moradores: 4, n_criancas: 2, n_adolescentes: 0 },
  "Noite de fim de semana em casa (adultos)": { dia_semana: "Sabado", hora: 20, refeicao: "jantar", local: "casa", idade: 38, renda_pc: 1700, n_moradores: 3, n_criancas: 0, n_adolescentes: 0 },
  "Pizza em casa no meio da semana (adultos)": { dia_semana: "Quarta-Feira", hora: 20, refeicao: "jantar", local: "casa", idade: 41, renda_pc: 2200, n_moradores: 3, n_criancas: 0, n_adolescentes: 0 },
  "Pizza fora de casa (social)": { dia_semana: "Sexta-Feira", hora: 20, refeicao: "jantar", local: "restaurante", idade: 36, renda_pc: 2200, n_moradores: 3, n_criancas: 0, n_adolescentes: 0 },
  "Pizza no lanche / refeição do dia": { dia_semana: "Quarta-Feira", hora: 10, refeicao: "lanche", local: "casa", idade: 32, renda_pc: 1500, n_moradores: 3, n_criancas: 1, n_adolescentes: 0 },
};
