import { Activity, Trophy, MapPin, Flag, Flame, Volume2, Maximize2, ShieldAlert } from 'lucide-react';
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
      <div className="h-[480px] broadcast-glass rounded-2xl flex items-center justify-center text-broadcast-muted">
        No active stream selected
      </div>
    );
  }

  const state = latestEvent?.state;

  return (
    <div className="broadcast-glass rounded-2xl overflow-hidden shadow-2xl flex flex-col border border-broadcast-border relative">
      {/* Broadcast Stream Header & Player Controls */}
      <div className="bg-broadcast-card/95 px-5 py-3 border-b border-broadcast-border flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-black tracking-wider uppercase">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            LIVE BROADCAST
          </div>
          <span className="text-xs font-black text-broadcast-orange uppercase tracking-wider bg-broadcast-orange/10 px-2.5 py-0.5 rounded-md border border-broadcast-orange/25">
            {activeMatch.sport}
          </span>
          <h2 className="text-sm font-extrabold text-white tracking-wide truncate max-w-[260px] sm:max-w-md">
            {activeMatch.title}
          </h2>
        </div>

        <div className="flex items-center gap-3.5 text-xs text-broadcast-muted">
          <div className="hidden sm:flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-semibold text-zinc-300">{activeMatch.tournament}</span>
          </div>
          {activeMatch.venue && (
            <div className="hidden md:flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-broadcast-subtle" />
              <span>{activeMatch.venue}</span>
            </div>
          )}
          {/* Simulated stream player status */}
          <div className="flex items-center gap-2 bg-broadcast-canvas px-2.5 py-1 rounded-lg border border-broadcast-border text-[11px] font-mono-numbers">
            <span className="text-emerald-400 font-bold">1080p60</span>
            <span className="text-broadcast-subtle">·</span>
            <span className="text-zinc-400">1.2s lag</span>
            <Volume2 className="w-3.5 h-3.5 text-broadcast-subtle ml-1 cursor-pointer hover:text-white" />
            <Maximize2 className="w-3.5 h-3.5 text-broadcast-subtle cursor-pointer hover:text-white" />
          </div>
        </div>
      </div>

      {/* Main Stream Canvas */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between bg-gradient-to-b from-[#101217] via-broadcast-canvas to-broadcast-canvas relative min-h-[380px]">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[radial-gradient(#262933_1px,transparent_1px)] [background-size:20px_20px] opacity-30 pointer-events-none"></div>

        {/* Dynamic Sport-Specific Scoreboard */}
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

        {/* Live Timeline Ticker */}
        <div className="relative z-10 mt-6 pt-4 border-t border-broadcast-border/80">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-black uppercase tracking-wider text-broadcast-muted flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-broadcast-orange" />
              Live Match Telemetry Feed
            </span>
            <span className="text-[11px] text-broadcast-subtle">Synced to stream PTS</span>
          </div>

          <div className="space-y-1.5">
            {recentEvents.length > 0 ? (
              recentEvents.map((ev, idx) => (
                <div
                  key={ev.id}
                  className={`text-xs flex items-center justify-between px-3.5 py-2 rounded-xl border transition-all animate-ticker-slide ${
                    idx === 0
                      ? 'bg-broadcast-orange/15 border-broadcast-orange/40 text-white font-semibold shadow-md shadow-broadcast-orange/10'
                      : 'bg-broadcast-card/60 border-broadcast-border/60 text-broadcast-muted'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono-numbers text-[11px] font-bold text-broadcast-orange">
                      {Math.floor(ev.t / 60)}:{String(Math.floor(ev.t % 60)).padStart(2, '0')}
                    </span>
                    <span className="truncate">{ev.headline}</span>
                  </div>
                  {idx === 0 && (
                    <span className="text-[10px] uppercase font-black text-broadcast-orange px-2 py-0.5 rounded bg-broadcast-orange/20 border border-broadcast-orange/30">
                      CURRENT
                    </span>
                  )}
                </div>
              ))
            ) : (
              <div className="text-xs text-broadcast-subtle italic py-2">
                Awaiting match progression on replay clock...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= Elevated Sport Specific Scoreboards ================= */

function TennisBoard({ state }: { state: TennisState }) {
  return (
    <div className="broadcast-glass-card rounded-2xl p-5 border border-broadcast-border shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-3 border-b border-broadcast-border/60">
        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-broadcast-orange">
            ROD LAVER ARENA · SET 5 DECIDER
          </span>
          <h3 className="text-xl font-black text-white tracking-tight mt-0.5">
            Men's Singles Championship Final
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {state.isBreakPoint && (
            <span className="px-3 py-1 rounded-lg bg-red-500/20 text-red-400 border border-red-500/40 text-xs font-black animate-pulse flex items-center gap-1.5 shadow-lg shadow-red-500/20">
              <ShieldAlert className="w-3.5 h-3.5" />
              BREAK POINT
            </span>
          )}
          {state.isMatchPoint && (
            <span className="px-3.5 py-1.5 rounded-lg bg-amber-500/25 text-amber-300 border border-amber-500/50 text-xs font-black animate-pulse flex items-center gap-1.5 shadow-xl shadow-amber-500/30">
              🏆 CHAMPIONSHIP POINT
            </span>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-xs text-broadcast-subtle border-b border-broadcast-border/40">
              <th className="pb-2.5 font-bold tracking-wider">PLAYER</th>
              {state.setScores.map((_, i) => (
                <th key={i} className="pb-2.5 text-center font-bold tracking-wider w-12">
                  SET {i + 1}
                </th>
              ))}
              <th className="pb-2.5 text-center font-black text-broadcast-orange tracking-wider w-20">
                GAME
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-broadcast-border/30">
            {/* Player 1 */}
            <tr className="text-sm font-bold text-white">
              <td className="py-3 flex items-center gap-2.5">
                {state.server === 1 && (
                  <span className="w-3 h-3 rounded-full bg-lime-400 shadow-md shadow-lime-400/80 animate-pulse" title="Serving"></span>
                )}
                <span className="tracking-wide">{state.player1.name}</span>
                {state.player1.seed && (
                  <span className="text-[10px] font-bold text-broadcast-subtle bg-broadcast-card px-1.5 py-0.2 rounded border border-broadcast-border">
                    #{state.player1.seed}
                  </span>
                )}
              </td>
              {state.setScores.map((score, i) => {
                const p1Score = score.split('-')[0];
                return (
                  <td key={i} className="py-3 text-center font-mono-numbers text-broadcast-muted text-base">
                    {p1Score}
                  </td>
                );
              })}
              <td className="py-3 text-center font-mono-numbers font-black text-broadcast-orange text-lg bg-broadcast-orange/15 rounded-lg">
                {state.gameScore === 'FINAL' ? 'WON' : state.gameScore.split('-')[0]}
              </td>
            </tr>

            {/* Player 2 */}
            <tr className="text-sm font-bold text-white">
              <td className="py-3 flex items-center gap-2.5">
                {state.server === 2 && (
                  <span className="w-3 h-3 rounded-full bg-lime-400 shadow-md shadow-lime-400/80 animate-pulse" title="Serving"></span>
                )}
                <span className="tracking-wide">{state.player2.name}</span>
                {state.player2.seed && (
                  <span className="text-[10px] font-bold text-broadcast-subtle bg-broadcast-card px-1.5 py-0.2 rounded border border-broadcast-border">
                    #{state.player2.seed}
                  </span>
                )}
              </td>
              {state.setScores.map((score, i) => {
                const p2Score = score.split('-')[1];
                return (
                  <td key={i} className="py-3 text-center font-mono-numbers text-broadcast-muted text-base">
                    {p2Score}
                  </td>
                );
              })}
              <td className="py-3 text-center font-mono-numbers font-black text-broadcast-orange text-lg bg-broadcast-orange/15 rounded-lg">
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
          <span className="px-3.5 py-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/50 rounded-xl text-xs font-black animate-pulse flex items-center gap-2 shadow-lg shadow-amber-500/20">
            <Flame className="w-4 h-4" />
            SAFETY CAR DEPLOYED
          </span>
        );
      case 'RED_FLAG':
        return (
          <span className="px-3.5 py-1.5 bg-red-500/20 text-red-400 border border-red-500/50 rounded-xl text-xs font-black flex items-center gap-2">
            <Flag className="w-4 h-4" />
            SESSION SUSPENDED
          </span>
        );
      default:
        return (
          <span className="px-3.5 py-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-bold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            TRACK GREEN
          </span>
        );
    }
  };

  const getTyreBadge = (compound: string) => {
    switch (compound) {
      case 'SOFT':
        return <span className="px-2 py-0.5 rounded-md bg-red-600 text-white font-extrabold text-[10px] shadow-sm">SOFT</span>;
      case 'MEDIUM':
        return <span className="px-2 py-0.5 rounded-md bg-amber-500 text-black font-extrabold text-[10px] shadow-sm">MED</span>;
      default:
        return <span className="px-2 py-0.5 rounded-md bg-zinc-200 text-black font-extrabold text-[10px] shadow-sm">HARD</span>;
    }
  };

  return (
    <div className="broadcast-glass-card rounded-2xl p-5 border border-broadcast-border shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-3 border-b border-broadcast-border/60">
        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-broadcast-orange">
            YAS MARINA · LAP {state.lap} OF {state.totalLaps}
          </span>
          <h3 className="text-xl font-black text-white tracking-tight mt-0.5">
            World Drivers' Championship Decider
          </h3>
        </div>
        <div>{getStatusBadge()}</div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-xs text-broadcast-subtle border-b border-broadcast-border/40">
              <th className="pb-2.5 font-bold w-12">POS</th>
              <th className="pb-2.5 font-bold">DRIVER</th>
              <th className="pb-2.5 font-bold">TEAM</th>
              <th className="pb-2.5 text-center font-bold w-20">TYRE</th>
              <th className="pb-2.5 text-right font-bold">GAP / INTERVAL</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-broadcast-border/30">
            {state.standings.map((d) => (
              <tr key={d.code} className="text-sm font-bold text-white">
                <td className="py-2.5 font-mono-numbers text-broadcast-muted">{d.pos}</td>
                <td className="py-2.5 flex items-center gap-2.5">
                  <span className="font-black text-broadcast-orange text-base">{d.code}</span>
                  <span className="text-xs font-semibold text-zinc-300">{d.driver}</span>
                </td>
                <td className="py-2.5 text-xs text-broadcast-muted font-medium">{d.team}</td>
                <td className="py-2.5 text-center">{getTyreBadge(d.tyre)}</td>
                <td className="py-2.5 text-right font-mono-numbers text-xs font-black text-white">
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
    <div className="broadcast-glass-card rounded-2xl p-5 border border-broadcast-border shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-3 border-b border-broadcast-border/60">
        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-broadcast-orange">
            ICC T20 WORLD CUP FINAL · 2ND INNINGS
          </span>
          <div className="flex items-baseline gap-3 mt-1">
            <h3 className="text-3xl font-black text-white tracking-tight">
              {state.battingTeam} <span className="text-broadcast-orange">{state.score}/{state.wickets}</span>
            </h3>
            <span className="font-mono-numbers text-base text-broadcast-muted font-extrabold">
              ({state.overs} ov)
            </span>
          </div>
        </div>

        {runsNeeded > 0 ? (
          <div className="bg-broadcast-orange/15 border border-broadcast-orange/30 px-4 py-2 rounded-xl text-right shadow-md">
            <div className="text-[11px] text-broadcast-muted font-bold tracking-wider uppercase">
              TARGET: {state.target}
            </div>
            <div className="text-sm font-black text-broadcast-orange">
              Need {runsNeeded} runs off {ballsRemaining} balls
            </div>
            <div className="text-[10px] text-broadcast-subtle font-mono-numbers mt-0.5">
              Req RR: {state.requiredRunRate?.toFixed(2) || '—'} · Curr RR: {state.currentRunRate.toFixed(2)}
            </div>
          </div>
        ) : (
          <div className="bg-emerald-500/20 border border-emerald-500/40 px-4 py-2 rounded-xl text-emerald-300 font-black text-sm">
            🏆 MATCH CONCLUDED
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Batting Pair */}
        <div className="bg-broadcast-canvas/80 p-3.5 rounded-xl border border-broadcast-border/60">
          <div className="text-[11px] font-bold text-broadcast-subtle uppercase tracking-wider mb-2">Batting</div>
          {state.currentBatters.map((b, idx) => (
            <div key={b.name} className="flex justify-between items-center text-xs py-1">
              <span className={`font-bold ${idx === 0 ? 'text-white' : 'text-broadcast-muted'}`}>
                {b.name} {idx === 0 ? '*' : ''}
              </span>
              <span className="font-mono-numbers font-black text-white">
                {b.runs} <span className="text-broadcast-subtle font-normal">({b.balls})</span>
              </span>
            </div>
          ))}
        </div>

        {/* Current Bowler & Over balls */}
        <div className="bg-broadcast-canvas/80 p-3.5 rounded-xl border border-broadcast-border/60">
          <div className="text-[11px] font-bold text-broadcast-subtle uppercase tracking-wider mb-2">Bowling</div>
          <div className="flex justify-between items-center text-xs py-1">
            <span className="font-bold text-white">{state.currentBowler.name}</span>
            <span className="font-mono-numbers font-black text-broadcast-orange">{state.currentBowler.figures}</span>
          </div>

          {state.lastOverSummary && state.lastOverSummary.length > 0 && (
            <div className="mt-2.5 pt-2 border-t border-broadcast-border/40 flex items-center gap-1.5">
              <span className="text-[10px] text-broadcast-subtle font-semibold mr-1">Over:</span>
              {state.lastOverSummary.map((ball, i) => (
                <span
                  key={i}
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-mono-numbers text-[10px] font-black ${
                    ball === 'W'
                      ? 'bg-red-600 text-white shadow-md shadow-red-600/40'
                      : ball === '4' || ball === '6'
                      ? 'bg-broadcast-orange text-white shadow-md shadow-broadcast-orange/40'
                      : 'bg-broadcast-card text-broadcast-muted border border-broadcast-border'
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
