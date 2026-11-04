"""Agent 1: contextual significance and leverage scoring."""

from backend.models.schemas import MatchEvent, SignificanceOutput
from backend.agents.llm_client import AgentCallResult, call_structured_agent
from backend.agents.fixture_alerts import get_fixture_alert

SIGNIFICANCE_SYSTEM_PROMPT = """
You are FanCode's objective sports significance analyst.
Score the supplied event from 1 to 10 using the current state and the preceding
three events from the same match. Judge the game equation, not the event label.

Scoring guide:
- 1-3 routine passage: a standard point, lap, single, or ordinary over.
- 4-6 notable: a useful milestone or modest state change.
- 7-8 major_swing: a meaningful leverage change, such as a deciding-set break,
  late wicket, or safety car that compresses a meaningful gap.
- 9-10 championship_decider: the supplied state shows a direct title/match
  decision or a major outcome reversal in the closing phase.

Return exactly the requested fields. `state_delta_summary` must be factual,
under 80 characters, and use only the supplied state or a direct comparison to
the preceding events. Do not infer win probability or claim an outcome that the
event state does not show. Confidence reflects how directly the data supports
the rating. Output JSON only.
"""


def _fallback(event: MatchEvent, preceding_events: list[MatchEvent]) -> dict:
    fixture_alert = get_fixture_alert(event.id)
    state = event.state if isinstance(event.state, dict) else event.state.model_dump()
    previous = preceding_events[-1] if preceding_events else None

    if event.sport == "cricket":
        score = int(state.get("score", 0))
        wickets = int(state.get("wickets", 0))
        overs = float(state.get("overs", 0))
        target = state.get("target")
        runs_needed = max(0, int(target) - score) if target is not None else None
        if event.type == "innings_end":
            score_value = 10
        elif event.type == "wicket":
            score_value = 9 if overs >= 16 or wickets >= 6 else 7
        elif event.type in {"boundary", "six"}:
            score_value = 9 if runs_needed is not None and runs_needed <= 12 and overs >= 19 else (7 if overs >= 15 else 5)
        else:
            score_value = 3
        delta = f"{state.get('battingTeam', 'Batting side')} {score}/{wickets} ({overs} ov)"
        if runs_needed is not None:
            delta += f"; {runs_needed} to win"
    elif event.sport == "f1":
        lap = int(state.get("lap", 0))
        total_laps = int(state.get("totalLaps", 0))
        leader = str(state.get("leader", "Leader"))
        standings = state.get("standings", [])
        winner_shown = any(
            isinstance(item, dict) and item.get("gap") == "WINNER"
            for item in standings
        )
        if event.type == "lead_change" and lap >= total_laps:
            score_value = 10
        elif event.type == "lap" and lap >= total_laps and (winner_shown or "wins" in event.headline.lower()):
            score_value = 10
        elif event.type == "safety_car" and lap >= total_laps - 6:
            score_value = 9
        elif event.type in {"safety_car", "pit_stop", "incident"}:
            score_value = 7 if lap >= total_laps - 10 else 5
        else:
            score_value = 3
        delta = f"{leader} leads; lap {lap}/{total_laps}; {str(state.get('status', 'GREEN')).replace('_', ' ')}"
    else:
        state = state if isinstance(state, dict) else event.state.model_dump()
        game_score = str(state.get("gameScore", ""))
        current_set = int(state.get("currentSet", 1))
        player1 = state.get("player1", {}).get("setsWon", 0)
        player2 = state.get("player2", {}).get("setsWon", 0)
        if event.type == "match_point" or state.get("isMatchPoint"):
            score_value = 10
        elif event.type == "set_point" or state.get("isSetPoint"):
            score_value = 9
        elif event.type == "break":
            score_value = 8 if current_set == 5 else 7
        elif event.type == "break_point" or state.get("isBreakPoint"):
            score_value = 7
        elif event.type == "set_end" and max(player1, player2) >= 3:
            score_value = 10
        elif event.type == "set_end":
            score_value = 8
        else:
            score_value = 3
        delta = f"{player1}-{player2} sets; Set {current_set}, {game_score}"

    if previous:
        prior_state = previous.state if isinstance(previous.state, dict) else previous.state.model_dump()
        if event.sport == "cricket" and previous.sport == "cricket":
            runs = int(state.get("score", 0)) - int(prior_state.get("score", 0))
            wickets = int(state.get("wickets", 0)) - int(prior_state.get("wickets", 0))
            change = f"{wickets} wicket(s) lost" if wickets > 0 else f"{runs:+d} runs"
            delta = f"{change}; {delta}"
        elif event.sport == "f1" and previous.sport == "f1" and prior_state.get("leader") != state.get("leader"):
            delta = f"Lead changes to {state.get('leader')}; lap {state.get('lap')}/{state.get('totalLaps')}"

    score_value = int(fixture_alert.get("importance", score_value)) if fixture_alert else score_value

    if score_value >= 9 and event.type in {"match_point", "set_point", "set_end", "innings_end", "lead_change", "lap"}:
        category = "championship_decider"
    elif score_value >= 7:
        category = "major_swing"
    elif score_value >= 4:
        category = "notable"
    else:
        category = "routine"

    return {
        "event_id": event.id,
        "importance_score": score_value,
        "leverage_category": category,
        "state_delta_summary": delta[:80],
        "confidence": 0.66,
    }


async def evaluate_significance(
    event: MatchEvent,
    preceding_events: list[MatchEvent] | None = None,
) -> AgentCallResult[SignificanceOutput]:
    """Scores an event using only its state and up to three earlier same-match events."""
    history = (preceding_events or [])[-3:]
    prior_context = [
        {"t": item.t, "type": item.type, "headline": item.headline, "state": item.state.model_dump() if not isinstance(item.state, dict) else item.state}
        for item in history
    ]
    prompt = f"""
Current event:
{event.model_dump_json(exclude={"state"} )}
Current state:
{event.state.model_dump_json() if not isinstance(event.state, dict) else event.state}
Preceding events from this match (oldest first; at most three):
{prior_context}

Rate this event and describe the factual state delta. Do not include a player,
number, or result that is absent from these inputs.
"""

    return await call_structured_agent(
        system_instruction=SIGNIFICANCE_SYSTEM_PROMPT,
        prompt=prompt,
        response_schema=SignificanceOutput,
        fallback_data=_fallback(event, history),
    )
