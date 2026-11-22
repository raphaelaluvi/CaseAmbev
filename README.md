# Occasion Intelligence — Pizza + Guaraná

Sistema orientado a dados que estima a **propensão de um contexto para a ocasião de pizza** (Occasion Score), mede a **presença atual do Guaraná** nessa ocasião e transforma isso em **recomendações estruturadas de ativação** (Decision Engine).

> Case Inteli Academy × Ambev (TAPI). Projeto individual.

## Ideia central
**O modelo diz onde/quando a pizza acontece → o cluster diz que tipo de ocasião é (job) → as métricas de marca dizem quanto o Guaraná já está lá → o Decision Engine decide a ativação.**

```
POF 2017-18 (IBGE) ─┐
SIDRA (IBGE) ───────┼─> base: 1 linha por ocasião de consumo (pessoa × dia × refeição)
OpenStreetMap ──────┘        │
                             ├─> modelo: baseline × Regressão Logística × LightGBM ─> Occasion Score + SHAP
                             ├─> K-means das ocasiões de pizza ─> jobs to be done
                             └─> attach de refrigerante e share de guaraná por segmento
                                              │
                          Decision Engine (regras R1–R6) ─> categoria de ativação + justificativa
                                              │
                          API FastAPI (/predict, /clima, /oportunidades) ─> site React + Vite
Open-Meteo (previsão do dia escolhido) ─> gatilho de regra "chuva prevista" (R3)

Delivery Center 2021 + Open-Meteo histórico + BrasilAPI ─> notebook 05: evidência de que chuva aumenta o delivery
(análise separada — não é juntada à POF nem entra no modelo)
```

## Formulação
| Item | Definição |
|---|---|
| Unidade de análise | Ocasião de consumo: pessoa × dia de registro × refeição (POF, ~348 mil ocasiões com refeição declarada) |
| Target | `y_pizza`: ocasião teve pizza (~0,5%, ground truth declarado) |
| Por que não "pizza + guaraná" | só 184 ocasiões — o Guaraná entra como **métricas de marca por segmento** (attach e share) no Decision Engine |
| Instante de previsão | antes da refeição: quem, onde mora, dia, horário, refeição e local; nada do que foi consumido |
| Validação | 5 dobras agrupadas por domicílio + teste com 20% dos domicílios + deixa-uma-região-fora (a POF não tem data → sem split temporal, documentado) |
| Métrica principal | PR-AUC (classe rara), + lift e recall no top 10% |

## Metodologia
1. **Base** (nb 01): microdados da POF lidos com o layout oficial do IBGE; itens agregados em ocasiões; features da pessoa e da família do registro Morador. Data Card em [docs/data_card.md](docs/data_card.md).
2. **EDA** (nb 02): taxas ponderadas pelo peso amostral (nunca contagens); attach de refrigerante e share de guaraná por segmento; matriz de oportunidade; features territoriais por UF (SIDRA + OSM).
3. **Modelagem** (nb 03): baselines sem ML (regra fixa "sex-dom noite" e frequência dia × período) × Regressão Logística × Random Forest × LightGBM, todos no mesmo `Pipeline` (pré-processamento ajustado só no treino). Escolha do modelo pela validação cruzada; teste aberto uma única vez.
4. **Avaliação**: PR-AUC (principal), ROC-AUC, lift e recall no top 10%, Brier, calibração, matriz de confusão, ablação por família de features, deixa-uma-região-fora, análise por segmentos e **análise de erros**.
5. **Explicação e jobs** (nb 04): SHAP (TreeExplainer) global e por previsão; K-means padronizado sobre as ocasiões de pizza (cotovelo + silhueta) → jobs to be done; métricas de Guaraná suavizadas por segmento; mapa de oportunidade por UF.
6. **Decisão**: Decision Engine com regras R1–R6 documentadas em [docs/decision_engine.md](docs/decision_engine.md) e testadas.
7. **Clima** (nb 05): regressão com efeitos fixos (cidade × dia da semana, cidade × semana) e intervalo de confiança por bootstrap.

## Resultados

### Occasion Prediction — teste final (20% dos domicílios, aberto uma vez)
| Modelo | PR-AUC | ROC-AUC | Lift top 10% | Recall top 10% |
|---|---|---|---|---|
| *Chute (taxa base)* | *0,005* | *0,500* | *1,0×* | *10%* |
| Baseline dia × período (TAPI) | 0,019 | 0,806 | 4,0× | 40% |
| Regressão Logística | 0,074 | 0,874 | 6,7× | 67% |
| Random Forest | 0,086 | 0,877 | 6,8× | 68% |
| **LightGBM (escolhido)** | **0,084** | **0,886** | **6,8×** | **68%** |

