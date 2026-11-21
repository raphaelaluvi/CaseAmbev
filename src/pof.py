"""Leitura dos microdados da POF 2017-2018 (IBGE).

Os arquivos .txt da POF são de largura fixa: cada variável ocupa um intervalo
de caracteres. As posições ficam no "Dicionários de váriaveis.xls" da própria
documentação do IBGE, então lemos as posições de lá em vez de digitá-las à mão.
"""
from __future__ import annotations

from pathlib import Path

import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
POF_DIR = ROOT / "data" / "raw" / "pof"
DICT_XLS = POF_DIR / "documentacao" / "Dicionários de váriaveis.xls"
PROD_XLS = POF_DIR / "documentacao" / "Cadastro de Produtos do Consumo Alimentar.xls"

# Nome da aba do dicionário -> nome do arquivo de dados
REGISTROS = {
    "Consumo Alimentar": "CONSUMO_ALIMENTAR.txt",
    "Morador": "MORADOR.txt",
    "Domicílio": "DOMICILIO.txt",
}


def layout(aba: str) -> pd.DataFrame:
    """Devolve (variavel, inicio, tamanho, decimais) de um registro da POF."""
    d = pd.read_excel(DICT_XLS, sheet_name=aba, header=None, dtype=str)
    d = d.iloc[:, :4]
    d.columns = ["inicio", "tamanho", "decimais", "variavel"]
    d = d[pd.to_numeric(d["inicio"], errors="coerce").notna()].copy()
    d["inicio"] = d["inicio"].astype(int)
    d["tamanho"] = d["tamanho"].astype(int)
    d["decimais"] = pd.to_numeric(d["decimais"], errors="coerce").fillna(0).astype(int)
    d["variavel"] = d["variavel"].str.strip()
    return d.reset_index(drop=True)


def ler_registro(aba: str, colunas: list[str] | None = None) -> pd.DataFrame:
    """Lê um arquivo de microdados, opcionalmente só algumas colunas."""
    lay = layout(aba)
    if colunas is not None:
        faltando = set(colunas) - set(lay["variavel"])
        if faltando:
            raise KeyError(f"Variáveis inexistentes em {aba}: {faltando}")
        lay = lay[lay["variavel"].isin(colunas)]
    colspecs = [(i - 1, i - 1 + t) for i, t in zip(lay["inicio"], lay["tamanho"])]
    df = pd.read_fwf(
        POF_DIR / REGISTROS[aba],
        colspecs=colspecs,
        names=lay["variavel"].tolist(),
        dtype=str,
        encoding="latin-1",
    )
    for col in df.columns:
        df[col] = df[col].str.strip()
    return df


def cadastro_produtos() -> pd.DataFrame:
    """Tabela código -> descrição dos alimentos do consumo alimentar."""
    p = pd.read_excel(PROD_XLS, header=None, dtype=str)
    p = p.iloc[:, :2]
    p.columns = ["codigo", "descricao"]
    p = p[p["codigo"].str.fullmatch(r"\d{7}", na=False)]
    return p.reset_index(drop=True)
