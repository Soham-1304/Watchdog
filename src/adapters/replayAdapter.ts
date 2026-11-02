import { MatchEvent, MatchMetadata, ScoredAlert } from '../types';

export class ReplayAdapter {
  private metadata: MatchMetadata[] = [];
  private events: MatchEvent[] = [];
  private alerts: Record<string, ScoredAlert> = {};
  private isLoaded = false;

  public async load(): Promise<void> {
    if (this.isLoaded) return;

    try {
      const [metaRes, cricRes, f1Res, tenRes, alertsRes] = await Promise.all([
        fetch('/replay/metadata.json'),
        fetch('/replay/match-cricket.json'),
        fetch('/replay/match-f1.json'),
        fetch('/replay/match-tennis.json'),
        fetch('/replay/alerts.json'),
      ]);

      this.metadata = await metaRes.json();
      const cricEvents: MatchEvent[] = await cricRes.json();
      const f1Events: MatchEvent[] = await f1Res.json();
      const tenEvents: MatchEvent[] = await tenRes.json();
      this.alerts = await alertsRes.json();

      // Combine and strictly sort by time t
      this.events = [...cricEvents, ...f1Events, ...tenEvents].sort((a, b) => a.t - b.t);
      this.isLoaded = true;
    } catch (err) {
      console.error('[ReplayAdapter] Failed to load replay fixtures:', err);
      throw err;
    }
  }

  public getMatches(): MatchMetadata[] {
    return this.metadata;
  }

  public getMatch(matchId: string): MatchMetadata | undefined {
    return this.metadata.find((m) => m.id === matchId);
  }

  public getAllEvents(): MatchEvent[] {
    return this.events;
  }

  public getEventsForMatch(matchId: string): MatchEvent[] {
    return this.events.filter((e) => e.match_id === matchId);
  }

  public getAlert(eventId: string): ScoredAlert | undefined {
    return this.alerts[eventId];
  }

  public getAllAlerts(): Record<string, ScoredAlert> {
    return this.alerts;
  }

  public getEventsUpTo(time: number): MatchEvent[] {
    return this.events.filter((e) => e.t <= time);
  }

  public getLatestEventForMatch(matchId: string, time: number): MatchEvent | undefined {
    const matchEvents = this.events.filter((e) => e.match_id === matchId && e.t <= time);
    return matchEvents[matchEvents.length - 1];
  }

  public getEventsBetween(matchId: string, fromT: number, toT: number): MatchEvent[] {
    return this.events.filter((e) => e.match_id === matchId && e.t > fromT && e.t <= toT);
  }

  public getMaxReplayTime(): number {
    if (this.events.length === 0) return 360;
    return Math.max(...this.events.map((e) => e.t)) + 15;
  }
}

export const replayAdapter = new ReplayAdapter();