- O LightGBM foi escolhido pela **validação cruzada** (PR-AUC 0,080 contra 0,076 do Random Forest e 0,073 da Logística); no teste os três ficam próximos, e a diferença de 0,002 para o Random Forest é ruído. Escolher pelo teste seria usá-lo para decidir.
- **4,4× o PR-AUC do baseline**: o modelo aprende além de "sexta à noite é bom para pizza". Ativando nos 10% de contextos de maior score, alcança **68% das ocasiões de pizza**, contra 40% do baseline com o mesmo esforço.
- **Generaliza:** validação cruzada (0,080) ≈ teste (0,084); calibração próxima da diagonal (não foi preciso calibrar).

### O que traz o ganho — ablação (validação cruzada, PR-AUC do LightGBM)
| Features | PR-AUC |
|---|---|
| Baseline dia × período | 0,018 |
| Contexto (dia, horário, refeição, local) | 0,072 |
| + Pessoa (idade, renda, família) | 0,081 |
| + Território (região, pizzarias/100 mil, renda e população da UF) | 0,080 |

**Regiões nunca vistas** (treina em 4, testa na 5ª): LightGBM sem território 0,088 → **com território 0,093** (melhor em 4 de 5 regiões); baseline 0,019. O território não ajuda a decorar, ajuda a **generalizar** — e é a base do mapa de oportunidade.

### Explicação, segmentos e erros
- **SHAP:** local da refeição, horário, tipo de refeição e renda per capita são os fatores que mais movem o score — coerentes com o negócio (sem sinal de vazamento).
- **Segmentos:** o LightGBM supera o baseline em todos; dentro da **noite** vai de 0,021 para 0,095. **Em casa** é o segmento mais difícil (0,044 contra 0,166 fora de casa), mas ainda 3× o baseline.
- **Análise de erros:** as pizzas perdidas são as **"fora de hora"** (almoço, café, tarde: ~51% das perdidas contra ~2% das encontradas), em dias úteis e em casa — raras e pouco antecipáveis. Os falsos positivos são **jantares em casa** com cara de pizza (e mais refrigerante que a média): um erro barato para uma ativação.

### Guaraná na ocasião (métricas de marca, POF ponderada)
- **Attach:** 37% das pizzas vêm com refrigerante. **Share:** o guaraná é 29% desses refrigerantes.
- **Faixa de renda mais alta (quintil "A"):** maior taxa de pizza e **menor share de guaraná** (~17%) — o oposto do que o TAPI relata para a Classe A nos dados da Ambev (a POF mede a categoria, não a marca, e é de 2017-18; as faixas são quintis de renda per capita, não o Critério Brasil da ABEP).
- **Famílias com criança:** share de guaraná ~2× maior que sem criança.
- **Jobs (K-means, 6 grupos):** "Jantar em família com crianças" tem o maior share (38%); "Pizza fora de casa (social)" (19%) e "Pizza em casa no meio da semana (adultos)" (20%) são onde o Guaraná tem mais espaço → **awareness para ocasiões de adultos**.
- **Mapa de oportunidade (top 5 UFs):** RS, DF, SC, PR, RR — muita pizza e share de guaraná regional abaixo da média.

### Clima (notebook 05, evidência complementar)
- Comparação ingênua sugeria **queda** de pedidos com chuva (SP −21%, Curitiba −34%) — efeito do crescimento da empresa ao longo dos meses (confundidor).
- Controlando cidade, dia da semana e semana: **dias chuvosos têm +5,7% de pedidos de comida à noite** (IC 95%: +1,1% a +10,7%); cancelamentos não mudam; a chuva **na hora exata** não tem efeito detectável.
- → Sustenta a regra **R3** (chuva prevista → reforçar delivery), que usa a previsão **do dia**.

## Estrutura
| Caminho | Conteúdo |
|---|---|
| `notebooks/01_construcao_base` | Leitura da POF, target, features, base por ocasião |
| `notebooks/02_eda_territorio` | EDA, matriz de oportunidade, features territoriais |
| `notebooks/03_modelos_validacao` | Baselines, Logística, Random Forest, LightGBM, ablação, validação por região, calibração, teste, segmentos, análise de erros |
| `notebooks/04_explicabilidade_jobs` | SHAP, clusters (jobs), métricas de Guaraná, mapa por UF, Decision Engine |
| `notebooks/05_eda_clima` | Evidência complementar: efeito da chuva no delivery de comida (Delivery Center 2021 + Open-Meteo + BrasilAPI) |
| `src/` | Leitura da POF, coleta externa, features, explicação, Decision Engine, serviço de inferência |
| `api/main.py` | API FastAPI |
| `web/` | Site React + Vite |
| `docs/` | [Data Card](docs/data_card.md) · [Decision Engine e JTBD](docs/decision_engine.md) · [Protocolo de experimento A/B](docs/protocolo_experimento.md) |
| `tests/` | Testes (anti-vazamento, regras, contrato da API) |

