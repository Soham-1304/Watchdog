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
    <div className="space-y-3.5">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-black uppercase tracking-wider text-broadcast-muted flex items-center gap-2">
          <Radio className="w-3.5 h-3.5 text-broadcast-orange animate-pulse" />
          Concurrent Match Feeds ({otherMatches.length})
        </h3>
        <span className="text-[11px] text-broadcast-subtle hidden sm:inline">
          Tap any feed to switch live stream instantly
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {otherMatches.map((m) => {
          const isAlertTarget = activeAlert?.event.match_id === m.id;
          const latestEvent = replayAdapter.getLatestEventForMatch(m.id, currentTime);

          return (
            <div
              key={m.id}
              onClick={() => switchMatch(m.id)}
              className={`group cursor-pointer rounded-2xl p-4 transition-all relative overflow-hidden broadcast-glass-card hover:bg-broadcast-cardHover ${
                isAlertTarget
                  ? 'border-broadcast-orange animate-broadcast-pulse shadow-2xl shadow-broadcast-orange/30 ring-1 ring-broadcast-orange'
                  : 'border-broadcast-border hover:border-broadcast-borderLight'
              }`}
            >
              {/* Alert banner if active for this feed */}
              {isAlertTarget && (
                <div className="absolute top-0 right-0 bg-gradient-to-l from-broadcast-orange to-broadcast-amber text-white font-black text-[10px] px-3.5 py-1 rounded-bl-xl shadow-lg flex items-center gap-1.5 uppercase tracking-wider">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  PIVOTAL ALERT ({activeAlert.effectiveScore}/10)
                </div>
              )}

              {/* Match Header */}
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-broadcast-orange bg-broadcast-orange/10 px-2 py-0.5 rounded uppercase tracking-wider border border-broadcast-orange/20">
                    {m.sport}
                  </span>
                  <span className="text-xs text-broadcast-subtle font-semibold truncate max-w-[180px]">
                    {m.tournament}
                  </span>
                </div>
                <div className="text-[11px] font-bold text-broadcast-subtle group-hover:text-broadcast-orange flex items-center gap-1 transition-colors">
                  <span>Switch</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Match Title */}
              <h4 className="text-base font-extrabold text-white group-hover:text-broadcast-orange transition-colors truncate">
                {m.title}
              </h4>

              {/* Mini State Summary */}
              <div className="mt-2.5 pt-2.5 border-t border-broadcast-border/50 flex items-center justify-between">
                <MiniStateSummary sport={m.sport} state={latestEvent?.state} />
              </div>

              {/* Last event headline */}
              {latestEvent && (
                <p className="mt-2 text-[11px] text-broadcast-subtle truncate flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-broadcast-orange shrink-0"></span>
                  <span className="truncate">{latestEvent.headline}</span>
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
    return <span className="text-xs text-broadcast-subtle">Awaiting live data...</span>;
  }

  if (sport === 'cricket') {
    const s = state as CricketState;
    return (
      <div className="flex items-center justify-between w-full text-xs">
        <span className="font-bold text-white">
          {s.battingTeam} <span className="text-broadcast-orange font-mono-numbers text-sm">{s.score}/{s.wickets}</span>
        </span>
        <span className="font-mono-numbers text-broadcast-muted font-semibold">({s.overs} ov)</span>
      </div>
    );
  }

  if (sport === 'f1') {
    const s = state as F1State;
    return (
      <div className="flex items-center justify-between w-full text-xs">
        <span className="font-bold text-white">
          Lap <span className="font-mono-numbers text-broadcast-orange text-sm">{s.lap}</span>/{s.totalLaps}
        </span>
        <span className="font-mono-numbers text-broadcast-muted font-semibold">Leader: {s.leader}</span>
      </div>
    );
  }

  // Tennis
  const s = state as TennisState;
  return (
    <div className="flex items-center justify-between w-full text-xs">
      <span className="font-bold text-white">
        Set {s.currentSet} <span className="font-mono-numbers text-broadcast-orange">({s.setScores.slice(-1)[0]})</span>
      </span>
      <span className="font-mono-numbers font-extrabold text-white bg-broadcast-canvas px-2 py-0.5 rounded border border-broadcast-border text-xs">
        {s.gameScore}
      </span>
    </div>
  );
}
