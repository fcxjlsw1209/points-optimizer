from __future__ import annotations

from typing import Dict, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from backend import db
from backend.optimizer import optimize

app = FastAPI(title="Points Optimizer API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Schemas ───────────────────────────────────────────────────────────────────

class OptimizeRequest(BaseModel):
    origin: str
    destination: str
    cabin: str = "business"       # economy | business | first
    passengers: int = 1
    wallet: Optional[Dict[str, int]] = None   # if None, load from DB


class WalletUpdate(BaseModel):
    chase_ur: int = 0
    amex_mr: int = 0
    citi_ty: int = 0
    bilt: int = 0


# ── Routes ────────────────────────────────────────────────────────────────────

@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.get("/api/wallet")
def get_wallet():
    return db.get_wallet()


@app.put("/api/wallet")
def update_wallet(body: WalletUpdate):
    balances = body.model_dump()
    db.upsert_wallet(balances)
    return db.get_wallet()


@app.post("/api/optimize")
def run_optimize(body: OptimizeRequest):
    wallet = body.wallet
    if wallet is None:
        wallet = db.get_wallet()

    if not body.origin or not body.destination:
        raise HTTPException(status_code=400, detail="origin and destination required")

    cabin = body.cabin.lower()
    if cabin not in ("economy", "business", "first"):
        raise HTTPException(status_code=400, detail="cabin must be economy, business, or first")

    results = optimize(
        origin=body.origin.upper(),
        destination=body.destination.upper(),
        cabin=cabin,
        passengers=max(1, body.passengers),
        wallet=wallet,
    )

    return {
        "origin": body.origin.upper(),
        "destination": body.destination.upper(),
        "cabin": cabin,
        "passengers": body.passengers,
        "wallet": wallet,
        "results": results,
    }
