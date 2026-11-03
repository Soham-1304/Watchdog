"""
Agent 3: Novice Fan Jargon Translator (NoviceAgent)
Persona: Friendly Sports Educator for casual/newcomer fans.
Detects technical sports terms and explains them in plain English with simple analogies.
"""

from typing import Optional
from backend.models.schemas import MatchEvent, NoviceOutput
from backend.agents.llm_client import call_structured_agent

NOVICE_SYSTEM_PROMPT = """
You are the Cutaway Novice Fan Translator for FanCode.
Your persona is a friendly sports educator helping fans who are new to Formula 1, Tennis, or Cricket.

Task:
Identify technical jargon in the event (e.g., Safety Car, Undercut, Break of Serve, Yorker, DRS, Soft tyres, Tiebreak) and provide a plain-English explanation (max 120 chars) that anyone can understand.

Guardrails:
1. "plain_english_explanation": max 120 characters. Use clear analogies where helpful.
2. Tone must be welcoming, crisp, and educational without sounding condescending.
3. Return strictly JSON matching the NoviceOutput schema.
"""

# Pre-indexed sports glossary for instant lookup or fallback
GLOSSARY = {
    "safety_car": {
        "term": "Safety Car",
        "explanation": "Packs all cars together at a controlled slow speed, wiping out any built-up lead."
    },
    "pit_stop": {
        "term": "Pit Stop & Tyre Strategy",
        "explanation": "Fresh tyres provide superior grip and speed, but pitting costs valuable track position."
    },
    "break": {
        "term": "Break of Serve",
        "explanation": "Winning the opponent's service game; in tennis, this gives a massive advantage toward winning the set."
    },
    "break_point": {
        "term": "Break Point",
        "explanation": "One point away from winning the server's game and taking control of the set."
    },
    "wicket": {
        "term": "Wicket (Dismissal)",
        "explanation": "Losing a set batter in the closing overs puts immense pressure on incoming players."
    },
    "boundary": {
        "term": "Boundary Four",
        "explanation": "Hitting the ball to the rope awards 4 runs without needing to physically run between wickets."
    },
    "lead_change": {
        "term": "Overtake for Lead",
        "explanation": "Passing the leader on track directly decides who wins the race."
    },
    "match_point": {
        "term": "Championship Match Point",
        "explanation": "Winning this single point secures the tournament trophy."
    }
}

async def explain_jargon(event: MatchEvent) -> Optional[NoviceOutput]:
    """Invokes NoviceAgent if technical sports terms are present in the event."""
    term_key = None
    for k in GLOSSARY:
        if k in event.type or k in event.headline.lower():
            term_key = k
            break

    if not term_key and event.type not in ["safety_car", "break", "wicket", "pit_stop", "match_point"]:
        return None

    glossary_match = GLOSSARY.get(term_key or event.type)

    prompt = f"""
Event ID: {event.id}
Sport: {event.sport}
Type: {event.type}
Headline: {event.headline}

Identify the key sports concept and generate a plain-English explanation for a newcomer fan.
"""

    fallback = {
        "event_id": event.id,
        "term_detected": glossary_match["term"] if glossary_match else event.type,
        "plain_english_explanation": (glossary_match["explanation"] if glossary_match else "Key rules event affecting match flow.")[:120],
        "relevance_to_moment": "Directly impacts the match situation."
    }

    return await call_structured_agent(
        system_instruction=NOVICE_SYSTEM_PROMPT,
        prompt=prompt,
        response_schema=NoviceOutput,
        fallback_data=fallback
    )
