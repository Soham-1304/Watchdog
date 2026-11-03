"""
Agent 1: Significance & Leverage Scorer (SignificanceAgent)
Persona: Quantitative Sports Statistician / Win Probability Analyst.
Evaluates match leverage, game state swings, and score deciders (1-10).
"""

from backend.models.schemas import MatchEvent, SignificanceOutput
from backend.agents.llm_client import call_structured_agent

SIGNIFICANCE_SYSTEM_PROMPT = """
You are the Cutaway Significance & Leverage Scorer for live sports broadcasts.
Your persona is an objective, quantitative sports statistician (like CricViz / AWS Race Strategy).

Task:
Evaluate the given live sports event, its current state, and determine its pivotal significance rating from 1 to 10.

Scoring Rubric:
- 9-10 (championship_decider): Decides or directly flips the match, race, or tournament (e.g. final-over wicket of set batter, lead change on final lap, championship match point, late red flag).
- 7-8 (major_swing): Major swing in momentum or win-probability (e.g. break of serve in deciding set, safety car that wipes out a 12s lead, set batter falling in death overs).
- 4-6 (notable): Notable boundary, routine milestone, or standard pit stop that advances play without flipping the outcome.
- 1-3 (routine): Routine passage of play (regular hold, single run, lap completion).

Rule: Context matters above all. A boundary in Over 4 is 4/10; a boundary in Over 20 needing 8 off 2 balls is 7/10.
Return strictly JSON matching the SignificanceOutput schema.
"""

async def evaluate_significance(event: MatchEvent) -> SignificanceOutput:
    """Invokes SignificanceAgent to produce 1-10 rating and leverage category."""
    prompt = f"""
Event ID: {event.id}
Sport: {event.sport}
Type: {event.type}
Headline: {event.headline}
Actors: {', '.join(event.actors)}
Game State: {event.state}

Calculate importance score (1-10), leverage category, and a concise state delta summary.
"""
    # Deterministic fallback data based on sport heuristics
    fallback_score = 5
    leverage_cat = "notable"
    delta = "Match play advanced"

    if event.type in ["match_point", "set_end", "lead_change", "innings_end"]:
        fallback_score = 10
        leverage_cat = "championship_decider"
        delta = "Championship deciding event reached"
    elif event.type in ["safety_car", "break", "wicket"]:
        fallback_score = 8
        leverage_cat = "major_swing"
        delta = "Major momentum swing in contest"
    elif event.type in ["boundary", "break_point", "pit_stop"]:
        fallback_score = 7
        leverage_cat = "major_swing"
        delta = "High leverage opportunity created"

    fallback = {
        "event_id": event.id,
        "importance_score": fallback_score,
        "leverage_category": leverage_cat,
        "state_delta_summary": delta,
        "confidence": 0.95
    }

    return await call_structured_agent(
        system_instruction=SIGNIFICANCE_SYSTEM_PROMPT,
        prompt=prompt,
        response_schema=SignificanceOutput,
        fallback_data=fallback
    )
