"""Checks generated narratives against the current event and supplied history."""

import re
from typing import Any

from backend.models.schemas import MatchEvent, NarrativeOutput, FactGuardResult

COMMON_CAPITALIZED_WORDS = {
    "a", "an", "and", "at", "after", "as", "but", "for", "from", "in",
    "it", "of", "on", "or", "the", "to", "with", "this", "that", "lap",
    "set", "safety", "car", "green", "flag", "soft", "hard", "live",
}


def _as_dict(value: Any) -> Any:
    if hasattr(value, "model_dump"):
        return value.model_dump()
    return value


class FactGuard:
    @staticmethod
    def _source_text(event: MatchEvent, preceding_events: list[MatchEvent]) -> str:
        parts = [event.headline, str(_as_dict(event.state))]
        for item in preceding_events[-3:]:
            parts.extend([item.headline, str(_as_dict(item.state))])
        return " ".join(parts)

    @staticmethod
    def extract_entities(event: MatchEvent, preceding_events: list[MatchEvent]) -> set[str]:
        entities: set[str] = set()
        for item in [*preceding_events[-3:], event]:
            entities.update(actor.lower() for actor in item.actors)
            state = _as_dict(item.state)

            def scan(value: Any, key: str = "") -> None:
                if isinstance(value, dict):
                    for child_key, child_value in value.items():
                        if child_key in {"name", "driver", "code", "leader", "battingTeam", "bowlingTeam", "team"} and isinstance(child_value, str):
                            entities.add(child_value.lower())
                        else:
                            scan(child_value, child_key)
                elif isinstance(value, list):
                    for child in value:
                        scan(child, key)

            scan(state)

        for entity in tuple(entities):
            entities.update(part for part in entity.split() if len(part) > 2)
        return entities

    @staticmethod
    def _numbers(text: str) -> set[str]:
        def normalize(value: str) -> str:
            try:
                number = float(value)
                return str(int(number)) if number.is_integer() else str(number).rstrip("0").rstrip(".")
            except ValueError:
                return value

        return {normalize(value.replace(",", "")) for value in re.findall(r"(?<![A-Za-z])\d[\d,]*(?:\.\d+)?", text)}

    @classmethod
    def reconcile_narrative(
        cls,
        event: MatchEvent,
        narrative: NarrativeOutput,
        preceding_events: list[MatchEvent] | None = None,
    ) -> FactGuardResult:
        history = (preceding_events or [])[-3:]
        source_text = cls._source_text(event, history)
        entities = cls.extract_entities(event, history)
        discrepancies: list[str] = []

        if narrative.event_id != event.id:
            discrepancies.append("event_id does not match source event")
        if len(narrative.headline) > 90:
            discrepancies.append("headline exceeds 90 characters")
        if len(narrative.why_it_matters) > 140:
            discrepancies.append("why_it_matters exceeds 140 characters")

        output_text = f"{narrative.headline} {narrative.why_it_matters}"
        unsupported_numbers = cls._numbers(output_text) - cls._numbers(source_text)
        if unsupported_numbers:
            discrepancies.append(f"unsupported numbers: {', '.join(sorted(unsupported_numbers))}")

        source_words = set(re.findall(r"[A-Za-z][A-Za-z'-]*", source_text.lower()))
        output_names = re.findall(r"\b[A-Z][a-z]{2,}\b", output_text)
        for name in output_names:
            lowered = name.lower()
            if lowered in COMMON_CAPITALIZED_WORDS or lowered in source_words:
                continue
            if lowered not in entities:
                discrepancies.append(f"unsupported entity: {name}")

        return FactGuardResult(
            passed=not discrepancies,
            verified_entities=sorted(entity for entity in entities if entity in output_text.lower()),
            flagged_discrepancies=discrepancies,
            safe_output={
                "event_id": event.id,
                "headline": narrative.headline[:90].strip(),
                "why_it_matters": narrative.why_it_matters[:140].strip(),
                "tags": narrative.primary_tags[:4],
            },
        )
