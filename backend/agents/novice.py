"""Agent 3: just-in-time explainer for jargon declared by a script event."""

from backend.models.schemas import MatchEvent, NoviceOutput
from backend.agents.llm_client import AgentCallResult, call_structured_agent

NOVICE_SYSTEM_PROMPT = """
You are FanCode's newcomer-friendly sports explainer.
Explain one technical term already identified in the event script. Do not
search for extra jargon or explain unrelated parts of the event.

Rules:
- `term_detected` must exactly match one of the supplied `jargon_terms`.
- Explain it in plain English, in 120 characters or fewer.
- Say why the term matters in this specific event using only supplied context;
  keep that field to 100 characters.
- Do not add players, scores, rules, or outcomes absent from the supplied data.
- Return JSON only.
"""

GLOSSARY = {
    "safety car": "A safety car slows the field after an incident so marshals can work on track.",
    "boxes": "“Box” is team radio shorthand for a driver to enter the pit lane.",
    "soft tyres": "Soft tyres offer more grip but wear faster than harder compounds.",
    "hard tyres": "Hard tyres last longer but usually offer less grip than softer compounds.",
    "hold to love": "The server won the game without dropping a point.",
    "break point": "The receiver can win the game on the next point and take the opponent's serve.",
    "championship point": "The player serving can win the title if they win this point.",
    "yorker": "A yorker is a delivery aimed at the base of the stumps near the batter's feet.",
    "off-cutter": "An off-cutter grips the pitch and changes direction after it bounces.",
}


async def explain_jargon(
    event: MatchEvent,
    preceding_events: list[MatchEvent] | None = None,
) -> AgentCallResult[NoviceOutput] | None:
    """Runs only when the source script explicitly marks jargon on this event."""
    term = next(
        (item for item in event.jargon_terms if item.lower() in GLOSSARY),
        None,
    )
    if not term:
        return None

    history = (preceding_events or [])[-3:]
    recent_context = [
        {"headline": item.headline, "state": item.state.model_dump() if not isinstance(item.state, dict) else item.state}
        for item in history
    ]
    state = event.state.model_dump() if not isinstance(event.state, dict) else event.state
    prompt = f"""
Event ID: {event.id}
Sport: {event.sport}
Event: {event.headline}
Current state: {state}
Script-approved jargon terms: {event.jargon_terms}
Preceding context: {recent_context}

Explain exactly one approved term and connect it to this moment.
"""
    fallback = {
        "event_id": event.id,
        "term_detected": term,
        "plain_english_explanation": GLOSSARY[term.lower()][:120],
        "relevance_to_moment": event.headline[:100],
    }
    return await call_structured_agent(
        system_instruction=NOVICE_SYSTEM_PROMPT,
        prompt=prompt,
        response_schema=NoviceOutput,
        fallback_data=fallback,
    )
