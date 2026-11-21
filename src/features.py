"""Definição única das features: usada no treino (notebook 03) e na inferência (API).

Ter um só lugar evita o erro clássico de processar diferente no treino e em produção.
"""
from __future__ import annotations

import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

# ---------------------------------------------------------------- famílias
# dia_periodo = interação explícita dia da semana × período (ex.: "Sabado|noite"),
# sugerida no roadmap; ajuda principalmente a Regressão Logística, que não cria interações sozinha
CONTEXTO_CAT = ["dia_semana", "periodo", "dia_periodo", "refeicao", "local"]
CONTEXTO_NUM = ["hora", "fim_de_semana", "em_casa"]
PESSOA_CAT = ["sexo"]
PESSOA_NUM = ["idade", "anos_estudo", "log_renda_pc", "n_moradores", "n_criancas",
              "n_adolescentes", "tem_crianca"]
TERRITORIO_CAT = ["regiao"]
TERRITORIO_NUM = ["urbano", "pizzarias_100k", "renda_media_pc_uf", "log_populacao_uf"]

FAMILIAS = {
    "contexto": (CONTEXTO_CAT, CONTEXTO_NUM),
    "pessoa": (PESSOA_CAT, PESSOA_NUM),
    "territorio": (TERRITORIO_CAT, TERRITORIO_NUM),
}

TARGET = "y_pizza"

DIAS = ["Domingo", "Segunda-Feira", "Terca-Feira", "Quarta-Feira", "Quinta-Feira",
        "Sexta-Feira", "Sabado"]
REFEICOES = ["cafe", "almoco", "lanche", "jantar", "ceia", "outra"]
LOCAIS = ["casa", "merenda", "rest_quilo", "lanchonete", "restaurante", "ambulante", "fora_outros"]
REGIOES = ["Norte", "Nordeste", "Sudeste", "Sul", "Centro-Oeste"]


def colunas(familias: list[str]) -> tuple[list[str], list[str]]:
    cat, num = [], []
    for f in familias:
        c, n = FAMILIAS[f]
        cat += c
        num += n
    return cat, num


# ---------------------------------------------------------------- derivações
def periodo(h: float) -> str:
    if pd.isna(h):
        return "indefinido"
    if 5 <= h < 11:
        return "manha"
    if 11 <= h < 15:
        return "almoco"
    if 15 <= h < 18:
        return "tarde"
    if 18 <= h < 23:
        return "noite"
    return "madrugada"


def derivar(df: pd.DataFrame) -> pd.DataFrame:
    """Cria as features derivadas a partir das colunas 'brutas' de contexto.

    Espera: dia_semana, hora, local, renda_pc, n_criancas, e as territoriais.
    """
    df = df.copy()
    df["periodo"] = df["hora"].map(periodo)
    df["dia_periodo"] = df["dia_semana"] + "|" + df["periodo"]
    df["fim_de_semana"] = df["dia_semana"].isin(["Sexta-Feira", "Sabado", "Domingo"]).astype(int)
    df["em_casa"] = (df["local"] == "casa").astype(int)
    df["tem_crianca"] = (df["n_criancas"] > 0).astype(int)
    df["log_renda_pc"] = np.log1p(df["renda_pc"].clip(lower=0))
    return df


# ---------------------------------------------------------------- pré-processamento
def preprocessador(familias: list[str], escalar: bool = True,
                   excluir: tuple[str, ...] = ()) -> ColumnTransformer:
    cat, num = colunas(familias)
    cat = [c for c in cat if c not in excluir]
    num = [c for c in num if c not in excluir]
    passos_num = [("imputar", SimpleImputer(strategy="median"))]
    if escalar:
        passos_num.append(("escalar", StandardScaler()))
    return ColumnTransformer(
        [
            ("cat", OneHotEncoder(handle_unknown="ignore", min_frequency=50, sparse_output=False), cat),
            ("num", Pipeline(passos_num), num),
        ],
        verbose_feature_names_out=False,
    )
