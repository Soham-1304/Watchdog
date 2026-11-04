"""Loads deterministic mock agent outputs shipped with the replay fixtures."""

import json
from functools import lru_cache
from pathlib import Path
from typing import Any


@lru_cache(maxsize=1)
def _load_alerts() -> dict[str, dict[str, Any]]:
    path = Path(__file__).resolve().parents[2] / "public" / "replay" / "alerts.json"
    try:
        with path.open(encoding="utf-8") as fixture_file:
            return json.load(fixture_file)
    except (OSError, json.JSONDecodeError):
        return {}


def get_fixture_alert(event_id: str) -> dict[str, Any] | None:
    return _load_alerts().get(event_id)
