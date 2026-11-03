import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, ChevronLeft, ChevronRight, Plus, Check } from 'lucide-react';
import { useReplayStore } from '../store/useReplayStore';

export function HomePage() {
  const matches = useReplayStore((s) => s.matches);
  const switchMatch = useReplayStore((s) => s.switchMatch);
  const setCurrentPage = useReplayStore((s) => s.setCurrentPage);
  const quickWatchList = useReplayStore((s) => s.quickWatchList);
  const toggleQuickWatch = useReplayStore((s) => s.toggleQuickWatch);

  const [heroIdx, setHeroIdx] = useState(0);

  const heroMatch = matches[heroIdx] || matches[0];

  const handleWatchLive = (matchId: string) => {
    switchMatch(matchId);
    setCurrentPage('match');
  };

  const nextHero = () => setHeroIdx((prev) => (prev + 1) % matches.length);
  const prevHero = () => setHeroIdx((prev) => (prev - 1 + matches.length) % matches.length);

  const isHeroInQuickWatch = heroMatch && quickWatchList.includes(heroMatch.id);

  const sportTheme = (sport: string) => {
    switch (sport) {
      case 'tennis':
        return {
          darkBg: 'from-emerald-950/60 via-zinc-950 to-black',
          lightBg: 'from-emerald-100/70 via-slate-50 to-white',
          border: 'border-emerald-500/20 dark:border-lime-500/20 hover:border-lime-500/50',
          glow: 'rgba(163,230,53,0.15)',
        };
      case 'f1':
        return {
          darkBg: 'from-red-950/60 via-zinc-950 to-black',
          lightBg: 'from-red-100/70 via-slate-50 to-white',
          border: 'border-red-500/20 dark:border-red-500/20 hover:border-red-500/50',
          glow: 'rgba(239,68,68,0.15)',
        };
      case 'cricket':
      default:
        return {
          darkBg: 'from-orange-950/60 via-zinc-950 to-black',
          lightBg: 'from-orange-100/70 via-slate-50 to-white',
          border: 'border-orange-500/20 dark:border-orange-500/20 hover:border-orange-500/50',
          glow: 'rgba(255,82,0,0.15)',
        };
    }
  };

  return (
    <div className="space-y-8 animate-ticker-slide pb-12 select-none">
      {/* 1. HERO CAROUSEL ROW WITH ARROWS OUTSIDE TO THE SIDES */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Left Arrow - Outside the Box */}
        <button
          onClick={prevHero}
          className="shrink-0 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white dark:bg-[#12151d] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-md hover:bg-slate-50 dark:hover:bg-white/10"
          title="Previous Match"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Hero Marquee Box */}
        <div className="flex-1 relative rounded-3xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-xl min-h-[340px] sm:min-h-[400px] flex items-center bg-white dark:bg-black">
          {/* Animated Background Theme */}
          <AnimatePresence mode="wait">
            <motion.div
              key={heroMatch?.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className={`absolute inset-0 bg-gradient-to-r dark:${sportTheme(heroMatch?.sport || '').darkBg} ${sportTheme(heroMatch?.sport || '').lightBg}`}
            >
              {/* Subtle Ambient Radial Glow */}
              <div className="absolute right-10 top-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-broadcast-orange/15 blur-3xl pointer-events-none" />
              <div className="absolute inset-0 bg-[radial-gradient(#00000008_1px,transparent_1px)] dark:bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
            </motion.div>
          </AnimatePresence>

          {/* Hero Content */}
          <div className="relative z-10 px-6 sm:px-12 py-8 max-w-2xl space-y-3.5">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black tracking-widest uppercase shadow-md shadow-red-600/30">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                LIVE
              </span>
              <span className="text-[10px] font-black uppercase tracking-wider text-broadcast-orange bg-broadcast-orange/10 dark:bg-broadcast-orange/15 px-2.5 py-0.5 rounded-full border border-broadcast-orange/30">
                {heroMatch?.sport}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              {heroMatch?.title}
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-300 font-medium">
              {heroMatch?.tournament} · {heroMatch?.subtitle}
            </p>

            {/* Actions: Watch Live + Simple Clean QuickWatch Button */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => heroMatch && handleWatchLive(heroMatch.id)}
                className="flex items-center gap-2 px-6 py-2.5 bg-broadcast-orange hover:bg-broadcast-orangeHover text-white rounded-xl text-xs font-black transition-all shadow-lg shadow-broadcast-orange/30 hover:scale-105 active:scale-95"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>WATCH LIVE</span>
              </button>

              <button
                onClick={() => heroMatch && toggleQuickWatch(heroMatch.id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border shadow-sm ${
                  isHeroInQuickWatch
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-400'
                    : 'bg-white/80 dark:bg-white/10 hover:bg-white dark:hover:bg-white/15 border-slate-300 dark:border-white/20 text-slate-800 dark:text-white'
                }`}
              >
                {isHeroInQuickWatch ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span>In QuickWatch</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ QuickWatch</span>
                  </>
                )}
              </button>
            </div>

            {/* Dots */}
            <div className="flex items-center gap-1.5 pt-3">
              {matches.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setHeroIdx(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    heroIdx === idx ? 'w-6 bg-broadcast-orange' : 'w-2 bg-slate-300 dark:bg-white/20'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right Arrow - Outside the Box */}
        <button
          onClick={nextHero}
          className="shrink-0 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white dark:bg-[#12151d] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-md hover:bg-slate-50 dark:hover:bg-white/10"
          title="Next Match"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* 2. CLEAN LIVE MATCHES SECTION (Aligned, Zero Preferences Clutter) */}
      <div className="space-y-4">
        <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
          Live Matches ({matches.length})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {matches.map((m) => {
            const isQuick = quickWatchList.includes(m.id);
            const theme = sportTheme(m.sport);

            return (
              <motion.div
                key={m.id}
                whileHover={{ y: -3, transition: { duration: 0.2 } }}
                className={`bg-white dark:bg-[#0e1017] rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 hover:border-broadcast-orange/50 dark:hover:border-broadcast-orange/50 transition-all shadow-md dark:shadow-xl flex flex-col justify-between`}
              >
                {/* Visual Header */}
                <div
                  onClick={() => handleWatchLive(m.id)}
                  className="relative aspect-video bg-slate-950 flex items-center justify-center cursor-pointer overflow-hidden p-6"
                >
                  <div className={`absolute inset-0 bg-gradient-to-tr ${theme.darkBg} opacity-80 group-hover:scale-105 transition-transform duration-500`} />

                  {/* Sport Graphic Title */}
                  <div className="relative z-10 text-center">
                    <span className="text-lg sm:text-xl font-black text-white tracking-tight block">
                      {m.title}
                    </span>
                    <span className="text-xs font-semibold text-zinc-400 mt-1 block">
                      {m.tournament}
                    </span>
                  </div>

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-600 text-white text-[9px] font-black uppercase shadow">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    LIVE
                  </div>

                  <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[9px] font-black uppercase text-zinc-300">
                    {m.sport}
                  </div>
                </div>

                {/* Footer Controls: Watch CTA + Simple Clean QuickWatch Button */}
                <div className="p-3.5 sm:p-4 flex items-center justify-between border-t border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-[#0a0c10]">
                  <button
                    onClick={() => toggleQuickWatch(m.id)}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
                      isQuick
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                        : 'border-slate-200 dark:border-white/10 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {isQuick ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                    <span>{isQuick ? 'In QuickWatch' : '+ QuickWatch'}</span>
                  </button>

                  <button
                    onClick={() => handleWatchLive(m.id)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-broadcast-orange hover:bg-broadcast-orangeHover text-white rounded-lg text-xs font-black transition-all shadow-md shadow-broadcast-orange/30 hover:scale-105 active:scale-95"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Watch</span>
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
