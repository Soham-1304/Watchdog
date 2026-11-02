import { MatchEvent, ScoredAlert, UserSettings } from '../types';

export interface FilterResult {
  shouldAlert: boolean;
  effectiveScore: number;
  reason?: 'same_match' | 'below_threshold';
  details?: string;
  isPinnedBoost: boolean;
}

export function evaluateAlertFilter(
  event: MatchEvent,
  alert: ScoredAlert,
  activeMatchId: string,
  settings: UserSettings
): FilterResult {
  // 1. Never show an alert for the match currently being watched on screen
  if (event.match_id === activeMatchId) {
    return {
      shouldAlert: false,
      effectiveScore: alert.importance,
      reason: 'same_match',
      details: 'Event occurred in currently active stream',
      isPinnedBoost: false,
    };
  }

  // 2. Check if any actor is pinned
  let isPinnedBoost = false;
  let effectiveScore = alert.importance;

  if (settings.pins?.players && settings.pins.players.length > 0) {
    const hasPinnedActor = event.actors.some((actor) =>
      settings.pins.players.some((pinned) =>
        actor.toLowerCase().includes(pinned.toLowerCase()) ||
        pinned.toLowerCase().includes(actor.toLowerCase())
      )
    );

    if (hasPinnedActor) {
      isPinnedBoost = true;
      effectiveScore = Math.min(10, alert.importance + 2);
    }
  }

  // Also check if sport is pinned
  if (settings.pins?.sports && settings.pins.sports.includes(event.sport)) {
    // If sport is pinned, ensure it's prioritized (if not already pinned by player)
    if (!isPinnedBoost) {
      isPinnedBoost = true;
      effectiveScore = Math.min(10, alert.importance + 1);
    }
  }

  // 3. Check against threshold
  if (effectiveScore < settings.threshold) {
    return {
      shouldAlert: false,
      effectiveScore,
      reason: 'below_threshold',
      details: `Score ${effectiveScore} < threshold ${settings.threshold}`,
      isPinnedBoost,
    };
  }

  return {
    shouldAlert: true,
    effectiveScore,
    isPinnedBoost,
  };
}
