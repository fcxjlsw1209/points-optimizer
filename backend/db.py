from __future__ import annotations

from datetime import datetime
from typing import Dict, Optional

from sqlmodel import Field, Session, SQLModel, create_engine, select, text

from backend.config import db_path

CC_CURRENCIES = ["chase_ur", "amex_mr", "citi_ty", "bilt"]

AIRLINE_CURRENCIES = [
    "ana", "united", "turkish", "air_france", "cathay",
    "aeroplan", "ba", "american", "alaska", "delta",
    "singapore", "virgin", "emirates",
]

ALL_CURRENCIES = CC_CURRENCIES + AIRLINE_CURRENCIES


class WalletEntry(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    currency: str
    balance: int = 0
    updated_at: datetime = Field(default_factory=datetime.utcnow)


def _engine():
    url = f"sqlite:///{db_path()}"
    e = create_engine(url, connect_args={"check_same_thread": False})
    with e.connect() as conn:
        conn.execute(text("PRAGMA journal_mode=WAL"))
    SQLModel.metadata.create_all(e)
    return e


_engine_instance = None


def engine():
    global _engine_instance
    if _engine_instance is None:
        _engine_instance = _engine()
    return _engine_instance


def get_wallet() -> Dict[str, int]:
    with Session(engine()) as session:
        rows = session.exec(select(WalletEntry)).all()
        result = {c: 0 for c in ALL_CURRENCIES}
        for row in rows:
            if row.currency in result:
                result[row.currency] = row.balance
        return result


def upsert_wallet(balances: Dict[str, int]) -> None:
    with Session(engine()) as session:
        for currency, balance in balances.items():
            if currency not in ALL_CURRENCIES:
                continue
            existing = session.exec(
                select(WalletEntry).where(WalletEntry.currency == currency)
            ).first()
            if existing:
                existing.balance = balance
                existing.updated_at = datetime.utcnow()
            else:
                session.add(WalletEntry(currency=currency, balance=balance))
        session.commit()
