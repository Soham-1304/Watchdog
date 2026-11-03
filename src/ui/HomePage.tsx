import { useState } from 'react';
import {
  Play,
  Plus,
  Check,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Sliders,
} from 'lucide-react';
import { useReplayStore } from '../store/useReplayStore';
import { replayAdapter } from '../adapters/replayAdapter';

export function HomePage() {
  const matches = useReplayStore((s) => s.matches);
  const currentTime = useReplayStore((s) => s.currentTime);
  const switchMatch = useReplayStore((s) => s.switchMatch);
  const setCurrentPage = useReplayStore((s) => s.setCurrentPage);
  const quickWatchList = useReplayStore((s) => s.quickWatchList);
  const toggleQuickWatch = useReplayStore((s) => s.toggleQuickWatch);
  const setSettingsDrawerOpen = useReplayStore((s) => s.setSettingsDrawerOpen);
  const setSettingsTab = useReplayStore((s) => s.setSettingsTab);

  const [activeHeroIdx, setActiveHeroIdx] = useState(0);

  const heroMatch = matches[activeHeroIdx] || matches[0];

  const handleWatchLive = (matchId: string) => {
    switchMatch(matchId);
    setCurrentPage('match');
  };

  const nextHero = () => {
    setActiveHeroIdx((prev) => (prev + 1) % matches.length);
  };

  const prevHero = () => {
    setActiveHeroIdx((prev) => (prev - 1 + matches.length) % matches.length);
  };

  const isHeroInQuickWatch = heroMatch && quickWatchList.includes(heroMatch.id);

  return (
    <div className="space-y-8 animate-ticker-slide">
      {/* 1. FANCODE HERO BANNER CAROUSEL (Matches User's FanCode Screenshot) */}
      <div className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-r from-[#140b08] via-[#101217] to-[#0c121e] border border-white/10 shadow-2xl min-h-[380px] sm:min-h-[440px] flex items-center">
        {/* Subtle Sports Background Graphics */}
        <div className="absolute inset-0 pointer-events-none select-none opacity-30">
          <div className="absolute right-0 top-0 bottom-0 w-3/5 bg-gradient-to-l from-broadcast-orange/20 to-transparent"></div>
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:24px_24px]"></div>
        </div>

        {/* Carousel Navigation Arrows */}
        <button
          onClick={prevHero}
          className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 border border-white/15 text-white flex items-center justify-center transition-all backdrop-blur-md"
          title="Previous marquee match"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={nextHero}
          className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 border border-white/15 text-white flex items-center justify-center transition-all backdrop-blur-md"
          title="Next marquee match"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Hero Content */}
        <div className="relative z-10 px-8 sm:px-16 py-8 sm:py-12 max-w-2xl space-y-4">
          {/* Live Badge */}
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600 text-white text-[11px] font-black tracking-widest uppercase shadow-md shadow-red-600/30">
              <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
              LIVE
            </span>
            <span className="text-xs font-black uppercase tracking-wider text-broadcast-orange bg-broadcast-orange/15 px-2.5 py-0.5 rounded border border-broadcast-orange/30">
              {heroMatch?.sport}
            </span>
          </div>

          {/* Marquee Match Title */}
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-none drop-shadow-lg">
            {heroMatch?.title}
          </h1>

          {/* Tournament & Details */}
          <p className="text-sm sm:text-base text-zinc-300 font-semibold drop-shadow">
            {heroMatch?.tournament} · {heroMatch?.subtitle || 'Live Championship Stream'}
          </p>

          <p className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            Match In Progress · Stream PTS Synced
          </p>

          {/* Action Buttons: Watch Live & Add to QuickWatch */}
          <div className="flex flex-wrap items-center gap-3.5 pt-2">
            <button
              onClick={() => heroMatch && handleWatchLive(heroMatch.id)}
              className="flex items-center gap-2 px-6 sm:px-8 py-3 bg-broadcast-orange hover:bg-broadcast-orangeHover text-white rounded-xl text-sm font-black transition-all shadow-xl shadow-broadcast-orange/40 hover:scale-105 active:scale-95"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>WATCH LIVE</span>
            </button>

            <button
              onClick={() => heroMatch && toggleQuickWatch(heroMatch.id)}
              className={`flex items-center gap-2 px-4 sm:px-5 py-3 rounded-xl text-xs font-bold transition-all border backdrop-blur-md ${
                isHeroInQuickWatch
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 shadow-md shadow-emerald-500/20'
                  : 'bg-white/10 hover:bg-white/15 border-white/20 text-white'
              }`}
            >
              {isHeroInQuickWatch ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>In QuickWatch List</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Add to QuickWatch</span>
                </>
              )}
            </button>
          </div>

          {/* Carousel Dots */}
          <div className="flex items-center gap-1.5 pt-4">
            {matches.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveHeroIdx(idx)}
                className={`h-1.5 rounded-full transition-all ${
                  activeHeroIdx === idx ? 'w-6 bg-broadcast-orange' : 'w-2 bg-white/30'
                }`}
              ></button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. CUTAWAY QUICKWATCH SENTINEL SUMMARY CARD */}
      <div className="bg-[#111317] rounded-2xl p-4 sm:p-5 border border-white/10 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="p-2 rounded-xl bg-broadcast-orange/20 text-broadcast-orange border border-broadcast-orange/30 shrink-0">
            <Sparkles className="w-5 h-5 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-white">Cutaway Multi-Match Sentinel</h3>
              <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                {quickWatchList.length} Active in QuickWatch
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Add matches to your QuickWatch list below. While watching any stream, Cutaway's 3 AI agents monitor your list in the background and trigger 7s alerts only on turning points.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setSettingsTab('cutaway');
            setSettingsDrawerOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-zinc-300 hover:text-white transition-all shrink-0"
        >
          <Sliders className="w-3.5 h-3.5 text-broadcast-orange" />
          <span>Configure AI Agents</span>
        </button>
      </div>

      {/* 3. "ALL LIVE NOW" CAROUSEL ROW (Matches FanCode Screenshot) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
              All Live Now ({matches.length})
            </h2>
            <ChevronRight className="w-4 h-4 text-zinc-400" />
          </div>
          <span className="text-xs text-zinc-500">Click Watch to view, or + to add to QuickWatch</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {matches.map((m) => {
            const isQuickWatch = quickWatchList.includes(m.id);
            const latestEv = replayAdapter.getLatestEventForMatch(m.id, currentTime);

            return (
              <div
                key={m.id}
                className="group bg-[#111317] hover:bg-[#161922] border border-white/10 hover:border-white/20 rounded-2xl overflow-hidden shadow-xl transition-all flex flex-col justify-between"
              >
                {/* Thumbnail Header */}
                <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
                  {/* Subtle sports ambient graphic */}
                  <div
                    className={`w-full h-full bg-gradient-to-tr ${
                      m.sport === 'tennis'
                        ? 'from-[#0d1f18] to-[#122b22]'
                        : m.sport === 'f1'
                        ? 'from-[#1a0a0c] to-[#250e12]'
                        : 'from-[#0e1624] to-[#14233a]'
                    } flex items-center justify-center p-4`}
                  >
                    <div className="text-center">
                      <span className="text-2xl font-black text-white/80 tracking-tight block">
                        {m.title}
                      </span>
                      <span className="text-xs font-bold text-broadcast-orange uppercase tracking-wider mt-1 block">
                        {m.tournament}
                      </span>
                    </div>
                  </div>

                  {/* Red LIVE badge */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2 py-0.5 rounded bg-red-600 text-white text-[10px] font-black uppercase tracking-wider shadow">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                    LIVE
                  </div>

                  {/* Sport Badge */}
                  <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-black uppercase tracking-wider text-zinc-300">
                    {m.sport}
                  </div>
                </div>

                {/* Content Details */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold text-white group-hover:text-broadcast-orange transition-colors">
                      {m.title}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">{m.tournament}</p>

                    {/* Live Telemetry preview */}
                    <div className="mt-2.5 p-2 rounded-lg bg-[#090A0C] border border-white/5 text-[11px] text-zinc-300 font-medium truncate">
                      <span className="text-broadcast-orange font-bold mr-1">Status:</span>
                      {latestEv ? latestEv.headline : 'Live stream active'}
                    </div>
                  </div>

                  {/* Action Controls */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/10">
                    {/* Add to QuickWatch Button */}
                    <button
                      onClick={() => toggleQuickWatch(m.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                        isQuickWatch
                          ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300 shadow-sm'
                          : 'bg-white/5 hover:bg-white/10 border-white/10 text-zinc-400 hover:text-white'
                      }`}
                      title="Monitor this match with Cutaway AI Sentinel"
                    >
                      {isQuickWatch ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>In QuickWatch</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>+ QuickWatch</span>
                        </>
                      )}
                    </button>

                    {/* Watch Live Stream Button */}
                    <button
                      onClick={() => handleWatchLive(m.id)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 bg-broadcast-orange hover:bg-broadcast-orangeHover text-white rounded-xl text-xs font-black transition-all shadow-md shadow-broadcast-orange/30"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Watch</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
