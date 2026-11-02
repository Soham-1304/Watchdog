import { MatchEvent, SportType, CricketState, F1State, TennisState, CatchUpSummary } from '../types';

export function formatTimeSpan(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs}s`;
}

export function generateCatchUpSummary(
  matchId: string,
  sport: SportType,
  fromT: number,
  toT: number,
  events: MatchEvent[],
  currentState: CricketState | F1State | TennisState
): CatchUpSummary {
  const timeSpanText = formatTimeSpan(toT - fromT);

  // If no events happened while user was away
  if (events.length === 0) {
    let stateLine = '';
    if (sport === 'cricket') {
      const s = currentState as CricketState;
      stateLine = `${s.battingTeam} ${s.score}/${s.wickets} (${s.overs} ov)`;
    } else if (sport === 'f1') {
      const s = currentState as F1State;
      stateLine = `Lap ${s.lap}/${s.totalLaps} · Leader: ${s.leader}`;
    } else {
      const s = currentState as TennisState;
      stateLine = `Set ${s.currentSet} (${s.setScores.join(' ')}) · ${s.gameScore}`;
    }

    return {
      match_id: matchId,
      sport,
      from_t: fromT,
      to_t: toT,
      summary: `You were away for ${timeSpanText}. No major incidents or score changes occurred during this window.`,
      currentStateLine: stateLine,
    };
  }

  // Synthesize based on sport
  let narrative = '';
  let currentStateLine = '';

  if (sport === 'cricket') {
    const s = currentState as CricketState;
    const wickets = events.filter((e) => e.type === 'wicket');
    const boundaries = events.filter((e) => e.type === 'boundary' || e.type === 'six');

    if (wickets.length > 0) {
      const dismissed = wickets.map((w) => w.actors[0] || 'Batter').join(', ');
      narrative = `Since you left (${timeSpanText}), ${wickets.length} wicket${wickets.length > 1 ? 's' : ''} fell (${dismissed}).`;
    } else if (boundaries.length > 0) {
      narrative = `Since you left (${timeSpanText}), ${boundaries.length} boundary was scored as the batting side accelerated.`;
    } else {
      narrative = `Since you left (${timeSpanText}), ${events.length} deliveries were bowled in a tense sequence.`;
    }

    const runsNeeded = s.target ? s.target - s.score : null;
    const ballsRemaining = Math.max(0, 120 - Math.floor(s.overs) * 6 - Math.round((s.overs % 1) * 10));
    const equation = runsNeeded !== null && runsNeeded > 0 ? ` · Need ${runsNeeded} off ${ballsRemaining}b` : '';
    currentStateLine = `${s.battingTeam} ${s.score}/${s.wickets} in ${s.overs} ov (${s.currentRunRate.toFixed(2)} RPO)${equation}`;
  } else if (sport === 'f1') {
    const s = currentState as F1State;
    const sc = events.find((e) => e.type === 'safety_car');
    const pitStops = events.filter((e) => e.type === 'pit_stop');
    const leadChanges = events.filter((e) => e.type === 'lead_change');

    const parts: string[] = [];
    if (sc) parts.push('Safety Car was deployed after Latifi crash');
    if (pitStops.length > 0) {
      const pitDrivers = pitStops.map((p) => p.actors[0]).join(', ');
      parts.push(`${pitDrivers} pitted for tyres`);
    }
    if (leadChanges.length > 0) {
      parts.push(`lead changed to ${leadChanges[leadChanges.length - 1].actors[0]}`);
    }

    if (parts.length > 0) {
      narrative = `Since you left (${timeSpanText}), ${parts.join(' and ')}.`;
    } else {
      narrative = `Since you left (${timeSpanText}), cars completed ${events.length} laps under steady track conditions.`;
    }

    const top3 = s.standings.slice(0, 3).map((d) => `${d.pos}. ${d.code} (${d.gap})`).join('  ');
    currentStateLine = `Lap ${s.lap}/${s.totalLaps} [${s.status}] · ${top3}`;
  } else {
    // Tennis
    const s = currentState as TennisState;
    const breaks = events.filter((e) => e.type === 'break');
    const breakPoints = events.filter((e) => e.type === 'break_point');
    const matchPoints = events.filter((e) => e.type === 'match_point');

    if (breaks.length > 0) {
      narrative = `Since you left (${timeSpanText}), ${breaks[0].actors[0]} secured a crucial break of serve!`;
    } else if (matchPoints.length > 0) {
      narrative = `Since you left (${timeSpanText}), championship point was reached in the final set!`;
    } else if (breakPoints.length > 0) {
      narrative = `Since you left (${timeSpanText}), high-tension break points were contested.`;
    } else {
      narrative = `Since you left (${timeSpanText}), play progressed through steady baseline rallies.`;
    }

    currentStateLine = `${s.player1.name} vs ${s.player2.name} · Set ${s.currentSet} [${s.setScores.join(' ')}] · ${s.gameScore}`;
  }

  return {
    match_id: matchId,
    sport,
    from_t: fromT,
    to_t: toT,
    summary: narrative,
    currentStateLine,
  };
}
