"""Agent 2: short, factual broadcast narrative for qualifying events."""

from backend.models.schemas import MatchEvent, NarrativeOutput, SignificanceOutput
from backend.agents.llm_client import AgentCallResult, call_structured_agent
from backend.agents.fixture_alerts import get_fixture_alert

NARRATIVE_SYSTEM_PROMPT = """
You are FanCode's broadcast narrative analyst. Explain why a qualifying sports
event matters in one clear, punchy line for a live viewer.

Strict factual boundaries:
- Use only player/team names, numbers, score, lap, and match facts in the
  current event, current state, significance result, and supplied recent context.
- Do not predict a winner, invent win probability, add history, or imply a
  result that has not happened in the supplied state.
- Keep `headline` to 90 characters and `why_it_matters` to 140 characters.
- Use 1-4 short tags. No markdown, emoji, or empty hype.
- Preserve the event's factual meaning; do not rewrite an uncertain source as
  certainty. Return JSON only.
"""


async def generate_broadcast_narrative(
    event: MatchEvent,
    significance: SignificanceOutput,
    preceding_events: list[MatchEvent] | None = None,
) -> AgentCallResult[NarrativeOutput]:
    history = (preceding_events or [])[-3:]
    recent_context = [
        {"type": item.type, "headline": item.headline, "state": item.state.model_dump() if not isinstance(item.state, dict) else item.state}
        for item in history
    ]
    prompt = f"""
Current event: {event.model_dump_json(exclude={"state"})}
Current state: {event.state.model_dump_json() if not isinstance(event.state, dict) else event.state}
Significance: {significance.model_dump_json()}
Preceding events from this match (oldest first; at most three): {recent_context}

Write a factual broadcast headline and one-line reason this event matters.
"""

    fixture_alert = get_fixture_alert(event.id) or {}
    fallback = {
        "event_id": event.id,
        "headline": str(fixture_alert.get("alert") or event.headline)[:90],
        "why_it_matters": str(fixture_alert.get("why") or significance.state_delta_summary)[:140],
        "primary_tags": (fixture_alert.get("tags") or [event.sport, event.type])[:4],
    }

    return await call_structured_agent(
        system_instruction=NARRATIVE_SYSTEM_PROMPT,
        prompt=prompt,
        response_schema=NarrativeOutput,
        fallback_data=fallback,
    )
