from __future__ import annotations

import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()


def data_dir() -> Path:
    d = Path(os.getenv("DATA_DIR", Path.home() / ".points-optimizer"))
    d.mkdir(parents=True, exist_ok=True)
    return d


def db_path() -> str:
    return str(data_dir() / "points-optimizer.db")
