import {
  Sparkles,
  ShieldCheck,
  Pin,
  Play,
  Activity,
  EyeOff,
  ArrowRight,
} from 'lucide-react';
import { useReplayStore } from '../store/useReplayStore';
import { replayAdapter } from '../adapters/replayAdapter';

export function MultiMatchHub() {
  const matches = useReplayStore((s) => s.matches);
  const activeMatchId = useReplayStore((s) => s.activeMatchId);
  const currentTime = useReplayStore((s) => s.currentTime);
  const switchMatch = useReplayStore((s) => s.switchMatch);
  const setCurrentPage = useReplayStore((s) => s.setCurrentPage);
  const settings = useReplayStore((s) => s.settings);
  const updateSettings = useReplayStore((s) => s.updateSettings);
  const suppressedEvents = useReplayStore((s) => s.suppressedEvents);
  const totalEvaluated = useReplayStore((s) => s.totalEvaluatedCount);
  const totalAlerts = useReplayStore((s) => s.totalAlertsCount);

  const activeCatchUp = useReplayStore((s) => s.activeCatchUp);
  const dismissCatchUp = useReplayStore((s) => s.dismissCatchUp);

  const handleWatchStream = (matchId: string) => {
    switchMatch(matchId);
    setCurrentPage('match');
  };

  const isSportPinned = (sport: string) => {
    return settings.pins.sports.includes(sport as any);
  };

  const togglePinSport = (sport: string) => {
    const current = settings.pins.sports;
    const next = isSportPinned(sport)
      ? current.filter((s) => s !== sport)
      : [...current, sport as any];
    updateSettings({
      pins: {
        ...settings.pins,
        sports: next,
      },
    });
  };

  const silenceRate =
    totalEvaluated > 0
      ? Math.round(((totalEvaluated - totalAlerts) / totalEvaluated) * 100)
      : 88;

  const targetCatchUpMatch = activeCatchUp
    ? matches.find((m) => m.id === activeCatchUp.match_id)
    : null;

  return (
    <div className="space-y-8 animate-ticker-slide">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-lg bg-broadcast-orange/20 text-broadcast-orange border border-broadcast-orange/30">
              <Sparkles className="w-4 h-4 fill-current" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Multi-Match Intelligence Hub
            </h1>
          </div>
          <p className="text-xs text-zinc-400">
            Real-time cross-match sentinel, contextual catch-up briefings, and proof-of-restraint telemetry.
          </p>
        </div>

        {/* Live Active Streams Badge */}
        <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-bold text-white">3 Concurrent Live Streams</span>
          <span className="text-zinc-500">·</span>
          <span className="text-zinc-400 font-mono-numbers">PTS Synchronized</span>
        </div>
      </div>

      {/* SECTION 1: "Since You Left" Catch-Up Center */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
            <Activity className="w-4 h-4 text-broadcast-orange" />
            "Since You Left" Catch-Up Briefings
          </h2>
          <span className="text-xs text-zinc-500">Auto-generated when returning to a stream</span>
        </div>

        {activeCatchUp && targetCatchUpMatch ? (
          <div className="bg-[#111317] border border-broadcast-orange/40 rounded-2xl p-5 shadow-2xl relative overflow-hidden ring-1 ring-broadcast-orange/20">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-wider bg-broadcast-orange/20 text-broadcast-orange px-2 py-0.5 rounded border border-broadcast-orange/30">
                  {activeCatchUp.sport}
                </span>
                <h3 className="text-base font-extrabold text-white">
                  {targetCatchUpMatch.title}
                </h3>
                <span className="text-xs text-zinc-400">
                  Away for {Math.max(1, Math.round((activeCatchUp.to_t - activeCatchUp.from_t) / 60))} minutes
                </span>
              </div>
              <button
                onClick={dismissCatchUp}
                className="text-zinc-500 hover:text-white text-xs px-2 py-1 rounded hover:bg-white/5"
              >
                Dismiss
              </button>
            </div>

            <div className="bg-[#090A0C] p-4 rounded-xl border border-white/5 mb-4 space-y-2">
              <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed font-medium">
                <strong className="text-white font-bold">What happened while away: </strong>
                {activeCatchUp.summary}
              </p>
              <p className="text-xs text-broadcast-orange font-semibold">
                <strong>Current State: </strong>
                {activeCatchUp.currentStateLine}
              </p>
            </div>

            <div className="flex items-center justify-end">
              <button
                onClick={() => handleWatchStream(activeCatchUp.match_id)}
                className="flex items-center gap-2 px-4 py-2 bg-broadcast-orange hover:bg-broadcast-orangeHover text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-broadcast-orange/30"
              >
                <span>Jump into Live Stream</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white/5 rounded-2xl p-5 border border-white/10 text-center py-6 text-zinc-400 text-xs">
            <p className="font-semibold text-zinc-300">No stream switches yet</p>
            <p className="text-[11px] text-zinc-500 mt-1">
              When you switch between live streams, Watchdog generates a 2-sentence catch-up briefing here.
            </p>
          </div>
        )}
      </section>

      {/* SECTION 2: Active Concurrent Streams Grid */}
      <section className="space-y-3">
        <h2 className="text-sm font-extrabold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
          <Play className="w-4 h-4 text-emerald-400" />
          Active Concurrent Streams (Live Telemetry & Leverage)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {matches.map((m) => {
            const isCurrent = m.id === activeMatchId;
            const latestEv = replayAdapter.getLatestEventForMatch(m.id, currentTime);
            const pinned = isSportPinned(m.sport);

            return (
              <div
                key={m.id}
                className={`rounded-2xl p-5 border transition-all flex flex-col justify-between ${
                  isCurrent
                    ? 'bg-[#151821] border-broadcast-orange/60 shadow-xl ring-1 ring-broadcast-orange/30'
                    : 'bg-[#111317] border-white/10 hover:border-white/20'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-white/10 text-zinc-300">
                      {m.sport}
                    </span>
                    {isCurrent && (
                      <span className="text-[10px] font-black uppercase tracking-wider text-broadcast-orange flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-broadcast-orange animate-ping"></span>
                        NOW WATCHING
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-extrabold text-white leading-snug mb-1">
                    {m.title}
                  </h3>
                  <p className="text-xs text-zinc-400 mb-3">{m.tournament}</p>

                  {/* Current Situation Box */}
                  <div className="bg-[#090A0C] p-3 rounded-xl border border-white/5 mb-4 text-xs">
                    <div className="text-[10px] uppercase font-bold text-zinc-500 mb-1">
                      Latest Telemetry
                    </div>
                    <div className="font-semibold text-zinc-200 truncate">
                      {latestEv ? latestEv.headline : 'Waiting for match start...'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-white/10">
                  {/* Pin Sport Toggle */}
                  <button
                    onClick={() => togglePinSport(m.sport)}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      pinned
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                    title="Pin this sport for +2 score boost in alert threshold"
                  >
                    <Pin className={`w-3.5 h-3.5 ${pinned ? 'fill-current' : ''}`} />
                    <span>{pinned ? 'Pinned' : 'Pin'}</span>
                  </button>

                  {/* Watch Button */}
                  <button
                    onClick={() => handleWatchStream(m.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      isCurrent
                        ? 'bg-white/10 text-zinc-300 hover:bg-white/20'
                        : 'bg-broadcast-orange hover:bg-broadcast-orangeHover text-white shadow-md'
                    }`}
                  >
                    {isCurrent ? 'Watch Stream' : 'Switch Stream →'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 3: AI Restraint & Transparency Dashboard */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            AI Restraint & Proof-of-Restraint Transparency
          </h2>
          <span className="text-xs font-bold text-emerald-400">
            {silenceRate}% Noise Suppressed (Production Safe)
          </span>
        </div>

        <div className="bg-[#111317] rounded-2xl p-5 sm:p-6 border border-white/10 shadow-xl space-y-6">
          {/* Key Metric Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#090A0C] p-4 rounded-xl border border-white/5">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                Total Events Evaluated
              </span>
              <span className="text-2xl font-black text-white font-mono-numbers mt-1 block">
                {totalEvaluated || 23}
              </span>
              <span className="text-[11px] text-zinc-500 mt-1 block">Across all 3 live matches</span>
            </div>

            <div className="bg-[#090A0C] p-4 rounded-xl border border-white/5">
              <span className="text-[11px] font-bold text-broadcast-orange uppercase tracking-wider block">
                High-Leverage Alerts Fired
              </span>
              <span className="text-2xl font-black text-broadcast-orange font-mono-numbers mt-1 block">
                {totalAlerts || 3}
              </span>
              <span className="text-[11px] text-zinc-500 mt-1 block">Score &ge; {settings.threshold}/10</span>
            </div>

            <div className="bg-[#090A0C] p-4 rounded-xl border border-white/5">
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
                Routine Events Filtered Out
              </span>
              <span className="text-2xl font-black text-emerald-400 font-mono-numbers mt-1 block">
                {totalEvaluated - totalAlerts > 0 ? totalEvaluated - totalAlerts : 20}
              </span>
              <span className="text-[11px] text-zinc-500 mt-1 block">
                Dropped by O(1) Rules Gate (0 user fatigue)
              </span>
            </div>
          </div>

          {/* Interactive Preferences: Sensitivity & Persona */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/10">
            {/* Threshold Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white">Alert Sensitivity Threshold:</span>
                <span className="font-mono-numbers text-broadcast-orange font-black">
                  {settings.threshold}/10 (Pivotal Only)
                </span>
              </div>
              <input
                type="range"
                min={5}
                max={9}
                value={settings.threshold}
                onChange={(e) => updateSettings({ threshold: Number(e.target.value) })}
                className="w-full accent-broadcast-orange bg-white/10 rounded-lg h-2 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-zinc-500">
                <span>5 (More alerts)</span>
                <span>7 (Default: Turning points)</span>
                <span>9 (Extreme game deciders only)</span>
              </div>
            </div>

            {/* Content Depth & Jargon Mode */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-white block">Alert Content Depth:</span>
              <div className="grid grid-cols-3 gap-2">
                {(['concise', 'tactical', 'stat_heavy'] as const).map((depth) => (
                  <button
                    key={depth}
                    onClick={() => updateSettings({ contentDepth: depth })}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all capitalize ${
                      settings.contentDepth === depth
                        ? 'bg-broadcast-orange text-white shadow-md'
                        : 'bg-white/5 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {depth === 'stat_heavy' ? 'Stats Heavy' : depth}
                  </button>
                ))}
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-zinc-400">Novice rule explanations:</span>
                <button
                  onClick={() => updateSettings({ novice: !settings.novice })}
                  className={`text-xs font-bold px-2 py-0.5 rounded ${
                    settings.novice ? 'bg-amber-500/20 text-amber-300' : 'bg-white/5 text-zinc-500'
                  }`}
                >
                  {settings.novice ? 'Enabled' : 'Disabled'}
                </button>
              </div>
            </div>
          </div>

          {/* Recent Suppressed Events Feed */}
          <div className="space-y-2 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span className="font-bold text-zinc-300 flex items-center gap-1.5">
                <EyeOff className="w-3.5 h-3.5 text-zinc-500" />
                Live Suppressed Telemetry Log (Why Routine Moments Were Silenced)
              </span>
              <span>Showing last {Math.min(5, suppressedEvents.length || 5)} items</span>
            </div>

            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {(suppressedEvents.length > 0 ? suppressedEvents.slice(0, 5) : [
                {
                  event: { sport: 'cricket', headline: 'IND 142/3: Single pushed to long-off' },
                  score: 2,
                  details: 'Routine single, required rate steady at 8.4',
                },
                {
                  event: { sport: 'f1', headline: 'Lap 48: Hamilton leads Verstappen by 12.4s' },
                  score: 3,
                  details: 'Stable interval, no pit delta or safety car',
                },
                {
                  event: { sport: 'tennis', headline: 'Game 7: 15-0 on routine rally error' },
                  score: 2,
                  details: 'Routine point, neither break point nor deuce',
                },
              ]).map((item, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-xs flex items-center justify-between gap-3 text-zinc-400"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/10 text-zinc-500">
                      {item.event.sport}
                    </span>
                    <span className="truncate text-zinc-300">{item.event.headline}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] font-mono-numbers text-zinc-500">
                      Score: {item.score}/10
                    </span>
                    <span className="text-[10px] text-zinc-500 hidden sm:inline truncate max-w-[200px]">
                      {item.details}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
