import type { Contexto } from "../services/api";

/** Cenários prontos: um clique preenche o formulário inteiro. */
export const CENARIOS: { nome: string; ctx: Partial<Contexto> }[] = [
  { nome: "Sexta à noite em família", ctx: { dia_semana: "Sexta-Feira", hora: 20, refeicao: "jantar", local: "casa", n_moradores: 4, n_criancas: 2, idade: 35, renda_pc: 1500 } },
  { nome: "Pizza com amigos no sábado", ctx: { dia_semana: "Sabado", hora: 21, refeicao: "jantar", local: "restaurante", n_moradores: 2, n_criancas: 0, idade: 27, renda_pc: 2500 } },
  { nome: "Quarta em casa, sozinho", ctx: { dia_semana: "Quarta-Feira", hora: 20, refeicao: "jantar", local: "casa", n_moradores: 1, n_criancas: 0, idade: 40, renda_pc: 3000 } },
  { nome: "Almoço de dia útil", ctx: { dia_semana: "Terca-Feira", hora: 12, refeicao: "almoco", local: "casa", n_moradores: 3, n_criancas: 1, idade: 38, renda_pc: 1200 } },
];
