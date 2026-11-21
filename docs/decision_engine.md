# Decision Engine e Jobs to be Done

## Papel no sistema
| Peça | Pergunta que responde | Como |
|---|---|---|
| **Occasion Prediction** (LightGBM) | *Quão provável é a ocasião de pizza neste contexto?* | P(pizza \| contexto) = Occasion Score |
| **Jobs** (K-means) | *Que tipo de ocasião de pizza é esta?* | cluster mais próximo entre as ocasiões de pizza da POF |
| **Métricas de marca** | *Quanto o Guaraná já está nela?* | attach de refrigerante e share de guaraná por segmento (região × classe de renda) e por job |
| **Decision Engine** (regras) | *Que tipo de ativação faz sentido?* | regras R1–R6 abaixo |

O Decision Engine **não é um segundo modelo**: não existe histórico de campanhas e resultados para aprender "a melhor campanha" (fora do escopo do TAPI). As regras são explícitas, testadas (`tests/test_pipeline.py`) e **não afirmam causalidade**.

## Classificação do score
| Classe | Regra | Base |
|---|---|---|
| alta | score ≥ limiar do top 10% dos contextos (validação cruzada) | concentra ~2/3 das ocasiões de pizza em 10% dos contextos |
| média | taxa base ≤ score < limiar | acima da média Brasil |
| baixa | score < taxa base | abaixo da média |

O corte "alta" é generoso de propósito: um **falso negativo** (ocasião relevante sem ativação) custa mais que um **falso positivo** (ativação num contexto pouco relevante, ex.: um push).

## Regras (ordem de prioridade)
| Regra | Condição | Categoria | Racional |
|---|---|---|---|
| R1 | classe baixa | Não priorizar | Contexto pouco provável para pizza |
| R2 | classe alta/média + fora de casa | Ativação no ponto de consumo | A escolha do refrigerante acontece na pizzaria/restaurante |
| R3 | classe alta + em casa + (fim de semana **ou** chuva prevista) | Ativação via delivery | Momento típico de pedido; chuva entra como **gatilho de regra** (a POF não tem data para o modelo aprender clima) |
| R4 | classe alta/média + attach de refri do segmento < Brasil | Combo / promoção para casa | O refrigerante ainda não acompanha a pizza: espaço para combo pizza + Guaraná |
| R5 | classe alta/média + share de guaraná do segmento < Brasil | Awareness e construção de associação | Há refrigerante na pizza, mas o guaraná não é o escolhido |
| R6 | demais casos | Manutenção / lembrança de marca | Ocasião provável e Guaraná já acima da média |

A primeira regra que casar é a recomendação principal; as outras que também casarem aparecem como **ações complementares**.

## Ligação com Jobs to be Done
**Job de quem usa o sistema (marketing/trade):**
> *Quando preciso decidir onde e quando investir a verba de ativação do Guaraná, quero ver os contextos com alta chance de pizza e baixa presença da marca, para alocar a verba onde há mais espaço de ganho e justificar a decisão.*

Isso define o contrato da aplicação: score (onde), fatores (por quê), categoria + justificativa (o quê).

**Jobs do consumidor** = clusters das ocasiões de pizza (notebook 04), nomeados pelo perfil: jantar em família com crianças, noite de fim de semana em casa, pizza fora de casa etc.

**Forças do JTBD → regras:**
| Força | Onde aparece | Regra |
|---|---|---|
| **Hábito** (o refrigerante de sempre é outro) | share de guaraná baixo no segmento | R5 — awareness/experimentação |
| **Atrito/ansiedade** (preço, mais um item no pedido) | attach de refrigerante baixo; pedido em casa | R4 — combo; R3 — delivery |
| **Atração** (família, momento especial) | job "família com crianças" tem share de guaraná acima da média | comunicação emocional dentro de R3/R4 |

## Exemplo de oferta sazonal (insight de campo)
Promoções do tipo "pizza a R$10 às sextas" (observada em bairros de SP) são um exemplo concreto da categoria **Combo/promoção**. Não entram como feature (não há histórico público de preços), mas servem de hipótese para o **protocolo de experimento** do Laboratório de Preço: grupo teste com combo pizza + Guaraná na sexta × grupo controle sem combo, métrica = margem incremental por pedido.
