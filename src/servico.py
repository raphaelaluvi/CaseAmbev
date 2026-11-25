"""Serviço de inferência: contexto -> Occasion Score -> fatores -> job -> recomendação.

Usado pela API (api/main.py) e pelos testes. Carrega os artefatos salvos em models/.
"""
from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path

import joblib
import numpy as np
import pandas as pd

from src.briefing import montar_briefing
from src.decision_engine import Entrada, classificar, decidir
from src.explicar import Explicador
from src.features import derivar

ROOT = Path(__file__).resolve().parents[1]
MODELS = ROOT / "models"

UF_SIGLA_COD = {
    "RO": "11", "AC": "12", "AM": "13", "RR": "14", "PA": "15", "AP": "16", "TO": "17",
    "MA": "21", "PI": "22", "CE": "23", "RN": "24", "PB": "25", "PE": "26", "AL": "27",
    "SE": "28", "BA": "29", "MG": "31", "ES": "32", "RJ": "33", "SP": "35", "PR": "41",
    "SC": "42", "RS": "43", "MS": "50", "MT": "51", "GO": "52", "DF": "53",
}
REGIAO_POR_DIGITO = {"1": "Norte", "2": "Nordeste", "3": "Sudeste", "4": "Sul", "5": "Centro-Oeste"}


class Servico:
    def __init__(self):
        self.modelo = joblib.load(MODELS / "occasion_model.joblib")
        self.meta = json.loads((MODELS / "metadata.json").read_text(encoding="utf-8"))
        self.seg = json.loads((MODELS / "segmentos.json").read_text(encoding="utf-8"))
        jobs = joblib.load(MODELS / "jobs_kmeans.joblib")
        self.kmeans, self.vars_job, self.nomes_job = jobs["pipeline"], jobs["variaveis"], jobs["nomes"]
        self.explicador = Explicador(self.modelo)
        terr = pd.read_csv(ROOT / "data" / "external" / "territorio_uf.csv", dtype={"uf": str})
        self.terr = terr.set_index("sigla")
        self.seg_idx = {(s["regiao"], s["classe_renda"]): s for s in self.seg["segmentos"]}
        self.jobs_idx = {j["job"]: j for j in self.seg["jobs"]}

    # ------------------------------------------------------------ helpers
    def classe_renda(self, renda_pc: float) -> str:
        lim = self.seg["classe_renda_limites"]
        for classe in ["E", "D", "C", "B"]:
            if renda_pc <= lim[classe][1]:
                return classe
        return "A"

    def montar_linha(self, ctx: dict) -> pd.DataFrame:
        sigla = ctx["uf"].upper()
        cod = UF_SIGLA_COD[sigla]
        t = self.terr.loc[sigla]
        linha = {
            **ctx,
            "uf": cod,
            "regiao": REGIAO_POR_DIGITO[cod[0]],
            "pizzarias_100k": float(t["pizzarias_100k"]),
            "renda_media_pc_uf": float(t["renda_media_pc_uf"]),
            "log_populacao_uf": float(np.log10(t["populacao"])),
        }
        return derivar(pd.DataFrame([linha]))

    # ------------------------------------------------------------ previsão
    def prever(self, ctx: dict, chuva_prevista: bool | None = None) -> dict:
        X = self.montar_linha(ctx)
        p = float(self.modelo.predict_proba(X)[:, 1][0])
        taxa_base, limiar = self.meta["taxa_base"], self.meta["limiar_alta"]
        classe = classificar(p, taxa_base, limiar)
        fatores = self.explicador.top_fatores(X, n=4)

        # os jobs vêm de clusters de ocasiões COM pizza: só fazem sentido se a pizza é provável
        job = (self.nomes_job[int(self.kmeans.predict(X[self.vars_job])[0])]
               if classe != "baixa" else None)
        r = X.iloc[0]
        classe_renda = self.classe_renda(float(ctx["renda_pc"]))
        s = self.seg_idx.get((r["regiao"], classe_renda), {})
        br = self.seg["brasil"]

        entrada = Entrada(
            occasion_score=p, classificacao=classe, lift=p / taxa_base,
            em_casa=bool(r["em_casa"]), fim_de_semana=bool(r["fim_de_semana"]),
            attach_refri_segmento=s.get("attach_refri", br["attach_refri"]),
            share_guarana_segmento=s.get("share_guarana", br["share_guarana"]),
            attach_refri_brasil=br["attach_refri"], share_guarana_brasil=br["share_guarana"],
            job=job, chuva_prevista=chuva_prevista, top_fatores=fatores,
        )
        decisao = decidir(entrada)
        briefing = montar_briefing(decisao["recommendation_category"], job, ctx["dia_semana"], int(ctx["hora"]), chuva_prevista)
        return {
            "occasion_score": round(p, 5),
            "occasion_score_pct": round(100 * p, 2),
            "lift": round(p / taxa_base, 2),
            "classification": classe,
            "top_factors": fatores,
            "job": ({"nome": job, **{k: v for k, v in self.jobs_idx.get(job, {}).items() if k != "job"}}
                    if job else None),
            "segmento": {
                "regiao": r["regiao"], "classe_renda": classe_renda,
                "attach_refri": entrada.attach_refri_segmento,
                "share_guarana": entrada.share_guarana_segmento,
                "brasil": br,
            },
            **decisao,
            "briefing": briefing,
            "model_metadata": {
                "modelo": self.meta["modelo"], "versao": self.meta["versao"],
                "taxa_base": taxa_base, "limiar_alta": limiar,
                "metricas_teste": self.meta["metricas_teste"],
            },
        }


@lru_cache(maxsize=1)
def servico() -> Servico:
    return Servico()
