#!/usr/bin/env python3
"""
Cutaway: Precompute Pipeline Script
Runs all replay events through the Python Multi-Agent Mesh and updates public/replay/alerts.json.
"""

import json
import asyncio
from pathlib import Path
from backend.models.schemas import MatchEvent
from backend.services.orchestrator import PipelineOrchestrator

async def main():
    base_dir = Path(__file__).resolve().parent.parent.parent / "public" / "replay"
    cric_path = base_dir / "match-cricket.json"
    f1_path = base_dir / "match-f1.json"
    ten_path = base_dir / "match-tennis.json"
    alerts_out_path = base_dir / "alerts.json"

    events_raw = []
    for p in [cric_path, f1_path, ten_path]:
        with open(p) as f:
            events_raw.extend(json.load(f))

    events = [MatchEvent.model_validate(e) for e in events_raw]
    events.sort(key=lambda x: x.t)

    print("==================================================")
    print(f" Cutaway Precompute Pipeline: {len(events)} Total Events")
    print("==================================================")

    alerts_dict = {}
    qualified_count = 0
    suppressed_count = 0

    for ev in events:
        alert, suppression = await PipelineOrchestrator.process_event(ev)
        if alert:
            qualified_count += 1
            alerts_dict[alert.event_id] = {
                "event_id": alert.event_id,
                "importance": alert.importance,
                "alert": alert.alert,
                "why": alert.why,
                "novice_note": alert.novice_note,
                "tags": alert.tags
            }
            print(f"✅ ALERT [{alert.importance}/10] {alert.sport.upper()} {alert.alert}")
        else:
            suppressed_count += 1
            print(f"🛡️ FILTERED [{ev.sport.upper()}] {ev.type}: {suppression}")

    with open(alerts_out_path, "w") as f:
        json.dump(alerts_dict, f, indent=2)

    suppression_pct = round((suppressed_count / len(events)) * 100, 1)
    print("\n--------------------------------------------------")
    print(f"Total Evaluated: {len(events)}")
    print(f"Pivotal Alerts:  {qualified_count}")
    print(f"Suppressed:      {suppressed_count} ({suppression_pct}% restraint rate)")
    print(f"Saved to:        {alerts_out_path}")
    print("==================================================")

if __name__ == "__main__":
    asyncio.run(main())
