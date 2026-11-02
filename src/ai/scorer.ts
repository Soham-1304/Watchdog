import { MatchEvent, ScoredAlert } from '../types';
import { ScorerInput, ScorerOutput, validateScorerOutput } from './schema';
import { replayAdapter } from '../adapters/replayAdapter';

export async function scoreEvent(
  event: MatchEvent,
  useLiveAI: boolean = false
): Promise<{ alert: ScoredAlert; source: 'live' | 'cached' }> {
  const cached = replayAdapter.getAlert(event.id);

  if (!useLiveAI) {
    if (cached) return { alert: cached, source: 'cached' };
    return {
      alert: {
        event_id: event.id,
        importance: 5,
        alert: event.headline.slice(0, 85),
        why: 'Notable momentum event in match progress.',
        tags: [event.type],
      },
      source: 'cached',
    };
  }

  // Live AI call with 4-second timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000);

  const payload: ScorerInput = {
    event_id: event.id,
    sport: event.sport,
    type: event.type,
    headline: event.headline,
    actors: event.actors,
    state: event.state as unknown as Record<string, unknown>,
  };

  try {
    const res = await fetch('/api/score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`API score returned status ${res.status}`);
    }

    const data: unknown = await res.json();
    if (validateScorerOutput(data)) {
      return {
        alert: data as ScorerOutput,
        source: 'live',
      };
    }

    throw new Error('Invalid JSON structure from live scorer');
  } catch (err) {
    console.warn(`[Cutaway Scorer] Live AI call failed or timed out (${err}), using fallback cache:`, event.id);
    if (cached) return { alert: cached, source: 'cached' };
    return {
      alert: {
        event_id: event.id,
        importance: 6,
        alert: event.headline.slice(0, 85),
        why: 'Key event evaluated during live match stream.',
        tags: [event.type],
      },
      source: 'cached',
    };
  }
}
