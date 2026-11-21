"""Coleta de features territoriais externas, agregadas por UF.

- Pizzarias no OpenStreetMap (Overpass API): estabelecimentos com cuisine=pizza.
- População e rendimento domiciliar per capita (SIDRA/IBGE).

Uso: python -m src.coleta_externa
Saída: data/external/territorio_uf.csv
"""
from __future__ import annotations

import time
from pathlib import Path

import pandas as pd
import requests

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "data" / "external"

UFS = {
    "11": "RO", "12": "AC", "13": "AM", "14": "RR", "15": "PA", "16": "AP", "17": "TO",
    "21": "MA", "22": "PI", "23": "CE", "24": "RN", "25": "PB", "26": "PE", "27": "AL",
    "28": "SE", "29": "BA", "31": "MG", "32": "ES", "33": "RJ", "35": "SP", "41": "PR",
    "42": "SC", "43": "RS", "50": "MS", "51": "MT", "52": "GO", "53": "DF",
}
OVERPASS = [
    "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
    "https://overpass-api.de/api/interpreter",
    "https://overpass.private.coffee/api/interpreter",
]
HEADERS = {"User-Agent": "occasion-intelligence-case/0.1 (projeto academico)"}


def pizzarias_osm(sigla: str) -> int:
    """Conta pontos com cuisine contendo 'pizza' dentro da UF."""
    q = f"""
    [out:json][timeout:180];
    area["ISO3166-2"="BR-{sigla}"]->.a;
    nwr["cuisine"~"pizza",i](area.a);
    out count;
    """
    for tentativa in range(12):
        url = OVERPASS[tentativa % len(OVERPASS)]
        try:
            r = requests.post(url, data={"data": q}, headers=HEADERS, timeout=240)
            if r.status_code == 200:
                return int(r.json()["elements"][0]["tags"]["total"])
        except requests.RequestException:
            pass
        time.sleep(10 * 2 ** (tentativa // 2))  # backoff exponencial
    raise RuntimeError(f"Overpass falhou para {sigla}")


def sidra(url: str, nome: str) -> pd.Series:
    """Lê uma consulta da API SIDRA e devolve valor por código de UF."""
    r = requests.get(url, headers=HEADERS, timeout=120)
    r.raise_for_status()
    df = pd.DataFrame(r.json()[1:])
    return pd.to_numeric(df.set_index("D1C")["V"], errors="coerce").rename(nome)


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    # Tabela 6579: população residente estimada (2018, mesmo período da POF)
    pop = sidra("https://apisidra.ibge.gov.br/values/t/6579/n3/all/v/9324/p/2018", "populacao")
    # Tabela 7531: rendimento médio mensal real domiciliar per capita (PNAD Contínua), 2018
    renda = sidra("https://apisidra.ibge.gov.br/values/t/7531/n3/all/v/10824/p/2018",
                  "renda_media_pc_uf")

    # cache por UF: a coleta pode ser interrompida e retomada sem refazer o que já veio
    cache_path = OUT / "pizzarias_osm_cache.csv"
    cache = (pd.read_csv(cache_path, dtype={"uf": str}).set_index("sigla")["pizzarias_osm"].to_dict()
             if cache_path.exists() else {})
    for cod, sigla in UFS.items():
        if sigla in cache:
            continue
        cache[sigla] = pizzarias_osm(sigla)
        print(sigla, cache[sigla], flush=True)
        pd.DataFrame([{"uf": c, "sigla": s, "pizzarias_osm": cache[s]} for c, s in UFS.items() if s in cache]
                     ).to_csv(cache_path, index=False)
        time.sleep(3)
    df = pd.DataFrame([{"uf": c, "sigla": s, "pizzarias_osm": cache[s]} for c, s in UFS.items()]).set_index("uf")
    df = df.join(pop).join(renda)
    df["pizzarias_100k"] = df["pizzarias_osm"] / df["populacao"] * 1e5
    df.reset_index().to_csv(OUT / "territorio_uf.csv", index=False)
    print(df)


if __name__ == "__main__":
    main()
