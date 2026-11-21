# Occasion Intelligence — Pizza + Guaraná

Sistema orientado a dados que estima a **propensão de um contexto para a ocasião de pizza** (Occasion Score), mede a **presença atual do Guaraná** nessa ocasião e transforma isso em **recomendações estruturadas de ativação** (Decision Engine).

> Case Inteli Academy × Ambev (TAPI). Projeto individual.

## Ideia central
**O modelo diz onde/quando a pizza acontece → as métricas de marca dizem quanto o Guaraná já está lá → o Decision Engine decide a ativação.**

```
POF 2017-18 (IBGE) + territoriais (SIDRA, OSM)
   → base (1 linha por ocasião de consumo)
   → features → modelo (baseline × Regressão Logística × LightGBM)
   → Occasion Score + SHAP
   → clusters de contexto (jobs) + attach/share de Guaraná
   → Decision Engine (regras documentadas)
   → API (FastAPI) → site (React + Vite)
```

## Estrutura
| Pasta | Conteúdo |
|---|---|
| `notebooks/` | Etapas explicadas passo a passo (01 base, 02 EDA, 03 modelos, 04 explicabilidade e clusters) |
| `src/` | Código reutilizável (leitura da POF, coleta externa, features, decision engine) |
| `docs/` | Data Card e documentação |
| `data/raw` | Microdados brutos (não versionados — ver "Como reproduzir") |
| `data/external` | Features territoriais coletadas |
| `api/`, `web/` | Serviço de inferência e site |

## Como reproduzir
```bash
py -m venv .venv
.venv\Scripts\python -m pip install -r requirements.txt
```
1. Baixe `Dados_20230713.zip` e `Documentacao_20230713.zip` de
   `https://ftp.ibge.gov.br/Orcamentos_Familiares/Pesquisa_de_Orcamentos_Familiares_2017_2018/Microdados/`
   e extraia `CONSUMO_ALIMENTAR.txt`, `MORADOR.txt` em `data/raw/pof/` e a documentação em `data/raw/pof/documentacao/`.
2. `python -m src.coleta_externa` (features territoriais por UF).
3. Rode os notebooks em ordem.

## Documentação
- [Data Card](docs/data_card.md)

## Status
- [x] 01 — Construção da base
- [ ] 02 — EDA e features territoriais
- [ ] 03 — Baseline e modelos
- [ ] 04 — Explicabilidade, segmentos e clusters
- [ ] Decision Engine
- [ ] API + site
- [ ] Vídeo
