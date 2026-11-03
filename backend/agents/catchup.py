"""
Agent 4: Stream-Return Catch-Up Synthesizer (CatchUpAgent)
Persona: Studio Match Anchor.
Generates an on-demand, 2-sentence recap of missed action when a fan returns to a stream.
"""

from backend.models.schemas import MatchEvent, CatchUpOutput
from backend.agents.llm_client import call_structured_agent

CATCHUP_SYSTEM_PROMPT = """
You are the Cutaway Catch-Up Anchor for FanCode.
When a viewer switches back to a live match they left earlier, you give them a rapid, high-density 2-sentence recap of what happened while they were away, followed by the current match equation.

Guardrails:
1. "recap_narrative": Strictly max 2 sentences (max 180 chars). Focus strictly on score changes, wickets, breaks, or safety cars.
2. "current_game_equation": max 90 chars. (e.g., "SA need 20 off 14 balls" or "HAM leads VER by 0.9s on Lap 58").
3. NEVER invent events that did not occur in the supplied list.
4. Return strictly JSON matching the CatchUpOutput schema.
"""

async def generate_catch_up(
    match_id: str,
    duration_absent_seconds: int,
    missed_events: list[MatchEvent],
    current_state_line: str
) -> CatchUpOutput:
    """Invokes CatchUpAgent to summarize missed events over a time window."""
    events_summary = "\n".join([f"- {e.headline}" for e in missed_events]) or "No major incidents occurred."

    prompt = f"""
Match ID: {match_id}
Duration Away: {duration_absent_seconds} seconds
Missed Events ({len(missed_events)}):
{events_summary}
Current State: {current_state_line}

Synthesize a 2-sentence recap (max 180 chars) and the current game equation (max 90 chars).
"""

    time_mins = duration_absent_seconds // 60
    time_secs = duration_absent_seconds % 60
    time_str = f"{time_mins}m {time_secs}s" if time_mins > 0 else f"{time_secs}s"

    fallback = {
        "match_id": match_id,
        "duration_absent_seconds": duration_absent_seconds,
        "events_missed_count": len(missed_events),
        "recap_narrative": f"Since you left ({time_str}), {len(missed_events)} key moments occurred in the match."[:180],
        "current_game_equation": current_state_line[:90]
    }

    return await call_structured_agent(
        system_instruction=CATCHUP_SYSTEM_PROMPT,
        prompt=prompt,
        response_schema=CatchUpOutput,
        fallback_data=fallback
    )
