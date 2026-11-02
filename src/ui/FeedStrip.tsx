import { Radio, ArrowUpRight, ShieldAlert } from 'lucide-react';
import { useReplayStore } from '../store/useReplayStore';
import { replayAdapter } from '../adapters/replayAdapter';
import { CricketState, F1State, TennisState } from '../types';

export function FeedStrip() {
  const matches = useReplayStore((s) => s.matches);
  const activeMatchId = useReplayStore((s) => s.activeMatchId);
  const currentTime = useReplayStore((s) => s.currentTime);
  const activeAlert = useReplayStore((s) => s.activeAlert);
  const switchMatch = useReplayStore((s) => s.switchMatch);

  // Other matches (all matches except currently watched)
  const otherMatches = matches.filter((m) => m.id !== activeMatchId);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-fancode-muted flex items-center gap-1.5">
          <Radio className="w-3.5 h-3.5 text-fancode-orange animate-pulse" />
          Other Live Feeds ({otherMatches.length})
        </h3>
        <span className="text-[11px] text-fancode-subtle hidden sm:inline">
          Tap any feed to switch stream instantly
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {otherMatches.map((m) => {
          const isAlertTarget = activeAlert?.event.match_id === m.id;
          const latestEvent = replayAdapter.getLatestEventForMatch(m.id, currentTime);

          return (
            <div
              key={m.id}
              onClick={() => switchMatch(m.id)}
              className={`group cursor-pointer rounded-xl p-4 transition-all border relative overflow-hidden bg-fancode-surface/90 hover:bg-fancode-card ${
                isAlertTarget
                  ? 'border-fancode-orange animate-pulse-glow shadow-lg shadow-fancode-orange/20 ring-1 ring-fancode-orange'
                  : 'border-fancode-border hover:border-fancode-muted/50'
              }`}
            >
              {/* Alert banner if active for this feed */}
              {isAlertTarget && (
                <div className="absolute top-0 right-0 bg-gradient-to-l from-fancode-orange to-fancode-orangeLight text-white font-extrabold text-[10px] px-3 py-0.5 rounded-bl-lg shadow-md flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3" />
                  PIVOTAL ALERT ({activeAlert.effectiveScore}/10)
                </div>
              )}

              {/* Match Header */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-fancode-orange bg-fancode-orange/10 px-2 py-0.5 rounded uppercase tracking-wider border border-fancode-orange/20">
                    {m.sport}
                  </span>
                  <span className="text-xs text-fancode-subtle truncate max-w-[160px]">
                    {m.tournament}
                  </span>
                </div>
                <div className="text-[10px] text-fancode-subtle group-hover:text-fancode-orange flex items-center gap-0.5 transition-colors">
                  <span>Switch</span>
                  <ArrowUpRight className="w-3 h-3" />
                </div>
              </div>

              {/* Match Title */}
              <h4 className="text-sm font-bold text-white group-hover:text-fancode-orange transition-colors truncate">
                {m.title}
              </h4>

              {/* Mini State Summary */}
              <div className="mt-2 pt-2 border-t border-fancode-border/50 flex items-center justify-between">
                <MiniStateSummary sport={m.sport} state={latestEvent?.state} />
              </div>

              {/* Last event headline */}
              {latestEvent && (
                <p className="mt-2 text-[11px] text-fancode-subtle truncate flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-fancode-orange/60"></span>
                  {latestEvent.headline}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MiniStateSummary({
  sport,
  state,
}: {
  sport: string;
  state: any;
}) {
  if (!state) {
    return <span className="text-xs text-fancode-subtle">Awaiting live data...</span>;
  }

  if (sport === 'cricket') {
    const s = state as CricketState;
    return (
      <div className="flex items-center justify-between w-full text-xs">
        <span className="font-bold text-white">
          {s.battingTeam} <span className="text-fancode-orange font-mono-numbers">{s.score}/{s.wickets}</span>
        </span>
        <span className="font-mono-numbers text-fancode-muted">({s.overs} ov)</span>
      </div>
    );
  }

  if (sport === 'f1') {
    const s = state as F1State;
    return (
      <div className="flex items-center justify-between w-full text-xs">
        <span className="font-bold text-white">
          Lap <span className="font-mono-numbers text-fancode-orange">{s.lap}</span>/{s.totalLaps}
        </span>
        <span className="font-mono-numbers text-fancode-muted">Lead: {s.leader}</span>
      </div>
    );
  }

  // Tennis
  const s = state as TennisState;
  return (
    <div className="flex items-center justify-between w-full text-xs">
      <span className="font-bold text-white">
        Set {s.currentSet} <span className="font-mono-numbers text-fancode-orange">({s.setScores.slice(-1)[0]})</span>
      </span>
      <span className="font-mono-numbers font-bold text-white bg-fancode-surface px-1.5 py-0.5 rounded border border-fancode-border">
        {s.gameScore}
      </span>
    </div>
  );
}
