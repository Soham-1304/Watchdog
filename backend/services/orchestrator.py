"""
Cutaway: Central Multi-Agent Orchestrator
Coordinates the Rules Gate -> Significance -> Narrator & Novice -> FactGuard pipeline.
"""

import asyncio
from typing import Optional, Tuple
from backend.models.schemas import MatchEvent, EnrichedAlert
from backend.services.rules_gate import evaluate_rules_gate
from backend.agents.significance import evaluate_significance
from backend.agents.narrator import generate_broadcast_narrative
from backend.agents.novice import explain_jargon
from backend.guardrails.fact_guard import FactGuard

class PipelineOrchestrator:
    @classmethod
    async def process_event(
        cls,
        event: MatchEvent
    ) -> Tuple[Optional[EnrichedAlert], Optional[str]]:
        """
        Executes the full pipeline for an incoming event.
        Returns (EnrichedAlert, None) if pivotal alert qualifies,
        or (None, suppression_reason) if filtered.
        """
        # 1. Deterministic Heuristic Gate (O(1))
        is_candidate, reason = evaluate_rules_gate(event)
        if not is_candidate:
            return None, reason or "Filtered by Stage 1 Heuristic Gate"

        # 2. Agent 1: Significance & Leverage Scorer
        significance = await evaluate_significance(event)

        # Baseline threshold: ignore events below 4
        if significance.importance_score < 4:
            return None, f"Significance score {significance.importance_score} below baseline (4/10)"

        # 3. Parallel Execution: Agent 2 (Narrator) and Agent 3 (Novice Translator)
        narrative_task = generate_broadcast_narrative(event, significance)
        novice_task = explain_jargon(event)

        narrative, novice = await asyncio.gather(narrative_task, novice_task)

        # 4. Guardrail Verification: FactGuard
        guard_result = FactGuard.reconcile_narrative(event, narrative)
        safe_data = guard_result.safe_output

        # 5. Assemble Consolidated EnrichedAlert
        alert = EnrichedAlert(
            event_id=event.id,
            match_id=event.match_id,
            sport=event.sport,
            t=event.t,
            importance=significance.importance_score,
            alert=safe_data["headline"],
            why=safe_data["why_it_matters"],
            novice_note=novice.plain_english_explanation if novice else None,
            tags=safe_data.get("tags", [event.sport, event.type]),
            source="live_agent_mesh"
        )

        return alert, None
