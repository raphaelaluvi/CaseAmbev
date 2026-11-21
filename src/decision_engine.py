"""Decision Engine: transforma Occasion Score + contexto + fatores em uma categoria de ativação.

São REGRAS EXPLÍCITAS e documentadas (não um segundo modelo): não há histórico de
campanhas e resultados para treinar "a melhor campanha" (fora do escopo do TAPI).
O sistema não afirma causalidade nem que uma ação venderá mais do que outra.

Ordem de avaliação (a primeira regra que casar define a categoria principal):

R1  classificação 'baixa'                                   -> NAO_PRIORIZAR
R2  score alto/médio + consumo fora de casa                 -> ATIVACAO_PONTO_DE_CONSUMO
R3  score alto + em casa + (fim de semana ou chuva prevista)-> ATIVACAO_DELIVERY
R4  score alto/médio + attach de refrigerante baixo         -> COMBO_CASA
R5  score alto/médio + share de guaraná baixo no segmento   -> AWARENESS_ASSOCIACAO
R6  demais casos                                            -> MANUTENCAO_MARCA

"Baixo" = abaixo da média Brasil da respectiva métrica (calculada na POF).
Regras que também casam, mas não foram as primeiras, entram como 'acoes_complementares'.
"""
from __future__ import annotations

from dataclasses import dataclass, field

CATEGORIAS = {
    "NAO_PRIORIZAR": "Não priorizar",
    "ATIVACAO_PONTO_DE_CONSUMO": "Ativação no ponto de consumo (pizzaria/restaurante)",
    "ATIVACAO_DELIVERY": "Ativação via delivery",
    "COMBO_CASA": "Combo / promoção para consumo em casa",
    "AWARENESS_ASSOCIACAO": "Awareness e construção de associação",
    "MANUTENCAO_MARCA": "Manutenção / lembrança de marca",
}


@dataclass
class Entrada:
    occasion_score: float
    classificacao: str            # alta | media | baixa
    lift: float                   # score / taxa base
    em_casa: bool
    fim_de_semana: bool
    attach_refri_segmento: float
    share_guarana_segmento: float
    attach_refri_brasil: float
    share_guarana_brasil: float
    job: str | None = None
    chuva_prevista: bool | None = None
    top_fatores: list[dict] = field(default_factory=list)


def decidir(e: Entrada) -> dict:
    regras = []  # (codigo, categoria, motivo)

    if e.classificacao == "baixa":
        regras.append(("R1", "NAO_PRIORIZAR",
                       f"Occasion Score abaixo da média Brasil (lift {e.lift:.1f}×): contexto pouco provável para pizza."))
    else:
        nivel = "alto" if e.classificacao == "alta" else "acima da média"
        if not e.em_casa:
            regras.append(("R2", "ATIVACAO_PONTO_DE_CONSUMO",
                           f"Score {nivel} (lift {e.lift:.1f}×) com consumo fora de casa: a decisão do refrigerante acontece na pizzaria/restaurante."))
        if e.classificacao == "alta" and e.em_casa and (e.fim_de_semana or e.chuva_prevista):
            gatilho = "chuva prevista" if e.chuva_prevista else "fim de semana"
            regras.append(("R3", "ATIVACAO_DELIVERY",
                           f"Score alto (lift {e.lift:.1f}×), consumo em casa e {gatilho}: momento típico de pedido por delivery."))
        if e.attach_refri_segmento < e.attach_refri_brasil:
            regras.append(("R4", "COMBO_CASA",
                           f"No segmento, só {e.attach_refri_segmento:.0%} das pizzas vêm com refrigerante (Brasil: {e.attach_refri_brasil:.0%}): espaço para combo pizza + Guaraná."))
        if e.share_guarana_segmento < e.share_guarana_brasil:
            regras.append(("R5", "AWARENESS_ASSOCIACAO",
                           f"Quando há refrigerante na pizza, o guaraná é escolhido em {e.share_guarana_segmento:.0%} dos casos no segmento (Brasil: {e.share_guarana_brasil:.0%}): construir associação Pizza + Guaraná."))
        if not regras:
            regras.append(("R6", "MANUTENCAO_MARCA",
                           f"Score {nivel} e Guaraná já presente acima da média no segmento: manter lembrança de marca."))

    codigo, cat, motivo = regras[0]
    fatores = [f"{f['fator']} ({f['direcao']})" for f in e.top_fatores[:3]]
    if fatores:
        motivo += " Principais fatores do score: " + ", ".join(fatores) + "."
    if e.job:
        motivo += f" Job provável: {e.job}."

    return {
        "recommendation_category": cat,
        "recommendation_label": CATEGORIAS[cat],
        "recommendation_reason": motivo,
        "rule_fired": codigo,
        "acoes_complementares": [
            {"categoria": c, "label": CATEGORIAS[c], "motivo": m} for _, c, m in regras[1:]
        ],
    }
