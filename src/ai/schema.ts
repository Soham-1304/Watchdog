export interface ScorerInput {
  event_id: string;
  sport: 'cricket' | 'f1' | 'tennis';
  type: string;
  headline: string;
  actors: string[];
  state: Record<string, unknown>;
  recentEvents?: { headline: string; t: number }[];
}

export interface ScorerOutput {
  event_id: string;
  importance: number; // 1 to 10
  alert: string; // max 90 chars
  why: string; // max 140 chars
  novice_note?: string; // max 120 chars
  tags: string[];
}

export function validateScorerOutput(data: unknown): data is ScorerOutput {
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;

  if (typeof d.event_id !== 'string') return false;
  if (typeof d.importance !== 'number' || d.importance < 1 || d.importance > 10) return false;
  if (typeof d.alert !== 'string' || d.alert.length > 95) return false;
  if (typeof d.why !== 'string' || d.why.length > 150) return false;
  if (d.novice_note !== undefined && (typeof d.novice_note !== 'string' || d.novice_note.length > 130)) return false;
  if (!Array.isArray(d.tags)) return false;

  return true;
}
