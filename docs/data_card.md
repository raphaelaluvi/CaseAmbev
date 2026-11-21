# Data Card — Occasion Intelligence Pizza + Guaraná

> Documento vivo: atualizado a cada etapa do pipeline.

## 1. Unidade de análise
**Ocasião de consumo** = pessoa × dia de registro × refeição (café, almoço, lanche, jantar, ceia, outra).
Fonte: registro "Consumo Alimentar" da POF 2017-2018. ~363 mil ocasiões de ~46 mil pessoas.

## 2. Target
| Campo | Definição | Tipo |
|---|---|---|
| `y_pizza` | 1 se a ocasião teve ao menos um item de pizza (códigos do cadastro com "PIZZA") | **Ground truth** (consumo declarado) |

Taxa: ~0,5% das ocasiões (1.711 positivos). Classe rara.

**Por que não "pizza + guaraná" como target:** apenas 184 ocasiões positivas, insuficiente para aprendizado e avaliação estáveis.
O Guaraná entra como **métricas de marca por segmento** (não são target nem feature do modelo):
- `attach_refri` = % das ocasiões de pizza com refrigerante;
- `share_guarana` = % das ocasiões pizza + refrigerante em que o refrigerante é de guaraná.

## 3. Instante de previsão e estratégia anti-leakage
O modelo é aplicado **antes da refeição**. Features permitidas: quem é a pessoa, onde mora, dia da semana, horário, tipo de refeição e local.
**Excluídas:** qualquer informação do que foi consumido na ocasião (`n_itens`, `tem_refri`, `tem_guarana`, outros alimentos) e `DIA_ATIPICO` (respondido depois).
Toda transformação (imputação, codificação) é ajustada só no treino via `sklearn.Pipeline`.

## 4. Fontes
| Fonte | Versão | Papel | Chave |
|---|---|---|---|
| POF 2017-2018 — Consumo Alimentar (IBGE) | Microdados 13/07/2023 | Target + contexto | pessoa / ocasião |
| POF 2017-2018 — Morador (IBGE) | idem | Features da pessoa e da família | `COD_UPA+NUM_DOM+NUM_UC+COD_INFORMANTE` |
| *(a adicionar)* SIDRA, OSM/iFood, Vigitel | — | Features territoriais | UF |

## 5. Dicionário de variáveis
| Variável | Família | Descrição |
|---|---|---|
| `dia_semana`, `dia_semana_num` | Contexto | Dia da semana da ocasião |
| `fim_de_semana` | Contexto | 1 se sexta, sábado ou domingo |
| `hora` | Contexto | Horário mais próximo do consumo (mediana dos itens) |
| `periodo` | Contexto | manhã / almoço / tarde / noite / madrugada |
| `refeicao` | Contexto | Ocasião declarada (café, almoço, lanche, jantar, ceia, outra) |
| `local`, `em_casa` | Contexto/canal | Local da refeição; em casa inclui delivery, congelados e preparo próprio |
| `idade`, `sexo`, `anos_estudo` | Pessoa | Do registro Morador |
| `renda_pc`, `classe_renda` | Pessoa | Renda disponível familiar per capita; quintis rotulados E–A |
| `n_moradores`, `n_criancas`, `n_adolescentes`, `tem_crianca` | Família | Composição da unidade de consumo |
| `uf`, `regiao`, `urbano` | Território | Localização do domicílio |
| `peso` | Amostragem | Peso amostral para estimativas populacionais |

## 6. População coberta e excluída
Coberta: moradores de 10 anos ou mais de domicílios particulares permanentes das 27 UFs que responderam o bloco de consumo alimentar (subamostra da POF), 2 dias não consecutivos de registro.
Excluída: menores de 10 anos, domicílios coletivos, população sem domicílio.

## 7. Vieses e limitações
- **Sem data**: a POF traz só o dia da semana. Impede cruzar clima/feriado e impede validação temporal pura → validação por grupos de domicílio e por região (ver notebook 03).
- **Dados de 2017-2018**: hábitos podem ter mudado (ex.: crescimento do delivery pós-pandemia).
- **Marca não identificada**: "refrigerante de guaraná" é categoria, não Guaraná Antarctica.
- **Delivery não identificado**: "em casa" mistura delivery, congelado e preparo caseiro.
- **Autodeclaração**: sub-registro possível de alimentos considerados "não saudáveis".
- **Dias de registro desbalanceados**: sexta e sábado aparecem menos como dias de registro; por isso comparamos **taxas**, não contagens.

## 8. Licença e LGPD
Microdados públicos do IBGE, anonimizados, de uso livre com citação da fonte. Nenhum dado pessoal identificável é usado.
