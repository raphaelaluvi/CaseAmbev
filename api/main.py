"""API de inferência — Occasion Intelligence Pizza + Guaraná.

Rodar:  .venv\\Scripts\\python -m uvicorn api.main:app --reload --port 8000
Docs:   http://localhost:8000/docs
"""
from __future__ import annotations

from typing import Literal

import requests
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from src.features import DIAS, LOCAIS, REFEICOES
from src.servico import UF_SIGLA_COD, servico

app = FastAPI(title="Occasion Intelligence — Pizza + Guaraná", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

# Coordenadas das capitais (para a previsão do tempo via Open-Meteo)
CAPITAIS = {
    "RO": (-8.76, -63.90), "AC": (-9.97, -67.81), "AM": (-3.12, -60.02), "RR": (2.82, -60.67),
    "PA": (-1.46, -48.49), "AP": (0.03, -51.07), "TO": (-10.18, -48.33), "MA": (-2.53, -44.30),
    "PI": (-5.09, -42.80), "CE": (-3.73, -38.52), "RN": (-5.79, -35.21), "PB": (-7.12, -34.86),
    "PE": (-8.05, -34.88), "AL": (-9.67, -35.74), "SE": (-10.91, -37.07), "BA": (-12.97, -38.50),
    "MG": (-19.92, -43.94), "ES": (-20.32, -40.34), "RJ": (-22.91, -43.17), "SP": (-23.55, -46.63),
    "PR": (-25.43, -49.27), "SC": (-27.59, -48.55), "RS": (-30.03, -51.23), "MS": (-20.44, -54.65),
    "MT": (-15.60, -56.10), "GO": (-16.68, -49.25), "DF": (-15.79, -47.88),
}

Dia = Literal[tuple(DIAS)]
Refeicao = Literal[tuple(REFEICOES)]
Local = Literal[tuple(LOCAIS)]
UF = Literal[tuple(UF_SIGLA_COD)]


class Contexto(BaseModel):
    """Contrato de entrada: contexto temporal, de público, canal e região."""
    dia_semana: Dia = "Sexta-Feira"
    hora: int = Field(20, ge=0, le=23)
    refeicao: Refeicao = "jantar"
    local: Local = "casa"
    uf: UF = "SP"
    urbano: int = Field(1, ge=0, le=1)
    idade: int = Field(30, ge=10, le=100)
    sexo: Literal["M", "F"] = "F"
    anos_estudo: int = Field(12, ge=0, le=16)
    renda_pc: float = Field(1500, ge=0, description="Renda familiar per capita mensal (R$, valores de 2018)")
    n_moradores: int = Field(3, ge=1, le=20)
    n_criancas: int = Field(1, ge=0, le=15)
    n_adolescentes: int = Field(0, ge=0, le=15)
    chuva_prevista: bool | None = Field(None, description="Se informado, entra na regra de delivery")


@app.get("/health")
def health():
    s = servico()
    return {"status": "ok", "modelo": s.meta["modelo"], "versao": s.meta["versao"]}


@app.get("/opcoes")
def opcoes():
    """Valores aceitos em cada campo (para montar o formulário do site)."""
    return {"dia_semana": DIAS, "refeicao": REFEICOES, "local": LOCAIS, "uf": list(UF_SIGLA_COD)}


@app.post("/predict")
def predict(ctx: Contexto):
    dados = ctx.model_dump()
    chuva = dados.pop("chuva_prevista")
    return servico().prever(dados, chuva_prevista=chuva)


@app.get("/clima/{uf}")
def clima(uf: str):
    """Previsão de chuva para hoje na capital da UF (Open-Meteo, sem chave de API)."""
    uf = uf.upper()
    if uf not in CAPITAIS:
        raise HTTPException(404, "UF inválida")
    lat, lon = CAPITAIS[uf]
    try:
        r = requests.get("https://api.open-meteo.com/v1/forecast", timeout=10, params={
            "latitude": lat, "longitude": lon, "timezone": "America/Sao_Paulo", "forecast_days": 1,
            "daily": "precipitation_probability_max,precipitation_sum,temperature_2m_max",
        })
        r.raise_for_status()
        d = r.json()["daily"]
    except requests.RequestException as e:
        raise HTTPException(502, f"Open-Meteo indisponível: {e}") from e
    prob = d["precipitation_probability_max"][0]
    return {
        "uf": uf, "data": d["time"][0], "prob_chuva_max": prob,
        "chuva_mm": d["precipitation_sum"][0], "temp_max": d["temperature_2m_max"][0],
        "chuva_prevista": bool(prob is not None and prob >= 60),
        "fonte": "Open-Meteo (previsão do dia, capital da UF)",
    }


@app.get("/oportunidades")
def oportunidades():
    """Métricas de Guaraná por segmento e por job (insumos do Decision Engine e do mapa)."""
    s = servico()
    return {"brasil": s.seg["brasil"], "segmentos": s.seg["segmentos"], "jobs": s.seg["jobs"],
            "ufs": s.seg.get("ufs", [])}