## Como reproduzir
```bash
py -m venv .venv
.venv\Scripts\python -m pip install -r requirements.txt
```
1. Baixe `Dados_20230713.zip` e `Documentacao_20230713.zip` de
   `https://ftp.ibge.gov.br/Orcamentos_Familiares/Pesquisa_de_Orcamentos_Familiares_2017_2018/Microdados/`.
   Extraia `CONSUMO_ALIMENTAR.txt` e `MORADOR.txt` em `data/raw/pof/` e a documentação em `data/raw/pof/documentacao/`.
2. Features territoriais (SIDRA + OpenStreetMap; retomável se o Overpass cair):
   ```bash
   .venv\Scripts\python -m src.coleta_externa
   ```
3. Para o notebook 05: baixe o dataset **Brazilian Delivery Center** no Kaggle (`nosbielcs/brazilian-delivery-center`), extraia os `.csv` em `data/raw/delivery_center/` e colete clima e feriados:
   ```bash
   .venv\Scripts\python -m src.coleta_clima
   ```
4. Rode os notebooks em ordem:
   ```bash
   .venv\Scripts\python rodar_pipeline.py
   ```
5. Testes:
   ```bash
   .venv\Scripts\python -m pytest -q
   ```

## Como executar a aplicação
API (porta 8000, documentação interativa em `/docs`):
```bash
.venv\Scripts\python -m uvicorn api.main:app --port 8000
```
Site (porta 5173):
```bash
cd web && npm install && npm run dev
```

### Contrato da API — `POST /predict`
Entrada (todos com valor padrão): `dia_semana`, `hora`, `refeicao`, `local`, `uf`, `urbano`, `idade`, `sexo`, `anos_estudo`, `renda_pc`, `n_moradores`, `n_criancas`, `n_adolescentes`, `chuva_prevista` (opcional) e `metadata` (metadados de versão: `versao_contrato`, `versao_modelo_esperada`, `origem`). Uma versão de contrato não suportada devolve erro 422; um modelo diferente do esperado gera um `aviso` em `model_metadata`.

Saída: `occasion_score`, `lift`, `classification`, `top_factors`, `job`, `segmento`, `recommendation_category`, `recommendation_label`, `recommendation_reason`, `acoes_complementares`, `model_metadata`.

### Por que React + Vite e não Streamlit
O TAPI cita Streamlit como stack de referência. Optei por **React + Vite** consumindo a **API FastAPI**: a interface fica separada da lógica (camadas independentes, como pede a arquitetura do TAPI), o mesmo contrato `/predict` serve o site, os testes e qualquer outro cliente, e o front pode ser publicado como site estático.

## Limitações
- A POF identifica a **categoria** "refrigerante de guaraná", não a marca.
- Dados de 2017-18, sem data (só dia da semana): sem validação temporal; clima entra como regra, não como feature aprendida.
- "Em casa" mistura delivery, congelado e preparo próprio.
- OSM tem cobertura desigual e é de 2026: usado como indicador relativo de oferta.
- Pizzas "fora de hora" (almoço, café, tarde) são as que o modelo mais perde.
- Métricas de Guaraná por segmento têm amostras pequenas (suavizadas em direção à média Brasil).
- Evidência de clima: comida em geral (não só pizza), 2021 (pandemia), 4 cidades; associação, não causalidade.
- O sistema não afirma causalidade: prioriza contextos, não garante vendas. Medir o efeito de uma ativação exige um experimento (teste A/B), cujo protocolo está em [docs/protocolo_experimento.md](docs/protocolo_experimento.md).

## Próximos passos
- Substituir a POF por dados de pedidos da Ambev/parceiro (com data, marca e canal) → validação temporal e target "pizza + Guaraná Antarctica".
- Rodar o experimento A/B de combo pizza + Guaraná com um parceiro ([protocolo](docs/protocolo_experimento.md)).
- Usar `DIA_ATIPICO` da POF para diagnosticar as pizzas "fora de hora".

## Status
- [x] 01 — Construção da base e Data Card
- [x] 02 — EDA e features territoriais
- [x] 03 — Baseline, modelos, validação e análise de erros
- [x] 04 — Explicabilidade, jobs e Decision Engine
- [x] 05 — EDA de clima
- [x] API + site
- [ ] Vídeo
