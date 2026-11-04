import {
  CricketState,
  EventPipelineResult,
  F1State,
  LeverageCategory,
  MatchEvent,
  NarrativeOutput,
  NoviceExplainerOutput,
  ScoredAlert,
  SignificanceOutput,
  TennisState,
} from '../types';
import { replayAdapter } from '../adapters/replayAdapter';

export interface EventPipelineOptions {
  threshold: number;
  significanceEnabled: boolean;
  narrativeEnabled: boolean;
  noviceEnabled: boolean;
}

const clampImportance = (score: number) => Math.max(1, Math.min(10, Math.round(score)));

function summarizeState(event: MatchEvent, previousEvents: MatchEvent[]): string {
  const previous = previousEvents[previousEvents.length - 1];

  if (event.sport === 'cricket') {
    const current = event.state as CricketState;
    const prior = previous?.sport === 'cricket' ? previous.state as CricketState : undefined;
    if (!prior) return `${current.battingTeam} ${current.score}/${current.wickets} after ${current.overs} overs`;

    const runDelta = current.score - prior.score;
    const wicketDelta = current.wickets - prior.wickets;
    const change = wicketDelta > 0
      ? `${wicketDelta} wicket${wicketDelta > 1 ? 's' : ''} lost`
      : `${runDelta >= 0 ? '+' : ''}${runDelta} runs`;
    const equation = current.target
      ? `; ${Math.max(0, current.target - current.score)} to win`
      : '';
    return `${change}; ${current.battingTeam} ${current.score}/${current.wickets} (${current.overs})${equation}`.slice(0, 80);
  }

  if (event.sport === 'f1') {
    const current = event.state as F1State;
    const prior = previous?.sport === 'f1' ? previous.state as F1State : undefined;
    const leadChange = prior && prior.leader !== current.leader
      ? `Lead changes to ${current.leader}`
      : `${current.leader} leads`;
    return `${leadChange}; lap ${current.lap}/${current.totalLaps}, ${current.status.replace('_', ' ')}`.slice(0, 80);
  }

  const current = event.state as TennisState;
  const prior = previous?.sport === 'tennis' ? previous.state as TennisState : undefined;
  const sets = `${current.player1.setsWon}–${current.player2.setsWon} sets`;
  const setScore = current.setScores[current.currentSet - 1];
  const change = prior && (prior.gameScore !== current.gameScore || prior.setScores.join('|') !== current.setScores.join('|'))
    ? `Score moves to ${setScore}, ${current.gameScore}`
    : `Set ${current.currentSet}, ${current.gameScore}`;
  return `${sets}; ${change}`.slice(0, 80);
}

function scoreFromFixtureState(event: MatchEvent): number {
  if (event.sport === 'cricket') {
    const state = event.state as CricketState;
    const ballsRemaining = Math.max(0, 120 - Math.floor(state.overs) * 6 - Math.round((state.overs % 1) * 10));
    const runsNeeded = state.target === undefined ? Infinity : state.target - state.score;
    if (event.type === 'innings_end') return 10;
    if (event.type === 'wicket') return state.overs >= 16 || state.wickets >= 6 ? 9 : 7;
    if ((event.type === 'boundary' || event.type === 'six') && runsNeeded <= 12 && ballsRemaining <= 6) return 9;
    if (event.type === 'boundary' || event.type === 'six') return state.overs >= 15 ? 7 : 5;
    return 3;
  }

  if (event.sport === 'f1') {
    const state = event.state as F1State;
    if (event.type === 'lead_change' && state.lap >= state.totalLaps) return 10;
    if (event.type === 'safety_car' && state.lap >= state.totalLaps - 6) return 9;
    if (event.type === 'pit_stop' && state.lap >= state.totalLaps - 6) return 8;
    if (event.type === 'incident' && state.lap >= state.totalLaps - 3) return 8;
    if (event.type === 'safety_car' || event.type === 'pit_stop' || event.type === 'incident') return 6;
    return 3;
  }

  const state = event.state as TennisState;
  if (event.type === 'match_point' || state.isMatchPoint) return 10;
  if (event.type === 'set_point' || state.isSetPoint) return 9;
  if (event.type === 'break') return state.currentSet === 5 ? 8 : 7;
  if (event.type === 'break_point' || state.isBreakPoint) return 7;
  if (event.type === 'set_end') return 8;
  return 3;
}

