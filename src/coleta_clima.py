"""Coleta de clima histórico (Open-Meteo Archive) e feriados (BrasilAPI) para o período
do dataset Delivery Center (jan-abr/2021), nas 4 cidades dos hubs.

Uso: python -m src.coleta_clima
Saídas (snapshots datados, versionados no repositório):
  data/external/clima_horario_2021.csv   cidade × hora: precipitação (mm) e temperatura (°C)
  data/external/feriados_2021.csv        feriados nacionais de 2021
"""
from __future__ import annotations

from datetime import date
from pathlib import Path

import pandas as pd
import requests

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "data" / "external"
HEADERS = {"User-Agent": "occasion-intelligence-case/0.1 (projeto academico)"}

# Coordenadas do centro de cada cidade (os hubs ficam dentro delas)
CIDADES = {
    "SAO PAULO": (-23.55, -46.63),
    "RIO DE JANEIRO": (-22.91, -43.17),
    "PORTO ALEGRE": (-30.03, -51.23),
    "CURITIBA": (-25.43, -49.27),
}
INICIO, FIM = "2021-01-01", "2021-04-30"


def clima_horario(cidade: str, lat: float, lon: float) -> pd.DataFrame:
    r = requests.get("https://archive-api.open-meteo.com/v1/archive", headers=HEADERS, timeout=120, params={
        "latitude": lat, "longitude": lon, "start_date": INICIO, "end_date": FIM,
        "hourly": "precipitation,temperature_2m", "timezone": "America/Sao_Paulo",
    })
    r.raise_for_status()
    h = r.json()["hourly"]
    df = pd.DataFrame({"momento": pd.to_datetime(h["time"]), "chuva_mm": h["precipitation"],
                       "temperatura": h["temperature_2m"]})
    df.insert(0, "cidade", cidade)
    return df


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    clima = pd.concat([clima_horario(c, *xy) for c, xy in CIDADES.items()], ignore_index=True)
    clima.to_csv(OUT / "clima_horario_2021.csv", index=False)

    fer = pd.DataFrame(requests.get("https://brasilapi.com.br/api/feriados/v1/2021", headers=HEADERS,
                                    timeout=60).json())
    fer.to_csv(OUT / "feriados_2021.csv", index=False)

    (OUT / "coleta_clima_LEIAME.txt").write_text(
        f"Coletado em {date.today().isoformat()}\n"
        "Clima: Open-Meteo Archive API (reanálise ERA5), horário, fuso America/Sao_Paulo, "
        f"{INICIO} a {FIM}, coordenadas do centro de cada cidade.\n"
        "Feriados: BrasilAPI /api/feriados/v1/2021 (nacionais).\n", encoding="utf-8")
    print(clima.groupby("cidade")["chuva_mm"].agg(["count", "sum"]))
    print(fer)


if __name__ == "__main__":
    main()
