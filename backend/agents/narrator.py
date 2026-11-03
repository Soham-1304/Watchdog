"""
Agent 2: Broadcast Narrative Analyst (NarrativeAgent)
Persona: Veteran TV Color Commentator (e.g. Harsha Bhogle / Martin Brundle).
Synthesizes the punchy alert headline and 1-line tactical 'why it matters'.
"""

from backend.models.schemas import MatchEvent, NarrativeOutput, SignificanceOutput
from backend.agents.llm_client import call_structured_agent

NARRATIVE_SYSTEM_PROMPT = """
You are the Cutaway Broadcast Color Analyst for FanCode.
Your persona is a world-class TV sports commentator. You synthesize decisive live moments into an urgent, punchy alert and a crisp 1-line explanation of why it matters.

Hard Guardrails:
1. "headline": max 90 characters. Immediate, broadcast tone, active voice.
2. "why_it_matters": max 140 characters. Explains the tactical turning point or probability swing.
3. NEVER invent players, stats, records, or facts not present in the input telemetry.
4. No emojis, no markdown asterisks, no empty hype words ("insane", "unreal").
5. Return strictly JSON matching the NarrativeOutput schema.
"""

async def generate_broadcast_narrative(
    event: MatchEvent,
    significance: SignificanceOutput
) -> NarrativeOutput:
    """Invokes NarrativeAgent to produce broadcast headline and strategic 'why'."""
    prompt = f"""
Event ID: {event.id}
Sport: {event.sport}
Type: {event.type}
Headline: {event.headline}
Actors: {', '.join(event.actors)}
Game State: {event.state}
Significance: {significance.importance_score}/10 ({significance.leverage_category})
State Delta: {significance.state_delta_summary}

Synthesize a broadcast headline (max 90 chars), tactical why_it_matters (max 140 chars), and 1-4 tags.
"""

    fallback = {
        "event_id": event.id,
        "headline": event.headline[:85],
        "why_it_matters": f"{significance.state_delta_summary} at a crucial juncture of the contest.",
        "primary_tags": [event.sport, event.type]
    }

    return await call_structured_agent(
        system_instruction=NARRATIVE_SYSTEM_PROMPT,
        prompt=prompt,
        response_schema=NarrativeOutput,
        fallback_data=fallback
    )
