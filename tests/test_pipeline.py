"""Testes: anti-vazamento, regras do Decision Engine e contrato da API."""
from pathlib import Path

import pandas as pd
import pytest

from src.decision_engine import Entrada, decidir
from src.features import FAMILIAS, colunas, derivar, periodo

ROOT = Path(__file__).resolve().parents[1]
PROIBIDAS = {"y_pizza", "tem_refri", "tem_guarana", "pizza_refri", "pizza_guarana", "n_itens", "DIA_ATIPICO"}


# ------------------------------------------------------------------ anti-vazamento
def test_nenhuma_feature_usa_o_que_foi_consumido():
    cat, num = colunas(list(FAMILIAS))
    assert not PROIBIDAS & set(cat + num)


def test_derivacoes():
    df = pd.DataFrame([{"dia_semana": "Sabado", "hora": 20, "local": "casa", "renda_pc": 1000.0, "n_criancas": 2}])
    d = derivar(df).iloc[0]
    assert d.periodo == "noite" and d.fim_de_semana == 1 and d.em_casa == 1 and d.tem_crianca == 1
    assert d.dia_periodo == "Sabado|noite"
    assert periodo(3) == "madrugada" and periodo(12) == "almoco"


# ------------------------------------------------------------------ decision engine
def entrada(**kw):
    base = dict(occasion_score=0.02, classificacao="alta", lift=4.0, em_casa=True, fim_de_semana=True,
                attach_refri_segmento=0.4, share_guarana_segmento=0.4, attach_refri_brasil=0.33,
                share_guarana_brasil=0.29)
    base.update(kw)
    return Entrada(**base)


def test_score_baixo_nao_prioriza():
    assert decidir(entrada(classificacao="baixa", lift=0.3))["rule_fired"] == "R1"


def test_fora_de_casa_ponto_de_consumo():
    assert decidir(entrada(em_casa=False))["recommendation_category"] == "ATIVACAO_PONTO_DE_CONSUMO"


def test_alta_em_casa_fim_de_semana_delivery():
    assert decidir(entrada())["recommendation_category"] == "ATIVACAO_DELIVERY"


def test_chuva_ativa_delivery_no_meio_da_semana():
    assert decidir(entrada(fim_de_semana=False, chuva_prevista=True))["rule_fired"] == "R3"


def test_share_baixo_awareness():
    out = decidir(entrada(classificacao="media", share_guarana_segmento=0.15))
    assert out["recommendation_category"] == "AWARENESS_ASSOCIACAO"


def test_guarana_forte_manutencao():
    assert decidir(entrada(classificacao="media"))["rule_fired"] == "R6"


def test_regras_secundarias_viram_complementares():
    out = decidir(entrada(share_guarana_segmento=0.1, attach_refri_segmento=0.1))
    assert out["rule_fired"] == "R3"
    assert {a["categoria"] for a in out["acoes_complementares"]} == {"COMBO_CASA", "AWARENESS_ASSOCIACAO"}


# ------------------------------------------------------------------ casos limite
def test_classificacao_nos_limites():
    from src.decision_engine import classificar
    taxa, limiar = 0.005, 0.009
    assert classificar(0.009, taxa, limiar) == "alta"      # exatamente no limiar -> alta
    assert classificar(0.00899, taxa, limiar) == "media"
    assert classificar(0.005, taxa, limiar) == "media"     # exatamente na taxa base -> media
    assert classificar(0.00499, taxa, limiar) == "baixa"
    assert classificar(0.0, taxa, limiar) == "baixa"


def test_segmento_igual_ao_brasil_nao_dispara_combo_nem_awareness():
    # "abaixo da média" é estrito: igual ao Brasil não conta como lacuna
    out = decidir(entrada(classificacao="media", attach_refri_segmento=0.33, share_guarana_segmento=0.29))
    assert out["rule_fired"] == "R6"


def test_chuva_desconhecida_nao_ativa_delivery_no_meio_da_semana():
    out = decidir(entrada(fim_de_semana=False, chuva_prevista=None))
    assert out["rule_fired"] != "R3"


def test_media_em_casa_fim_de_semana_nao_e_delivery():
    # R3 exige score ALTO
    out = decidir(entrada(classificacao="media"))
    assert out["rule_fired"] != "R3"


def test_justificativa_sempre_presente_e_sem_promessa_de_venda():
    for kw in [dict(classificacao="baixa", lift=0.2), dict(em_casa=False), dict(), dict(classificacao="media")]:
        out = decidir(entrada(**kw))
        assert out["recommendation_reason"]
        texto = out["recommendation_reason"].lower()
        assert "vai vender" not in texto and "garante" not in texto and "aumenta as vendas" not in texto


# ------------------------------------------------------------------ API
artefatos = [ROOT / "models" / "occasion_model.joblib", ROOT / "data" / "external" / "territorio_uf.csv"]


@pytest.mark.skipif(not all(p.exists() for p in artefatos), reason="rode os notebooks antes")
def test_contrato_api():
    from fastapi.testclient import TestClient

    from api.main import app

    c = TestClient(app)
    r = c.post("/predict", json={"dia_semana": "Sabado", "hora": 20, "refeicao": "jantar", "local": "casa", "uf": "SP"})
    assert r.status_code == 200
    out = r.json()
    for campo in ["occasion_score", "classification", "top_factors", "recommendation_category",
                  "recommendation_reason", "model_metadata"]:
        assert campo in out
    assert 0 <= out["occasion_score"] <= 1
    assert c.post("/predict", json={"uf": "XX"}).status_code == 422
