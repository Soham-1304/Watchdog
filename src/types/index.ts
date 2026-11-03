export type SportType = 'cricket' | 'f1' | 'tennis';

export type CricketEventType =
  | 'ball'
  | 'boundary'
  | 'six'
  | 'wicket'
  | 'over_end'
  | 'milestone'
  | 'review'
  | 'innings_end';

export type F1EventType =
  | 'lap'
  | 'overtake'
  | 'pit_stop'
  | 'safety_car'
  | 'vsc'
  | 'red_flag'
  | 'incident'
  | 'fastest_lap'
  | 'lead_change';

export type TennisEventType =
  | 'point'
  | 'game_end'
  | 'break_point'
  | 'break'
  | 'set_end'
  | 'tiebreak_start'
  | 'match_point'
  | 'set_point';

export type EventType = CricketEventType | F1EventType | TennisEventType;

export interface CricketState {
  innings: 1 | 2;
  battingTeam: string;
  bowlingTeam: string;
  score: number;
  wickets: number;
  overs: number; // e.g. 17.4
  target?: number;
  requiredRunRate?: number;
  currentRunRate: number;
  currentBatters: [
    { name: string; runs: number; balls: number },
    { name: string; runs: number; balls: number }
  ];
  currentBowler: { name: string; figures: string };
  lastOverSummary?: string[]; // e.g. ["1", "4", "W", "0", "6", "1"]
}

export interface F1DriverStanding {
  pos: number;
  driver: string;
  code: string;
  team: string;
  gap: string; // e.g. "+1.42s" or "LEADER"
  tyre: 'SOFT' | 'MEDIUM' | 'HARD' | 'INTER' | 'WET';
  pitStops: number;
}

export interface F1State {
  lap: number;
  totalLaps: number;
  leader: string;
  standings: F1DriverStanding[]; // Top 5-10
  status: 'GREEN' | 'SAFETY_CAR' | 'VSC' | 'RED_FLAG';
  lastPitStop?: { driver: string; lap: number; compound: string };
}

export interface TennisState {
  player1: { name: string; seed?: string; setsWon: number };
  player2: { name: string; seed?: string; setsWon: number };
  setScores: string[]; // e.g. ["6-4", "4-6", "6-3", "2-3"]
  currentSet: number;
  gameScore: string; // e.g. "40-30" or "40-AD" or "6-6 (3-4)"
  server: 1 | 2;
  isBreakPoint: boolean;
  isSetPoint: boolean;
  isMatchPoint: boolean;
  isTiebreak: boolean;
}

export type MatchState =
  | { sport: 'cricket'; state: CricketState }
  | { sport: 'f1'; state: F1State }
  | { sport: 'tennis'; state: TennisState };

export interface MatchEvent {
  id: string;
  match_id: string;
  sport: SportType;
  t: number; // replay clock seconds after time-compression
  type: EventType;
  headline: string; // factual, neutral string
  actors: string[];
  state: CricketState | F1State | TennisState;
}

export interface ScoredAlert {
  event_id: string;
  importance: number; // 1 to 10
  alert: string; // max 90 chars
  why: string; // max 140 chars
  novice_note?: string; // max 120 chars
  tags: string[];
}

export interface CatchUpSummary {
  match_id: string;
  sport: SportType;
  from_t: number;
  to_t: number;
  summary: string; // max 2 sentences
  currentStateLine: string;
}

export interface UserSettings {
  enabled: boolean; // In-player quick AI toggle (like CC)
  contentDepth: 'concise' | 'tactical' | 'stat_heavy'; // Concise headline vs tactical why vs stats
  audienceMode: 'novice' | 'pro'; // Novice mode with jargon translator vs veteran fan mode
  alertStyle: 'card' | 'pill' | 'glow_only';
  pins: {
    sports: SportType[];
    players: string[];
  };
  threshold: number; // 1 to 10 (default 7)
  delaySeconds: number; // 0 to 60 (default 0)
  novice: boolean; // default false
  liveAI: boolean; // default false
}

export interface MatchMetadata {
  id: string;
  sport: SportType;
  title: string;
  subtitle: string;
  tournament: string;
  venue?: string;
  competitors: string[];
  status: 'LIVE';
}

export interface SuppressedEvent {
  event: MatchEvent;
  score?: number;
  reason: 'rules_gate' | 'below_threshold' | 'same_match';
  details?: string;
}