function categoryFor(score: number, event: MatchEvent): LeverageCategory {
  if (score >= 9 && ['match_point', 'set_point', 'set_end', 'innings_end', 'lead_change'].includes(event.type)) {
    return 'championship_decider';
  }
  if (score >= 7) return 'major_swing';
  if (score >= 4) return 'notable';
  return 'routine';
}

const JARGON_EXPLANATIONS: Record<string, string> = {
  'safety car': 'A safety car slows the field after an incident so marshals can work on track.',
  boxes: '“Box” is team radio shorthand for a driver to enter the pit lane.',
  'soft tyres': 'Soft tyres offer more grip but wear faster than harder compounds.',
  'hard tyres': 'Hard tyres last longer but usually offer less grip than softer compounds.',
  'hold to love': 'The server won the game without dropping a point.',
  'break point': 'The receiver can win the game on the next point and take the opponent’s serve.',
  'championship point': 'The player serving can win the title if they win this point.',
  yorker: 'A yorker is a delivery aimed at the base of the stumps near the batter’s feet.',
  'off-cutter': 'An off-cutter grips the pitch and changes direction after it bounces.',
};

function createNarrative(event: MatchEvent, fixtureAlert: ScoredAlert | undefined, stateDelta: string): NarrativeOutput {
  return {
    event_id: event.id,
    headline: (fixtureAlert?.alert || event.headline).slice(0, 90),
    why_it_matters: (fixtureAlert?.why || stateDelta).slice(0, 140),
    primary_tags: (fixtureAlert?.tags.length ? fixtureAlert.tags : [event.type]).slice(0, 4),
  };
}

function createNoviceOutput(
  event: MatchEvent,
  narrative: NarrativeOutput | null,
  stateDelta: string
): NoviceExplainerOutput | null {
  const term = event.jargon_terms?.find((candidate) => JARGON_EXPLANATIONS[candidate.toLowerCase()]);
  if (!term) return null;

  return {
    event_id: event.id,
    term_detected: term,
    plain_english_explanation: JARGON_EXPLANATIONS[term.toLowerCase()].slice(0, 120),
    relevance_to_moment: (narrative?.why_it_matters || stateDelta).slice(0, 100),
  };
}

export function processReplayEvent(
  event: MatchEvent,
  previousEvents: MatchEvent[],
  options: EventPipelineOptions
): EventPipelineResult {
  const fixtureAlert = replayAdapter.getAlert(event.id);
  const stateDelta = summarizeState(event, previousEvents.slice(-3));
  const hasSignificance = options.significanceEnabled;
  const importance = clampImportance(fixtureAlert?.importance ?? scoreFromFixtureState(event));

  const significance: SignificanceOutput | null = hasSignificance
    ? {
        event_id: event.id,
        importance_score: importance,
        leverage_category: categoryFor(importance, event),
        state_delta_summary: stateDelta,
        confidence: fixtureAlert ? 0.82 : 0.66,
      }
    : null;

  const qualifiesForNarrative = Boolean(significance && importance >= options.threshold);
  const narrative = qualifiesForNarrative && options.narrativeEnabled
    ? createNarrative(event, fixtureAlert, stateDelta)
    : null;
  const novice = options.noviceEnabled
    ? createNoviceOutput(event, narrative, stateDelta)
    : null;

  return {
    event_id: event.id,
    source: fixtureAlert ? 'fixture_mock' : 'deterministic_fallback',
    significance,
    narrative,
    novice,
  };
}

export function toScoredAlert(result: EventPipelineResult): ScoredAlert | null {
  if (!result.significance || !result.narrative) return null;
  return {
    event_id: result.event_id,
    importance: result.significance.importance_score,
    alert: result.narrative.headline,
    why: result.narrative.why_it_matters,
    novice_note: result.novice?.plain_english_explanation,
    tags: result.narrative.primary_tags,
  };
}
