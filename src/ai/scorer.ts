import {
  EnrichedAlert,
  EventPipelineResult,
  MatchEvent,
  NarrativeOutput,
  NoviceExplainerOutput,
  SignificanceOutput,
} from '../types';

export interface EvaluateEventOptions {
  threshold: number;
  significanceEnabled: boolean;
  narrativeEnabled: boolean;
  noviceEnabled: boolean;
}

export interface EvaluateEventResponse extends EventPipelineResult {
  qualified: boolean;
  alert: EnrichedAlert | null;
  suppression_reason: string | null;
}

interface RawEvaluateEventResponse {
  event_id: string;
  source: 'live_agent_mesh' | 'deterministic_fallback';
  qualified: boolean;
  significance: SignificanceOutput | null;
  narrative: NarrativeOutput | null;
  novice: NoviceExplainerOutput | null;
  alert: EnrichedAlert | null;
  suppression_reason: string | null;
}

const API_BASE_URL = (import.meta.env.VITE_CUTAWAY_API_URL || '').replace(/\/$/, '');

function isEvaluationResponse(value: unknown, eventId: string): value is RawEvaluateEventResponse {
  if (!value || typeof value !== 'object') return false;
  const data = value as Partial<RawEvaluateEventResponse>;
  if (data.event_id !== eventId || typeof data.qualified !== 'boolean') return false;
  if (data.source !== 'live_agent_mesh' && data.source !== 'deterministic_fallback') return false;

  if (data.significance !== null && data.significance !== undefined) {
    const significance = data.significance as SignificanceOutput;
    if (significance.event_id !== eventId || typeof significance.importance_score !== 'number' ||
      significance.importance_score < 1 || significance.importance_score > 10 ||
      typeof significance.state_delta_summary !== 'string' || significance.state_delta_summary.length > 80) return false;
  }
  if (data.narrative !== null && data.narrative !== undefined) {
    const narrative = data.narrative as NarrativeOutput;
    if (narrative.event_id !== eventId || typeof narrative.headline !== 'string' || narrative.headline.length > 90 ||
      typeof narrative.why_it_matters !== 'string' || narrative.why_it_matters.length > 140 ||
      !Array.isArray(narrative.primary_tags) || narrative.primary_tags.length < 1 || narrative.primary_tags.length > 4) return false;
  }
  if (data.novice !== null && data.novice !== undefined) {
    const novice = data.novice as NoviceExplainerOutput;
    if (novice.event_id !== eventId || typeof novice.term_detected !== 'string' ||
      typeof novice.plain_english_explanation !== 'string' || novice.plain_english_explanation.length > 120 ||
      typeof novice.relevance_to_moment !== 'string' || novice.relevance_to_moment.length > 100) return false;
  }
  if (data.qualified && (!data.significance || !data.narrative || !data.alert)) return false;
  if (data.alert !== null && data.alert !== undefined) {
    const alert = data.alert as EnrichedAlert;
    if (alert.event_id !== eventId || typeof alert.match_id !== 'string' ||
      typeof alert.importance !== 'number' || alert.importance < 1 || alert.importance > 10 ||
      typeof alert.alert !== 'string' || alert.alert.length > 90 ||
      typeof alert.why !== 'string' || alert.why.length > 140 || !Array.isArray(alert.tags)) return false;
  }
  return true;
}

export async function evaluateReplayEvent(
  event: MatchEvent,
  precedingEvents: MatchEvent[],
  options: EvaluateEventOptions,
): Promise<EvaluateEventResponse | null> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 15_000);

  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event,
        preceding_events: precedingEvents.filter((item) => item.match_id === event.match_id).slice(-3),
        threshold: options.threshold,
        significance_enabled: options.significanceEnabled,
        narrative_enabled: options.narrativeEnabled,
        novice_enabled: options.noviceEnabled,
      }),
      signal: controller.signal,
    });

    if (!response.ok) throw new Error(`Event evaluation returned ${response.status}`);
    const data: unknown = await response.json();
    if (!isEvaluationResponse(data, event.id)) throw new Error('Invalid event evaluation response');
    if (data.novice && !event.jargon_terms?.some((term) => term.toLowerCase() === data.novice?.term_detected.toLowerCase())) {
      throw new Error('Novice output does not match a script-approved jargon term');
    }

    return {
      event_id: data.event_id,
      source: data.source,
      significance: data.significance ?? null,
      narrative: data.narrative ?? null,
      novice: data.novice ?? null,
      qualified: data.qualified,
      alert: data.alert ?? null,
      suppression_reason: data.suppression_reason ?? null,
    };
  } catch {
    // The deterministic client pipeline remains available if the AI service is offline.
    return null;
  } finally {
    window.clearTimeout(timeoutId);
  }
}
