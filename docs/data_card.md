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

### Significado do Occasion Score (definido antes da avaliação)
`occasion_score` = **P(y_pizza = 1 | contexto)**: a probabilidade estimada de uma ocasião de consumo com aquele contexto (quem, onde, quando, em que refeição) ter pizza. É uma probabilidade **calibrada** (verificada no notebook 03): entre contextos com score 2%, cerca de 2% têm pizza.
- `lift` = score ÷ taxa base Brasil (1× = média; 5× = cinco vezes mais provável que a média).
- `classification`: **alta** (score ≥ limiar do top 10% da validação), **média** (≥ taxa base), **baixa** (< taxa base).
- O score responde *"quão relevante é este contexto para a ocasião?"*; ele **não** escolhe a campanha (isso é do Decision Engine) e **não** mede o efeito de uma ativação.

## 3. Instante de previsão e estratégia anti-leakage
O modelo é aplicado **antes da refeição**. Features permitidas: quem é a pessoa, onde mora, dia da semana, horário, tipo de refeição e local.
**Excluídas:** qualquer informação do que foi consumido na ocasião (`n_itens`, `tem_refri`, `tem_guarana`, outros alimentos) e `DIA_ATIPICO` (respondido depois).
Toda transformação (imputação, codificação) é ajustada só no treino via `sklearn.Pipeline`.

## 4. Fontes
| Fonte | Versão | Papel | Chave |
|---|---|---|---|
| POF 2017-2018 — Consumo Alimentar (IBGE) | Microdados 13/07/2023 | Target + contexto | pessoa / ocasião |
| POF 2017-2018 — Morador (IBGE) | idem | Features da pessoa e da família | `COD_UPA+NUM_DOM+NUM_UC+COD_INFORMANTE` |
| SIDRA/IBGE — tabela 6579 (população estimada) | 2018, consulta em 21/11/2026 | Feature territorial | código da UF |
| SIDRA/IBGE — tabela 7531 (rendimento médio domiciliar per capita, PNAD Contínua) | 2018, consulta em 21/11/2026 | Feature territorial | código da UF |
| OpenStreetMap via Overpass (pontos com `cuisine=pizza`) | snapshot de 21/11/2026 | Feature territorial (oferta de pizza) | sigla da UF |
| Delivery Center (Kaggle, nosbielcs) | pedidos jan-abr/2021, 4 cidades | **Evidência complementar** da regra de clima (notebook 05). **Não entra no modelo nem é juntado à POF** | cidade × data |
| Open-Meteo Archive (reanálise ERA5) | jan-abr/2021, horário, coleta em 21/11/2026 | Clima observado para o notebook 05 | cidade × hora |
| BrasilAPI — feriados nacionais | 2021, coleta em 21/11/2026 | Feriados para o notebook 05 | data |
| Open-Meteo Forecast | previsão do dia, consultada em tempo real pela API | Gatilho da regra R3 (chuva prevista) | capital da UF |

Snapshots datados ficam em `data/external/` (ver `coleta_clima_LEIAME.txt` e `pizzarias_osm_cache.csv`).

**Integração:** a POF só é juntada a fontes territoriais **por UF**. O Delivery Center/clima de 2021 é uma análise **separada** (período e unidade diferentes), usada só como evidência do mecanismo "chuva → mais delivery".

**Fontes avaliadas e descartadas:**
| Fonte | Motivo |
|---|---|
| Pizza Sales (Kaggle) | pizzaria fictícia dos EUA, sem bebidas — não representa o Brasil |
| iFood restaurants nov/2020 (Kaggle) | retrato de um dia, sem pedidos; papel de "oferta de pizza" já coberto pelo OSM |
| Vigitel 2023 | mede frequência de refrigerante por capital, sem marca/sabor e sem ligação com a refeição; não sustenta o target |
| Google Trends | proxy de interesse (nunca consumo), API instável; fora do núcleo |

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
| `dia_periodo` | Contexto | Interação explícita dia da semana × período (ex.: `Sabado|noite`) |
| `log_renda_pc` | Pessoa | log(1 + renda per capita), reduz a assimetria da renda |
| `uf`, `regiao`, `urbano` | Território | Localização do domicílio |
| `pizzarias_100k` | Território | Pontos de pizza no OSM por 100 mil habitantes da UF |
| `renda_media_pc_uf` | Território | Rendimento médio domiciliar per capita da UF (2018) |
| `log_populacao_uf` | Território | log10 da população da UF (2018) |
| `peso` | Amostragem | Peso amostral para estimativas populacionais |

## 6. População coberta e excluída
Coberta: moradores de 10 anos ou mais de domicílios particulares permanentes das 27 UFs que responderam o bloco de consumo alimentar (subamostra da POF), 2 dias não consecutivos de registro.
Excluída: menores de 10 anos, domicílios coletivos, população sem domicílio.

## 7. Vieses e limitações
- **Sem data**: a POF traz só o dia da semana. Impede cruzar clima/feriado e impede validação temporal pura → validação por grupos de domicílio e por região (ver notebook 03); o efeito do clima é avaliado à parte, com dados datados, no notebook 05.
- **Dados de 2017-2018**: hábitos podem ter mudado (ex.: crescimento do delivery pós-pandemia).
- **Marca não identificada**: "refrigerante de guaraná" é categoria, não Guaraná Antarctica.
- **Delivery não identificado**: "em casa" mistura delivery, congelado e preparo caseiro.
- **Autodeclaração**: sub-registro possível de alimentos considerados "não saudáveis".
- **Dias de registro desbalanceados**: sexta e sábado aparecem menos como dias de registro; por isso comparamos **taxas**, não contagens.
- **OSM**: cobertura desigual entre estados e snapshot de 2026 (POF é 2017-18) — usado como indicador relativo de oferta.
- **Delivery Center (notebook 05)**: 2021 = pandemia (delivery inflado, restrições variáveis); só 4 cidades; não identifica pizza (lojas de comida em geral); efeito da chuva é associação ajustada por confundidores, não causalidade.
- **Clima observado × previsto**: o notebook 05 usa clima observado (reanálise); a aplicação usa a **previsão** do dia, que é o que existe no momento da decisão.

## 8. Licença e LGPD
- IBGE (POF, SIDRA): dados públicos, anonimizados, uso livre com citação da fonte.
- OpenStreetMap: © colaboradores do OpenStreetMap, licença ODbL (atribuição obrigatória).
- Open-Meteo: dados sob CC BY 4.0. BrasilAPI: API pública e gratuita.
- Delivery Center (Kaggle): dataset público para fins de estudo; nomes de lojas já anonimizados no original. Os arquivos brutos não são redistribuídos no repositório.
- Nenhum dado pessoal identificável é usado; não há tratamento de dados pessoais sob a LGPD.
