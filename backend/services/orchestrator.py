"""Coordinates the per-event agent triggers and factual output checks."""

import asyncio

from backend.agents.narrator import generate_broadcast_narrative
from backend.agents.novice import GLOSSARY, explain_jargon
from backend.agents.significance import evaluate_significance
from backend.guardrails.fact_guard import FactGuard
from backend.models.schemas import (
    EnrichedAlert,
    EventEvaluationRequest,
    EventEvaluationResponse,
    NarrativeOutput,
    NoviceOutput,
    SignificanceOutput,
)


class PipelineOrchestrator:
    @classmethod
    async def process_event(cls, request: EventEvaluationRequest) -> EventEvaluationResponse:
        event = request.event
        history = [
            item for item in request.preceding_events
            if item.match_id == event.match_id and item.t < event.t
        ][-3:]
        sources: list[str] = []

        significance_call = None
        significance: SignificanceOutput | None = None
        if request.significance_enabled:
            significance_call = await evaluate_significance(event, history)
            significance = significance_call.output
            sources.append(significance_call.source)

        novice_task = (
            explain_jargon(event, history)
            if request.novice_enabled and event.jargon_terms
            else None
        )
        narrative_task = (
            generate_broadcast_narrative(event, significance, history)
            if significance and request.narrative_enabled and significance.importance_score >= request.threshold
            else None
        )
        novice_call, narrative_call = await asyncio.gather(
            novice_task if novice_task is not None else _resolved_none(),
            narrative_task if narrative_task is not None else _resolved_none(),
        )

        novice: NoviceOutput | None = novice_call.output if novice_call else None
        if novice_call:
            sources.append(novice_call.source)
            # The script is the allow-list for explainers; reject model-selected terms outside it.
            if novice.term_detected.lower() not in {term.lower() for term in event.jargon_terms}:
                term = next((term for term in event.jargon_terms if term.lower() in GLOSSARY), None)
                novice = NoviceOutput(
                    event_id=event.id,
                    term_detected=term or event.jargon_terms[0],
                    plain_english_explanation=GLOSSARY.get((term or "").lower(), "A technical term used in this sport.")[:120],
                    relevance_to_moment=event.headline[:100],
                )
                sources.append("deterministic_fallback")

        narrative: NarrativeOutput | None = narrative_call.output if narrative_call else None
        if narrative_call:
            sources.append(narrative_call.source)
            guard = FactGuard.reconcile_narrative(event, narrative, history)
            if not guard.passed:
                narrative = NarrativeOutput(
                    event_id=event.id,
                    headline=event.headline[:90],
                    why_it_matters="This event changes the supplied match state.",
                    primary_tags=[event.sport, event.type],
                )
                sources.append("deterministic_fallback")
            else:
                narrative = NarrativeOutput(
                    event_id=event.id,
                    headline=guard.safe_output["headline"],
                    why_it_matters=guard.safe_output["why_it_matters"],
                    primary_tags=guard.safe_output["tags"],
                )

        source = "live_agent_mesh" if sources and all(item == "live_agent_mesh" for item in sources) else "deterministic_fallback"
        qualified = bool(significance and narrative)
        alert = None
        if qualified and significance and narrative:
            alert = EnrichedAlert(
                event_id=event.id,
                match_id=event.match_id,
                sport=event.sport,
                t=event.t,
                importance=significance.importance_score,
                alert=narrative.headline,
                why=narrative.why_it_matters,
                novice_note=novice.plain_english_explanation if novice else None,
                tags=narrative.primary_tags,
                source="live_agent_mesh" if source == "live_agent_mesh" else "cached_fallback",
            )

        if not request.significance_enabled:
            suppression_reason = "Significance scoring is disabled"
        elif not request.narrative_enabled:
            suppression_reason = "Narrative analysis is disabled"
        elif significance and significance.importance_score < request.threshold:
            suppression_reason = f"Score {significance.importance_score} is below threshold {request.threshold}"
        else:
            suppression_reason = None

        return EventEvaluationResponse(
            event_id=event.id,
            source=source,
            qualified=qualified,
            significance=significance,
            narrative=narrative,
            novice=novice,
            alert=alert,
            suppression_reason=suppression_reason,
        )


async def _resolved_none():
    return None
