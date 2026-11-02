import { MatchEvent, EventType } from '../types';

/**
 * Rules Gate (Stage 1 of the Significance Pipeline)
 * 
 * Deterministic and cheap. Only events marked with * qualify to be evaluated
 * by the LLM scorer. Everything else is counted as filtered and costs 0 compute.
 * 
 * Event types eligible:
 * - Cricket: boundary, six, wicket, milestone, review, innings_end
 * - F1: overtake, pit_stop, safety_car, vsc, red_flag, incident, lead_change
 * - Tennis: break_point, break, set_end, tiebreak_start, match_point, set_point
 */
export const CANDIDATE_EVENT_TYPES: Set<EventType> = new Set<EventType>([
  // Cricket
  'boundary',
  'six',
  'wicket',
  'milestone',
  'review',
  'innings_end',
  // F1
  'overtake',
  'pit_stop',
  'safety_car',
  'vsc',
  'red_flag',
  'incident',
  'lead_change',
  // Tennis
  'break_point',
  'break',
  'set_end',
  'tiebreak_start',
  'match_point',
  'set_point',
]);

export interface RulesGateResult {
  isCandidate: boolean;
  reason?: string;
}

export function evaluateRulesGate(event: MatchEvent): RulesGateResult {
  if (CANDIDATE_EVENT_TYPES.has(event.type)) {
    return { isCandidate: true };
  }

  // Generate human-readable reason for the filtered view
  let reason = 'Routine event';
  if (event.sport === 'cricket') {
    reason = event.type === 'ball' ? 'Standard dot or single ball' : 'End of over';
  } else if (event.sport === 'f1') {
    reason = event.type === 'lap' ? 'Routine lap completion' : 'Fastest lap without lead change';
  } else if (event.sport === 'tennis') {
    reason = event.type === 'point' ? 'Routine point' : 'Regular game hold';
  }

  return {
    isCandidate: false,
    reason,
  };
}
