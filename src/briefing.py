"""Briefing de campanha: transforma a categoria de ativação + job + contexto em um plano concreto.

Catálogo de regras e modelos de mensagem (sem LLM). Cada item é uma HIPÓTESE a testar
(ver docs/protocolo_experimento.md), não uma promessa de resultado.
"""
from __future__ import annotations

DIAS = {"Segunda-Feira": "segunda", "Terca-Feira": "terça", "Quarta-Feira": "quarta", "Quinta-Feira": "quinta",
        "Sexta-Feira": "sexta", "Sabado": "sábado", "Domingo": "domingo"}

# o que muda conforme a categoria do Decision Engine
POR_CATEGORIA = {
    "ATIVACAO_PONTO_DE_CONSUMO": dict(
        canal="ponto", canal_label="Pizzaria e restaurante",
        formato="Cardápio com o Guaraná em destaque ao lado da pizza",
        medir="Attach de Guaraná por mesa nas pizzarias parceiras"),
    "ATIVACAO_DELIVERY": dict(
        canal="delivery", canal_label="App de delivery",
        formato="Sugestão de Guaraná na tela de finalizar o pedido",
        medir="Margem por pedido (teste A/B: controle × sugestão)"),
    "COMBO_CASA": dict(
        canal="casa", canal_label="Consumo em casa (varejo e delivery)",
        formato="Combo pizza + Guaraná com preço fechado",
        medir="Margem por pedido (teste A/B: controle × combo)"),
    "AWARENESS_ASSOCIACAO": dict(
        canal="casa", canal_label="Mídia e redes sociais",
        formato="Vídeo curto e post de feed ligando Guaraná à pizza",
        medir="Share de Guaraná entre os refrigerantes da pizza"),
    "MANUTENCAO_MARCA": dict(
        canal="casa", canal_label="Lembrança de marca",
        formato="Lembrete leve no app e nas redes",
        medir="Acompanhar o share de Guaraná (sem ação nova)"),
}

# o que muda conforme o job: quem é o público e qual é o tom da mensagem
POR_JOB = {
    "Jantar em família com crianças": ("Famílias com crianças", "Sexta é dia de pizza com Guaraná, o jantar de todo mundo"),
    "Pizza fora com a família": ("Famílias saindo para comer", "Pizza em família pede um Guaraná gelado"),
    "Noite de fim de semana em casa (adultos)": ("Adultos em casa no fim de semana", "Fim de semana, sofá e pizza com Guaraná"),
    "Pizza em casa no meio da semana (adultos)": ("Adultos no meio da semana", "Quarta também merece: pizza com Guaraná"),
    "Pizza fora de casa (social)": ("Amigos e encontros", "Pizza com a galera, Guaraná na mesa"),
    "Pizza no lanche / refeição do dia": ("Lanche e refeição do dia", "Pizza no meio do dia pede Guaraná"),
}
PADRAO_JOB = ("Público da ocasião", "Pizza combina com Guaraná")


def _momento(dia_semana: str, hora: int, chuva: bool | None, categoria: str) -> str:
    ini, fim = max(hora - 1, 0), min(hora + 1, 23)
    txt = f"{DIAS.get(dia_semana, dia_semana)}, {ini}h às {fim}h"
    if categoria == "ATIVACAO_DELIVERY" and chuva:
        txt += " (reforço em dia de chuva)"
    return txt


def montar_briefing(categoria: str, job: str | None, dia_semana: str, hora: int,
                    chuva_prevista: bool | None = None) -> dict | None:
    """Devolve os cartões do briefing, ou None quando a recomendação é não priorizar."""
    base = POR_CATEGORIA.get(categoria)
    if base is None:
        return None
    publico, mensagem = POR_JOB.get(job or "", PADRAO_JOB)
    return {
        "canal": base["canal"],
        "cartoes": [
            {"titulo": "Canal", "valor": base["canal_label"]},
            {"titulo": "Momento", "valor": _momento(dia_semana, hora, chuva_prevista, categoria)},
            {"titulo": "Público", "valor": publico},
            {"titulo": "Mensagem", "valor": f"“{mensagem}”"},
            {"titulo": "Formato", "valor": base["formato"]},
            {"titulo": "Como medir", "valor": base["medir"]},
        ],
        "aviso": "Hipótese a testar: não é promessa de resultado.",
    }
