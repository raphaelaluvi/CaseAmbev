# Roteiro do vídeo (até 5 min)

O TAPI exige mostrar: **execução completa (entrada → score → recomendação), métricas, estratégia de validação, fontes, unidade de análise, target e arquitetura**. Sem vídeo, ou com vídeo que não mostre o código e a interface funcionando, a entrega técnica é anulada.

| Tempo | O que mostrar | Fala-guia |
|---|---|---|
| 0:00–0:30 | Site aberto (topo) | "O desafio é aumentar a associação Pizza + Guaraná. Não existe base que registre essa ocasião, então construí uma a partir da POF do IBGE." |
| 0:30–1:15 | README (diagrama) ou seção "Como funciona" | Fontes (POF, SIDRA, OSM, Open-Meteo), **unidade = ocasião de consumo (pessoa × dia × refeição)**, **target = ocasião com pizza**. Por que não "pizza + guaraná": 184 casos → Guaraná vira métrica de marca (attach e share). |
| 1:15–2:15 | Notebook 03: tabela de modelos, gráfico de PR-AUC, ablação, validação por região | "O baseline (dia × período, exigido no TAPI) tem PR-AUC X; o LightGBM tem Y no teste. Validei por domicílio e deixando uma região fora, porque a POF não tem data. A ablação mostra quanto cada fonte agrega." |
| 2:15–3:45 | **Execução ao vivo no site**: 1) sexta 20h, jantar, em casa, SP, família com criança → score, fatores, job, recomendação. 2) Mudar para terça 12h almoço → score cai, "Não priorizar". 3) Clicar em "Consultar previsão do tempo" → regra de chuva. | Ler a justificativa da recomendação. Mostrar que os fatores (SHAP) vêm do modelo e a regra vem do Decision Engine. |
| 3:45–4:30 | Seções "Mapa de oportunidade" e "Jobs" | "O potencial cruza onde a pizza acontece com quanto falta de Guaraná. Os jobs mostram que famílias com crianças já escolhem mais guaraná; ocasiões fora de casa têm menor share — espaço para ativação no ponto de consumo." |
| 4:30–5:00 | Terminal com `pytest` passando + API `/docs` | Limitações (marca não identificada, 2017-18, sem data) e próximos passos (dados da Ambev, experimento A/B de combo). |

## Checklist antes de gravar
- [ ] `python -m uvicorn api.main:app --port 8000` rodando
- [ ] `npm run dev` em `web/` rodando
- [ ] Notebook 03 aberto na seção de resultados
- [ ] Números finais conferidos em `models/metadata.json`
