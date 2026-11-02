import { Activity, Trophy, MapPin, Flag, Flame } from 'lucide-react';
import { useReplayStore } from '../store/useReplayStore';
import { replayAdapter } from '../adapters/replayAdapter';
import { CricketState, F1State, TennisState } from '../types';

export function NowWatching() {
  const activeMatchId = useReplayStore((s) => s.activeMatchId);
  const currentTime = useReplayStore((s) => s.currentTime);
  const matches = useReplayStore((s) => s.matches);

  const activeMatch = matches.find((m) => m.id === activeMatchId);
  const latestEvent = replayAdapter.getLatestEventForMatch(activeMatchId, currentTime);
  const recentEvents = replayAdapter
    .getEventsForMatch(activeMatchId)
    .filter((e) => e.t <= currentTime)
    .slice(-4)
    .reverse();

  if (!activeMatch) {
    return (
      <div className="h-[460px] bg-fancode-surface rounded-2xl border border-fancode-border flex items-center justify-center text-fancode-muted">
        No active stream selected
      </div>
    );
  }

  const state = latestEvent?.state;

  return (
    <div className="bg-fancode-surface rounded-2xl border border-fancode-border overflow-hidden shadow-2xl flex flex-col">
      {/* Stream Player Header */}
      <div className="bg-gradient-to-r from-fancode-card to-fancode-surface px-5 py-3 border-b border-fancode-border flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-bold tracking-wider uppercase">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            LIVE STREAM
          </div>
          <span className="text-xs font-bold text-fancode-orange uppercase tracking-wider bg-fancode-orange/10 px-2 py-0.5 rounded border border-fancode-orange/20">
            {activeMatch.sport}
          </span>
          <h2 className="text-sm font-bold text-white tracking-wide truncate max-w-[280px] sm:max-w-md">
            {activeMatch.title}
          </h2>
        </div>

        <div className="flex items-center gap-4 text-xs text-fancode-muted">
          <div className="hidden sm:flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>{activeMatch.tournament}</span>
          </div>
          {activeMatch.venue && (
            <div className="hidden md:flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-fancode-subtle" />
              <span>{activeMatch.venue}</span>
            </div>
          )}
          <span className="text-[11px] bg-fancode-bg px-2 py-0.5 rounded text-fancode-subtle border border-fancode-border">
            1080p · FanCode Player Stand-in
          </span>
        </div>
      </div>

      {/* Main Broadcast Stand-in View */}
      <div className="p-5 flex-1 flex flex-col justify-between bg-gradient-to-b from-[#131316] to-fancode-bg relative min-h-[360px]">
        {/* Subtle background sports grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#2E2E33_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none"></div>

        {/* Dynamic Sport-Specific Live Board */}
        <div className="relative z-10">
          {activeMatch.sport === 'tennis' && state && (
            <TennisBoard state={state as TennisState} />
          )}

          {activeMatch.sport === 'f1' && state && (
            <F1Board state={state as F1State} />
          )}

          {activeMatch.sport === 'cricket' && state && (
            <CricketBoard state={state as CricketState} />
          )}
        </div>

        {/* Real-time commentary / event ticker at bottom of stream */}
        <div className="relative z-10 mt-6 pt-4 border-t border-fancode-border/70">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-fancode-muted flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-fancode-orange" />
              Live Match Timeline
            </span>
            <span className="text-[11px] text-fancode-subtle">Updated on stream clock</span>
          </div>

          <div className="space-y-1.5">
            {recentEvents.length > 0 ? (
              recentEvents.map((ev, idx) => (
                <div
                  key={ev.id}
                  className={`text-xs flex items-center justify-between px-3 py-1.5 rounded-lg border transition-all ${
                    idx === 0
                      ? 'bg-fancode-orange/10 border-fancode-orange/30 text-white font-medium shadow-sm'
                      : 'bg-fancode-card/40 border-fancode-border/40 text-fancode-muted'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono-numbers text-[10px] text-fancode-subtle">
                      {Math.floor(ev.t / 60)}:{String(Math.floor(ev.t % 60)).padStart(2, '0')}
                    </span>
                    <span className="truncate">{ev.headline}</span>
                  </div>
                  {idx === 0 && (
                    <span className="text-[10px] uppercase font-bold text-fancode-orange px-1.5 py-0.2 rounded bg-fancode-orange/20">
                      LATEST
                    </span>
                  )}
                </div>
              ))
            ) : (
              <div className="text-xs text-fancode-subtle italic py-2">
                Awaiting match progression on replay clock...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= Sport Specific Scoreboards ================= */

function TennisBoard({ state }: { state: TennisState }) {
  return (
    <div className="bg-fancode-card/90 rounded-xl p-5 border border-fancode-border shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-3 border-b border-fancode-border/60">
        <div>
          <span className="text-xs text-fancode-muted font-medium">AUSTRALIAN OPEN FINAL · SET 5</span>
          <h3 className="text-lg font-black text-white tracking-tight">Deciding Set Championship Battle</h3>
        </div>

        <div className="flex items-center gap-2">
          {state.isBreakPoint && (
            <span className="px-2.5 py-1 rounded bg-red-500/20 text-red-400 border border-red-500/40 text-xs font-bold animate-pulse">
              BREAK POINT
            </span>
          )}
          {state.isMatchPoint && (
            <span className="px-3 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/50 text-xs font-black animate-pulse shadow-md shadow-amber-500/20">
              🏆 CHAMPIONSHIP POINT
            </span>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-xs text-fancode-subtle border-b border-fancode-border/40">
              <th className="pb-2 font-medium">PLAYER</th>
              {state.setScores.map((_, i) => (
                <th key={i} className="pb-2 text-center font-medium w-10">
                  S{i + 1}
                </th>
              ))}
              <th className="pb-2 text-center font-bold text-fancode-orange w-16">GAME</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-fancode-border/30">
            {/* Player 1 */}
            <tr className="text-sm font-semibold text-white">
              <td className="py-2.5 flex items-center gap-2">
                {state.server === 1 && (
                  <span className="w-2.5 h-2.5 rounded-full bg-lime-400 shadow-sm shadow-lime-400/80 animate-pulse" title="Serving"></span>
                )}
                <span>{state.player1.name}</span>
                {state.player1.seed && (
                  <span className="text-[10px] text-fancode-subtle bg-fancode-surface px-1 rounded">[{state.player1.seed}]</span>
                )}
              </td>
              {state.setScores.map((score, i) => {
                const p1Score = score.split('-')[0];
                return (
                  <td key={i} className="py-2.5 text-center font-mono-numbers text-fancode-muted">
                    {p1Score}
                  </td>
                );
              })}
              <td className="py-2.5 text-center font-mono-numbers font-black text-fancode-orange text-base bg-fancode-orange/10 rounded">
                {state.gameScore === 'FINAL' ? 'WON' : state.gameScore.split('-')[0]}
              </td>
            </tr>

            {/* Player 2 */}
            <tr className="text-sm font-semibold text-white">
              <td className="py-2.5 flex items-center gap-2">
                {state.server === 2 && (
                  <span className="w-2.5 h-2.5 rounded-full bg-lime-400 shadow-sm shadow-lime-400/80 animate-pulse" title="Serving"></span>
                )}
                <span>{state.player2.name}</span>
                {state.player2.seed && (
                  <span className="text-[10px] text-fancode-subtle bg-fancode-surface px-1 rounded">[{state.player2.seed}]</span>
                )}
              </td>
              {state.setScores.map((score, i) => {
                const p2Score = score.split('-')[1];
                return (
                  <td key={i} className="py-2.5 text-center font-mono-numbers text-fancode-muted">
                    {p2Score}
                  </td>
                );
              })}
              <td className="py-2.5 text-center font-mono-numbers font-black text-fancode-orange text-base bg-fancode-orange/10 rounded">
                {state.gameScore === 'FINAL' ? 'RU' : state.gameScore.split('-')[1]}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function F1Board({ state }: { state: F1State }) {
  const getStatusBadge = () => {
    switch (state.status) {
      case 'SAFETY_CAR':
        return (
          <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/50 rounded-lg text-xs font-black animate-pulse flex items-center gap-1.5 shadow-md shadow-amber-500/20">
            <Flame className="w-3.5 h-3.5" />
            SAFETY CAR DEPLOYED
          </span>
        );
      case 'RED_FLAG':
        return (
          <span className="px-3 py-1 bg-red-500/20 text-red-400 border border-red-500/50 rounded-lg text-xs font-black flex items-center gap-1.5">
            <Flag className="w-3.5 h-3.5" />
            SESSION SUSPENDED
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-lg text-xs font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            TRACK GREEN
          </span>
        );
    }
  };

  const getTyreBadge = (compound: string) => {
    switch (compound) {
      case 'SOFT':
        return <span className="px-1.5 py-0.5 rounded bg-red-600 text-white font-bold text-[10px]">S</span>;
      case 'MEDIUM':
        return <span className="px-1.5 py-0.5 rounded bg-yellow-500 text-black font-bold text-[10px]">M</span>;
      default:
        return <span className="px-1.5 py-0.5 rounded bg-zinc-200 text-black font-bold text-[10px]">H</span>;
    }
  };

  return (
    <div className="bg-fancode-card/90 rounded-xl p-5 border border-fancode-border shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-3 border-b border-fancode-border/60">
        <div>
          <span className="text-xs text-fancode-muted font-medium">YAS MARINA CIRCUIT · LAP {state.lap} OF {state.totalLaps}</span>
          <h3 className="text-lg font-black text-white tracking-tight">World Drivers' Championship Decider</h3>
        </div>
        <div>{getStatusBadge()}</div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-xs text-fancode-subtle border-b border-fancode-border/40">
              <th className="pb-2 font-medium w-10">POS</th>
              <th className="pb-2 font-medium">DRIVER</th>
              <th className="pb-2 font-medium">TEAM</th>
              <th className="pb-2 text-center font-medium w-16">TYRE</th>
              <th className="pb-2 text-right font-medium">GAP / INTERVAL</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-fancode-border/30">
            {state.standings.map((d) => (
              <tr key={d.code} className="text-sm font-semibold text-white">
                <td className="py-2 font-mono-numbers text-fancode-muted">{d.pos}</td>
                <td className="py-2 flex items-center gap-2">
                  <span className="font-black text-fancode-orange">{d.code}</span>
                  <span className="text-xs font-normal text-fancode-muted">{d.driver}</span>
                </td>
                <td className="py-2 text-xs text-fancode-muted">{d.team}</td>
                <td className="py-2 text-center">{getTyreBadge(d.tyre)}</td>
                <td className="py-2 text-right font-mono-numbers text-xs font-bold text-white">
                  {d.gap}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CricketBoard({ state }: { state: CricketState }) {
  const runsNeeded = state.target ? state.target - state.score : 0;
  const totalBalls = Math.floor(state.overs) * 6 + Math.round((state.overs % 1) * 10);
  const ballsRemaining = Math.max(0, 120 - totalBalls);

  return (
    <div className="bg-fancode-card/90 rounded-xl p-5 border border-fancode-border shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-3 border-b border-fancode-border/60">
        <div>
          <span className="text-xs text-fancode-muted font-medium">
            ICC T20 WORLD CUP FINAL · 2ND INNINGS
          </span>
          <div className="flex items-baseline gap-3 mt-1">
            <h3 className="text-2xl font-black text-white tracking-tight">
              {state.battingTeam} <span className="text-fancode-orange">{state.score}/{state.wickets}</span>
            </h3>
            <span className="font-mono-numbers text-sm text-fancode-muted font-bold">
              ({state.overs} ov)
            </span>
          </div>
        </div>

        {runsNeeded > 0 ? (
          <div className="bg-fancode-orange/15 border border-fancode-orange/30 px-3 py-1.5 rounded-lg text-right">
            <div className="text-xs text-fancode-muted font-medium">TARGET {state.target}</div>
            <div className="text-xs font-bold text-fancode-orange">
              Need {runsNeeded} off {ballsRemaining} balls
            </div>
            <div className="text-[10px] text-fancode-subtle">
              Req RR: {state.requiredRunRate?.toFixed(2) || '—'} · Curr RR: {state.currentRunRate.toFixed(2)}
            </div>
          </div>
        ) : (
          <div className="bg-emerald-500/20 border border-emerald-500/40 px-3 py-1.5 rounded-lg text-emerald-300 font-bold text-sm">
            MATCH CONCLUDED
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Batters */}
        <div className="bg-fancode-surface/80 p-3 rounded-lg border border-fancode-border/50">
          <div className="text-[11px] font-bold text-fancode-subtle uppercase mb-2">Batting</div>
          {state.currentBatters.map((b, idx) => (
            <div key={b.name} className="flex justify-between items-center text-xs py-1">
              <span className={`font-semibold ${idx === 0 ? 'text-white' : 'text-fancode-muted'}`}>
                {b.name} {idx === 0 ? '*' : ''}
              </span>
              <span className="font-mono-numbers font-bold text-white">
                {b.runs} <span className="text-fancode-subtle font-normal">({b.balls})</span>
              </span>
            </div>
          ))}
        </div>

        {/* Bowler & Last Over */}
        <div className="bg-fancode-surface/80 p-3 rounded-lg border border-fancode-border/50">
          <div className="text-[11px] font-bold text-fancode-subtle uppercase mb-2">Bowling</div>
          <div className="flex justify-between items-center text-xs py-1">
            <span className="font-semibold text-white">{state.currentBowler.name}</span>
            <span className="font-mono-numbers font-bold text-fancode-orange">{state.currentBowler.figures}</span>
          </div>

          {state.lastOverSummary && state.lastOverSummary.length > 0 && (
            <div className="mt-2 pt-2 border-t border-fancode-border/40 flex items-center gap-1.5">
              <span className="text-[10px] text-fancode-subtle mr-1">Over:</span>
              {state.lastOverSummary.map((ball, i) => (
                <span
                  key={i}
                  className={`w-5 h-5 rounded-full flex items-center justify-center font-mono-numbers text-[10px] font-bold ${
                    ball === 'W'
                      ? 'bg-red-600 text-white'
                      : ball === '4' || ball === '6'
                      ? 'bg-fancode-orange text-white'
                      : 'bg-fancode-card text-fancode-muted border border-fancode-border'
                  }`}
                >
                  {ball}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
