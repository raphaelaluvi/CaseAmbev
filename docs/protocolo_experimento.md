# Laboratório de Preço — Protocolo de experimento (teste A/B)

> Entregável 3 da Seção 9 do TAPI. **Sem um parceiro e dados transacionais autorizados, a entrega termina no protocolo** — nada aqui é resultado; os números de amostra são ilustrativos e devem ser recalculados com dados reais do pré-período.

## 1. Por que um experimento
O sistema **prioriza contextos** (Occasion Score) e **sugere um tipo de ativação** (Decision Engine), mas não mede se a ativação funciona. Afirmar que um combo "vende mais" ou "dá mais margem" exige comparar, ao mesmo tempo, quem recebeu a oferta com quem não recebeu — escolhidos **ao acaso**. Só assim diferenças de dia, cidade, perfil ou clima se equilibram entre os grupos.

## 2. Hipóteses
| | Hipótese | Ligação com o projeto |
|---|---|---|
| **H1 (principal)** | Oferecer o **combo pizza + Guaraná** em contextos de score alto/médio **aumenta a margem de contribuição por pedido** elegível. | Regra **R4** (attach de refrigerante abaixo da média → combo) |
| H2 | O efeito é **maior em dias úteis** do que no fim de semana (a ocasião é menos habitual, há mais espaço para a oferta mudar o pedido). | Insight de campo: promoções de pizza em dia útil (ex.: "pizza a R$10 às sextas") |
| H3 | O efeito é maior em segmentos com **share de guaraná abaixo da média** (ex.: jobs de adultos, classe A). | Regra **R5** e jobs do notebook 04 |

H2 e H3 são **exploratórias** (análise por subgrupo, sem decisão sozinhas).

## 3. Desenho
**Parceiro:** app de delivery ou rede de pizzarias com dados via **Open Delivery**, PDV ou CRM (integração autorizada).

**Elegibilidade:** pedidos de pizza feitos em contextos com classificação **alta ou média** pelo Occasion Score (contexto = dia, horário, canal, região e perfil disponível no momento do pedido).

**Braços (3):**
| Braço | O que o cliente vê |
|---|---|
| **Controle** | cardápio normal (sem destaque para o Guaraná) |
| **Combo** | sugestão "pizza + Guaraná" em destaque, **sem desconto** |
| **Combo + desconto** | mesma sugestão com **10% de desconto** no combo |

O braço "combo sem desconto" separa o efeito da **sugestão** do efeito do **preço**.

**Unidade de randomização:**
- **App de delivery (preferível):** por **cliente** (hash do id anonimizado), para a mesma pessoa ver sempre o mesmo braço;
- **Pizzaria única:** *switchback* por **turno** (jantar de cada dia sorteado para um braço, balanceado por dia da semana), porque não dá para mostrar cardápios diferentes ao mesmo tempo no balcão.

**Duração:** mínimo de **4 semanas completas** (todos os dias da semana repetidos ≥ 4 vezes; evita confundir efeito com calendário, como visto no notebook 05). Evitar datas atípicas (feriados prolongados, Carnaval) ou registrá-las para análise de sensibilidade.

**Pré-registro:** hipóteses, métricas, critério de decisão e plano de análise escritos **antes** de começar (evita escolher a métrica depois de ver o resultado — o mesmo princípio do teste "aberto uma vez" do notebook 03).

## 4. Métricas
**Principal — margem de contribuição por pedido elegível:**
> margem = receita do pedido − desconto concedido − custo dos produtos − frete subsidiado − taxas do canal

**Secundárias:** attach de Guaraná (% dos pedidos com Guaraná), ticket médio, conversão (visitas → pedido), itens por pedido.

**Guardrails (não podem piorar):** taxa de cancelamento, tempo de entrega, nota do pedido, **canibalização** (queda de outras bebidas do mesmo pedido).

## 5. Tamanho de amostra (ilustrativo)
Para a métrica secundária mais simples — attach de Guaraná —, supondo **10%** no controle e querendo detectar um aumento para **12%** (+2 p.p.), com α = 5% (bilateral) e poder de 80%:

> n por braço ≈ (1,96 + 0,84)² × [0,10·0,90 + 0,12·0,88] ÷ (0,02)² ≈ **3.800 pedidos elegíveis por braço**

Com 3 braços e 2 comparações contra o controle, usar α = 2,5% por comparação (correção de Bonferroni) → ~**4.600 por braço**. A margem (métrica contínua) exige o desvio-padrão do pré-período para o cálculo exato.

## 6. Análise
1. Conferir o **balanceamento** dos braços (dia da semana, região, ticket histórico).
2. Diferença da margem média por pedido (braço − controle), com **intervalo de confiança de 95% por bootstrap** (reamostrando clientes ou turnos — a unidade randomizada).
3. Análise **por intenção de tratar**: todo pedido elegível conta no braço sorteado, mesmo que não tenha aceitado o combo.
4. Subgrupos (H2, H3) apenas exploratórios.

## 7. Critério de decisão (definido antes)
| Resultado | Decisão |
|---|---|
| Margem incremental do braço com **limite inferior do IC 95% > 0** e guardrails estáveis | **Adotar** o braço vencedor nos contextos elegíveis |
| Combo sem desconto ≥ combo com desconto | Adotar **sem** desconto (o efeito é da sugestão, não do preço) |
| IC cruza o zero | **Não adotar**; testar outra faixa de desconto ou outro contexto (ex.: só dias úteis) |
| Guardrail piora (cancelamento, canibalização) | **Interromper** o braço, mesmo com margem positiva |

Só depois de resultados reais, e de testar mais de uma faixa de desconto, é possível falar em **elasticidade** ou **preço ótimo**.

## 8. Dados necessários do parceiro
Por pedido: id anonimizado do cliente, data e hora, canal, loja/região, itens, preço, desconto, frete, custo dos produtos, status (entregue/cancelado), tempo de entrega, braço do experimento.

## 9. Ética e LGPD
- Base legal e aviso de privacidade do parceiro cobrindo testes de oferta; ids **pseudonimizados**; dados agregados na análise.
- A oferta é transparente (preço claro, sem urgência falsa nem pré-seleção do item no carrinho).
- Nenhum público vulnerável é alvo específico; refrigerante é oferecido ao responsável pelo pedido.
