"""Roda todos os notebooks em ordem (reprodutibilidade).

Uso: .venv\\Scripts\\python rodar_pipeline.py
Pré-requisitos: microdados da POF em data/raw/pof e data/external/territorio_uf.csv
(gerado por `python -m src.coleta_externa`).
"""
import subprocess
import sys
from pathlib import Path

NOTEBOOKS = ["01_construcao_base", "02_eda_territorio", "03_modelos_validacao", "04_explicabilidade_jobs"]
pasta = Path(__file__).parent / "notebooks"

for nb in NOTEBOOKS:
    print(f"==> {nb}", flush=True)
    subprocess.run(
        [sys.executable, "-m", "nbconvert", "--to", "notebook", "--execute", "--inplace",
         "--ExecutePreprocessor.timeout=3600", f"{nb}.ipynb"],
        cwd=pasta, check=True,
    )
print("Pipeline completo. Artefatos em models/.")
