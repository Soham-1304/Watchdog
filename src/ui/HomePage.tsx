import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, ChevronLeft, ChevronRight, Sparkles, Activity } from 'lucide-react';
import { useReplayStore } from '../store/useReplayStore';
import { SquishSwitch } from './SquishSwitch';

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
          accent: 'text-lime-400',
          bg: 'from-emerald-950/40 via-zinc-950 to-black',
          border: 'border-lime-500/20 hover:border-lime-400/50',
          glow: 'rgba(163,230,53,0.15)',
        };
      case 'f1':
        return {
          accent: 'text-red-400',
          bg: 'from-red-950/40 via-zinc-950 to-black',
          border: 'border-red-500/20 hover:border-red-400/50',
          glow: 'rgba(239,68,68,0.15)',
        };
      case 'cricket':
      default:
        return {
          accent: 'text-broadcast-orange',
          bg: 'from-orange-950/40 via-zinc-950 to-black',
          border: 'border-orange-500/20 hover:border-orange-400/50',
          glow: 'rgba(255,82,0,0.15)',
        };
    }
  };

  return (
    <div className="space-y-10 animate-ticker-slide pb-12 select-none">
      {/* 1. CINEMATIC HERO MARQUEE */}
      <div className="relative w-full rounded-3xl overflow-hidden border border-white/10 shadow-2xl min-h-[380px] sm:min-h-[440px] flex items-center bg-black">
        {/* Animated Background Atmosphere */}
        <AnimatePresence mode="wait">
          <motion.div
            key={heroMatch?.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className={`absolute inset-0 bg-gradient-to-r ${sportTheme(heroMatch?.sport || '').bg}`}
          >
            {/* Subtle radial spotlight glow */}
            <div className="absolute right-10 top-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-broadcast-orange/15 blur-3xl pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
          </motion.div>
        </AnimatePresence>

        {/* Carousel Navigation Arrows */}
        <button
          onClick={prevHero}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 border border-white/10 text-white flex items-center justify-center transition-all backdrop-blur-md hover:scale-105 active:scale-95 shadow-xl"
          title="Previous Match"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={nextHero}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 border border-white/10 text-white flex items-center justify-center transition-all backdrop-blur-md hover:scale-105 active:scale-95 shadow-xl"
          title="Next Match"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Hero Content */}
        <div className="relative z-10 px-8 sm:px-16 py-10 max-w-2xl space-y-4">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600/90 text-white text-[10px] font-black tracking-widest uppercase shadow-lg shadow-red-600/30">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              LIVE
            </span>
            <span className="text-[11px] font-black uppercase tracking-wider text-broadcast-orange bg-broadcast-orange/15 px-2.5 py-0.5 rounded-full border border-broadcast-orange/30">
              {heroMatch?.sport}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            {heroMatch?.title}
          </h1>

          <p className="text-sm sm:text-base text-zinc-300 font-medium">
            {heroMatch?.tournament} · {heroMatch?.subtitle}
          </p>

          {/* Action Row: Watch Button + SquishSwitch for QuickWatch */}
          <div className="flex flex-wrap items-center gap-4 pt-3">
            <button
              onClick={() => heroMatch && handleWatchLive(heroMatch.id)}
              className="flex items-center gap-2 px-7 py-3 bg-broadcast-orange hover:bg-broadcast-orangeHover text-white rounded-2xl text-sm font-black transition-all shadow-xl shadow-broadcast-orange/30 hover:scale-105 active:scale-95"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>WATCH LIVE</span>
            </button>

            {/* SquishSwitch for QuickWatch monitoring */}
            <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-black/50 backdrop-blur-md border border-white/10">
              <SquishSwitch
                checked={Boolean(isHeroInQuickWatch)}
                onChange={() => heroMatch && toggleQuickWatch(heroMatch.id)}
                trackColor="#27272a"
                trackOnColor="#ff5200"
                width={52}
                height={28}
                radius={14}
              />
              <span className="text-xs font-bold text-zinc-300">
                {isHeroInQuickWatch ? 'In QuickWatch' : 'Add QuickWatch'}
              </span>
            </div>
          </div>

          {/* Carousel Dot Indicators */}
          <div className="flex items-center gap-2 pt-4">
            {matches.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setHeroIdx(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  heroIdx === idx ? 'w-8 bg-broadcast-orange' : 'w-2 bg-white/20 hover:bg-white/40'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 2. LIVE STREAMS CARDS SECTION */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-broadcast-orange" />
            <h2 className="text-lg font-black text-white tracking-tight">Live Matches ({matches.length})</h2>
          </div>
          <button
            onClick={() => setCurrentPage('settings')}
            className="text-xs font-bold text-zinc-400 hover:text-white transition-colors flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5 text-broadcast-orange" />
            <span>Preferences</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {matches.map((m) => {
            const isQuick = quickWatchList.includes(m.id);
            const theme = sportTheme(m.sport);

            return (
              <motion.div
                key={m.id}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className={`group bg-[#0e1017] rounded-3xl overflow-hidden border ${theme.border} transition-all shadow-xl flex flex-col justify-between`}
              >
                {/* Visual Header */}
                <div
                  onClick={() => handleWatchLive(m.id)}
                  className="relative aspect-video bg-black flex items-center justify-center cursor-pointer overflow-hidden p-6"
                >
                  <div className={`absolute inset-0 bg-gradient-to-tr ${theme.bg} opacity-70 group-hover:scale-105 transition-transform duration-500`} />
                  
                  {/* Subtle Sport Graphic Text */}
                  <div className="relative z-10 text-center">
                    <span className="text-xl font-black text-white tracking-tight block">
                      {m.title}
                    </span>
                    <span className="text-xs font-bold text-zinc-400 mt-1 block">
                      {m.tournament}
                    </span>
                  </div>

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black uppercase shadow">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    LIVE
                  </div>

                  <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-black uppercase text-zinc-300">
                    {m.sport}
                  </div>
                </div>

                {/* Footer Controls: Watch CTA + SquishSwitch */}
                <div className="p-4 sm:p-5 flex items-center justify-between border-t border-white/5 bg-[#0a0c10]">
                  <div className="flex items-center gap-2">
                    <SquishSwitch
                      checked={isQuick}
                      onChange={() => toggleQuickWatch(m.id)}
                      trackColor="#27272a"
                      trackOnColor="#ff5200"
                      width={44}
                      height={24}
                      radius={12}
                    />
                    <span className="text-[11px] font-bold text-zinc-400">
                      {isQuick ? 'Watching' : 'QuickWatch'}
                    </span>
                  </div>

                  <button
                    onClick={() => handleWatchLive(m.id)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-broadcast-orange text-white rounded-xl text-xs font-black transition-all hover:shadow-lg hover:shadow-broadcast-orange/30"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
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
