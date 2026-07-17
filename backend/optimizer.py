from __future__ import annotations

import json
from pathlib import Path
from typing import Dict, List, Optional

DATA_DIR = Path(__file__).parent / "data"


def _load():
    with open(DATA_DIR / "transfer_partners.json") as f:
        partners = json.load(f)
    with open(DATA_DIR / "award_charts.json") as f:
        charts = json.load(f)
    with open(DATA_DIR / "cards.json") as f:
        cards = json.load(f)
    return partners, charts, cards


def _region(airport: str, airport_regions: dict) -> Optional[str]:
    return airport_regions.get(airport.upper())


def optimize(
    origin: str,
    destination: str,
    cabin: str,
    passengers: int,
    wallet: Dict[str, int],
) -> List[dict]:
    partners, charts, cards = _load()
    airport_regions = charts["airport_regions"]
    programs = charts["programs"]

    region_from = _region(origin, airport_regions)
    region_to = _region(destination, airport_regions)

    results = []

    for program in programs:
        pid = program["id"]
        pname = program["name"]
        pnotes = program.get("notes", "")

        # Find matching route in award chart
        miles_needed: Optional[int] = None
        for route in program["routes"]:
            if route["from"] == region_from and route["to"] == region_to and route["cabin"] == cabin:
                miles_needed = route["miles"]
                break
        # Try reverse direction
        if miles_needed is None:
            for route in program["routes"]:
                if route["from"] == region_to and route["to"] == region_from and route["cabin"] == cabin:
                    miles_needed = route["miles"]
                    break

        if miles_needed is None:
            continue

        total_miles_needed = miles_needed * passengers

        # Find all currencies that can transfer to this program
        for currency, partner_list in partners.items():
            user_balance = wallet.get(currency, 0)
            for partner in partner_list:
                if partner["airline"] != pid:
                    continue
                ratio = partner["ratio"]
                available_miles = int(user_balance * ratio)
                gap = max(0, total_miles_needed - available_miles)

                # Find cards that can fill the gap
                recommended_cards = []
                if gap > 0:
                    for card in cards:
                        if card["currency"] == currency and card["sub_points"] > 0:
                            if card["sub_points"] >= gap:
                                leftover = available_miles + card["sub_points"] - total_miles_needed
                                recommended_cards.append({
                                    "id": card["id"],
                                    "name": card["name"],
                                    "sub_points": card["sub_points"],
                                    "sub_spend": card["sub_spend"],
                                    "sub_months": card["sub_months"],
                                    "annual_fee": card["annual_fee"],
                                    "leftover_miles": leftover,
                                })
                    # Sort by lowest annual fee first
                    recommended_cards.sort(key=lambda c: (c["annual_fee"], -c["sub_points"]))

                currency_labels = {
                    "chase_ur": "Chase UR",
                    "amex_mr": "Amex MR",
                    "citi_ty": "Citi TY",
                    "bilt": "Bilt",
                }

                results.append({
                    "program_id": pid,
                    "program_name": pname,
                    "airline": program["airline"],
                    "notes": pnotes,
                    "currency": currency,
                    "currency_label": currency_labels.get(currency, currency),
                    "ratio": ratio,
                    "miles_needed": total_miles_needed,
                    "available_miles": available_miles,
                    "gap": gap,
                    "can_redeem_now": gap == 0,
                    "recommended_cards": recommended_cards[:3],
                })

    # Sort: no gap first, then by gap ascending, then by miles_needed ascending
    results.sort(key=lambda r: (r["gap"] > 0, r["gap"], r["miles_needed"]))

    # Deduplicate: keep best currency option per program
    seen = {}
    deduped = []
    for r in results:
        key = r["program_id"]
        if key not in seen:
            seen[key] = r
            deduped.append(r)
        else:
            existing = seen[key]
            if r["gap"] < existing["gap"] or (r["gap"] == existing["gap"] and r["available_miles"] > existing["available_miles"]):
                idx = deduped.index(existing)
                deduped[idx] = r
                seen[key] = r

    return deduped[:8]
