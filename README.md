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
Open-Meteo (previsão do dia) ─> gatilho de regra "chuva prevista" (R3)
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

## Estrutura
| Caminho | Conteúdo |
|---|---|
| `notebooks/01_construcao_base` | Leitura da POF, target, features, base por ocasião |
| `notebooks/02_eda_territorio` | EDA, matriz de oportunidade, features territoriais |
| `notebooks/03_modelos_validacao` | Baseline, Logística, LightGBM, ablação, validação por região, calibração, teste |
| `notebooks/04_explicabilidade_jobs` | SHAP, clusters (jobs), métricas de Guaraná, mapa por UF, Decision Engine |
| `notebooks/05_eda_clima` | Evidência complementar: efeito da chuva no delivery de comida (Delivery Center 2021 + Open-Meteo + BrasilAPI) |
| `src/` | Leitura da POF, coleta externa, features, explicação, Decision Engine, serviço de inferência |
| `api/main.py` | API FastAPI |
| `web/` | Site React + Vite |
| `docs/` | [Data Card](docs/data_card.md) · [Decision Engine e JTBD](docs/decision_engine.md) |
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
- O sistema não afirma causalidade: prioriza contextos, não garante vendas.

## Status
- [x] 01 — Construção da base e Data Card
- [x] 02 — EDA e features territoriais
- [x] 03 — Baseline, modelos e validação
- [x] 04 — Explicabilidade, jobs e Decision Engine
- [x] API + site
- [ ] Vídeo
