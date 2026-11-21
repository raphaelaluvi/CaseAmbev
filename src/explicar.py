"""Explicabilidade com SHAP: quais fatores empurraram o Occasion Score para cima ou para baixo.

O pipeline transforma variáveis categóricas em várias colunas (one-hot). Para a explicação
fazer sentido para o negócio, somamos as contribuições de volta à variável original
(ex.: 'periodo_noite' + 'periodo_tarde' ... -> 'periodo').
"""
from __future__ import annotations

import numpy as np
import pandas as pd
import shap

NOMES = {
    "dia_semana": "Dia da semana", "periodo": "Período do dia", "refeicao": "Refeição",
    "local": "Local da refeição", "hora": "Horário", "fim_de_semana": "Fim de semana",
    "em_casa": "Consumo em casa", "sexo": "Sexo", "idade": "Idade", "anos_estudo": "Escolaridade",
    "log_renda_pc": "Renda per capita", "n_moradores": "Tamanho da família",
    "n_criancas": "Nº de crianças", "n_adolescentes": "Nº de adolescentes",
    "tem_crianca": "Criança na família", "regiao": "Região", "urbano": "Área urbana",
    "pizzarias_100k": "Pizzarias por 100 mil hab.", "renda_media_pc_uf": "Renda média da UF",
    "log_populacao_uf": "População da UF",
}


class Explicador:
    def __init__(self, pipeline):
        self.prep = pipeline.named_steps["prep"]
        self.modelo = pipeline.named_steps["modelo"]
        self.explainer = shap.TreeExplainer(self.modelo)
        self.nomes_saida = list(self.prep.get_feature_names_out())
        originais = [c for _, _, cols in self.prep.transformers_ if isinstance(cols, list) for c in cols]
        # cada coluna transformada -> variável original (o prefixo mais longo que casar)
        self.origem = []
        for n in self.nomes_saida:
            cand = [o for o in originais if n == o or n.startswith(o + "_")]
            self.origem.append(max(cand, key=len))

    def contribuicoes(self, X: pd.DataFrame) -> pd.DataFrame:
        """Contribuição SHAP (em log-odds) por variável original, uma linha por observação."""
        Xt = self.prep.transform(X)
        sv = self.explainer.shap_values(Xt)
        if isinstance(sv, list):  # versões antigas devolvem uma lista por classe
            sv = sv[1]
        df = pd.DataFrame(sv, columns=self.nomes_saida, index=X.index)
        return df.T.groupby(self.origem, sort=False).sum().T

    def top_fatores(self, X: pd.DataFrame, n: int = 4) -> list[dict]:
        """Os n fatores de maior impacto (positivo ou negativo) para UMA observação."""
        c = self.contribuicoes(X.iloc[[0]]).iloc[0]
        top = c.reindex(c.abs().sort_values(ascending=False).index)[:n]
        linha = X.iloc[0]
        return [
            {
                "fator": NOMES.get(f, f),
                "variavel": f,
                "valor": _valor_legivel(linha, f),
                "impacto": round(float(v), 4),
                "direcao": "aumenta" if v > 0 else "reduz",
            }
            for f, v in top.items()
        ]


def _valor_legivel(linha: pd.Series, f: str):
    """Mostra o valor original quando a feature é uma transformação (ex.: log da renda)."""
    if f == "log_renda_pc" and "renda_pc" in linha:
        return f"R$ {float(linha['renda_pc']):,.0f}".replace(",", ".")
    if f == "log_populacao_uf":
        return f"{10 ** float(linha[f]) / 1e6:.1f} mi hab."
    if f in ("fim_de_semana", "em_casa", "tem_crianca", "urbano"):
        return "sim" if int(linha[f]) == 1 else "não"
    return _formatar(linha.get(f))


def _formatar(v):
    if isinstance(v, (np.floating, float)):
        return round(float(v), 2)
    if isinstance(v, (np.integer,)):
        return int(v)
    return v
