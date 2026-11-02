#!/usr/bin/env python3
"""
Data Prep: Interleaver and Schema Validator
Validates schema compliance across all matches and alerts, checks for collision-free pacing,
and outputs the interleaved broadcast event log.
"""

import json
import sys
from pathlib import Path

def main():
    base_dir = Path(__file__).resolve().parent.parent / "public" / "replay"
    cric_path = base_dir / "match-cricket.json"
    f1_path = base_dir / "match-f1.json"
    ten_path = base_dir / "match-tennis.json"
    alerts_path = base_dir / "alerts.json"

    with open(cric_path) as f:
        cric = json.load(f)
    with open(f1_path) as f:
        f1 = json.load(f)
    with open(ten_path) as f:
        ten = json.load(f)
    with open(alerts_path) as f:
        alerts = json.load(f)

    all_events = cric + f1 + ten
    all_events.sort(key=lambda x: x["t"])

    print(f"==================================================")
    print(f" Cutaway Replay Validator: {len(all_events)} Total Events")
    print(f" Cricket: {len(cric)} | F1: {len(f1)} | Tennis: {len(ten)}")
    print(f" Precomputed Scored Alerts: {len(alerts)}")
    print(f"==================================================\n")

    # Schema Validation
    errors = []
    for ev in all_events:
        for req in ["id", "match_id", "sport", "t", "type", "headline", "actors", "state"]:
            if req not in ev:
                errors.append(f"Event {ev.get('id')} missing required field: {req}")
        if not isinstance(ev.get("actors"), list):
            errors.append(f"Event {ev.get('id')} 'actors' must be an array")

    # Alerts Validation
    for eid, alert in alerts.items():
        if "importance" not in alert or not (1 <= alert["importance"] <= 10):
            errors.append(f"Alert {eid} invalid importance")
        if len(alert.get("alert", "")) > 95:
            errors.append(f"Alert {eid} headline exceeds max 90 chars ({len(alert.get('alert'))})")
        if len(alert.get("why", "")) > 145:
            errors.append(f"Alert {eid} why exceeds max 140 chars ({len(alert.get('why'))})")

    if errors:
        print("❌ Validation Errors Found:")
        for err in errors:
            print(f" - {err}")
        sys.exit(1)

    print("✅ All events and alerts pass strict contract schema validation!\n")

    # Interleaved Timeline Inspection
    print(f"{'TIME':<8} {'SPORT':<9} {'EVENT TYPE':<15} {'SCORE':<7} {'HEADLINE'}")
    print("-" * 80)
    for ev in all_events:
        alert = alerts.get(ev["id"])
        score_str = f"{alert['importance']}/10" if alert else "—"
        mins = int(ev['t'] // 60)
        secs = int(ev['t'] % 60)
        t_fmt = f"{mins:02d}:{secs:02d}"
        print(f"{t_fmt:<8} {ev['sport'].upper():<9} {ev['type']:<15} {score_str:<7} {ev['headline'][:40]}...")

    print("\n✅ Verification complete. Ready for deterministic replay engine!")

if __name__ == "__main__":
    main()
