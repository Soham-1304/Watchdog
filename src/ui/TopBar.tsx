import { motion } from 'framer-motion';
import { Sparkles, Settings, Sun, Moon } from 'lucide-react';
import { useReplayStore } from '../store/useReplayStore';

export function TopBar() {
  const currentPage = useReplayStore((s) => s.currentPage);
  const setCurrentPage = useReplayStore((s) => s.setCurrentPage);
  const quickWatchList = useReplayStore((s) => s.quickWatchList);
  const activeMatchId = useReplayStore((s) => s.activeMatchId);
  const switchMatch = useReplayStore((s) => s.switchMatch);
  const matches = useReplayStore((s) => s.matches);
  const theme = useReplayStore((s) => s.theme);
  const toggleTheme = useReplayStore((s) => s.toggleTheme);

  const handleSelectSport = (sport: 'tennis' | 'f1' | 'cricket') => {
    const match = matches.find((m) => m.sport === sport);
    if (match) {
      switchMatch(match.id);
      setCurrentPage('match');
    }
  };

  const activeMatch = matches.find((m) => m.id === activeMatchId);

  return (
    <header className="sticky top-0 z-40 bg-white/85 dark:bg-[#08090c]/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/5 px-4 lg:px-8 py-3 transition-colors duration-200 select-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: FanCode Logo & Primary Navigation */}
        <div className="flex items-center gap-6 sm:gap-8">
          {/* FanCode Wordmark Logo */}
          <div
            onClick={() => setCurrentPage('home')}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <span className="text-xl sm:text-2xl font-black italic tracking-tighter text-broadcast-orange group-hover:brightness-110 transition-all drop-shadow-[0_0_12px_rgba(255,82,0,0.35)]">
              FANCODE
            </span>
          </div>

          {/* Simple Clean Navigation: Home + 3 Streams */}
          <nav className="flex items-center gap-1 sm:gap-2 text-xs font-bold text-slate-600 dark:text-zinc-400">
            {/* Home */}
            <button
              onClick={() => setCurrentPage('home')}
              className={`relative px-3 py-1.5 rounded-lg transition-colors ${
                currentPage === 'home'
                  ? 'text-slate-900 dark:text-white'
                  : 'hover:text-slate-900 dark:hover:text-zinc-200'
              }`}
            >
              Home
              {currentPage === 'home' && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute bottom-0 left-2 right-2 h-0.5 bg-broadcast-orange rounded-full shadow-[0_0_8px_#ff5200]"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </button>

            {/* Tennis Stream */}
            <button
              onClick={() => handleSelectSport('tennis')}
              className={`relative px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                currentPage === 'match' && activeMatch?.sport === 'tennis'
                  ? 'text-slate-900 dark:text-white'
                  : 'hover:text-slate-900 dark:hover:text-zinc-200'
              }`}
            >
              <span>Tennis</span>
              {currentPage === 'match' && activeMatch?.sport === 'tennis' && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute bottom-0 left-2 right-2 h-0.5 bg-broadcast-orange rounded-full shadow-[0_0_8px_#ff5200]"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </button>

            {/* Formula 1 Stream */}
            <button
              onClick={() => handleSelectSport('f1')}
              className={`relative px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                currentPage === 'match' && activeMatch?.sport === 'f1'
                  ? 'text-slate-900 dark:text-white'
                  : 'hover:text-slate-900 dark:hover:text-zinc-200'
              }`}
            >
              <span>Formula 1</span>
              {currentPage === 'match' && activeMatch?.sport === 'f1' && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute bottom-0 left-2 right-2 h-0.5 bg-broadcast-orange rounded-full shadow-[0_0_8px_#ff5200]"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </button>

            {/* Cricket Stream */}
            <button
              onClick={() => handleSelectSport('cricket')}
              className={`relative px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                currentPage === 'match' && activeMatch?.sport === 'cricket'
                  ? 'text-slate-900 dark:text-white'
                  : 'hover:text-slate-900 dark:hover:text-zinc-200'
              }`}
            >
              <span>Cricket</span>
              {currentPage === 'match' && activeMatch?.sport === 'cricket' && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute bottom-0 left-2 right-2 h-0.5 bg-broadcast-orange rounded-full shadow-[0_0_8px_#ff5200]"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          </nav>
        </div>

        {/* Right: Theme Toggle, QuickWatch Pill & Settings */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Light / Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-white/10 transition-colors"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {/* QuickWatch Pill */}
          <button
            onClick={() => setCurrentPage('settings')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-700 dark:text-zinc-300 transition-all shadow-sm"
            title="QuickWatch Feeds"
          >
            <Sparkles className="w-3.5 h-3.5 text-broadcast-orange fill-current" />
            <span className="hidden sm:inline">QuickWatch</span>
            <span className="px-1.5 py-0.2 rounded-full bg-broadcast-orange/20 text-broadcast-orange font-mono-numbers text-[10px]">
              {quickWatchList.length}
            </span>
          </button>

          {/* Settings Button */}
          <button
            onClick={() => setCurrentPage('settings')}
            className={`p-2 rounded-xl transition-all ${
              currentPage === 'settings'
                ? 'bg-broadcast-orange text-white shadow-lg shadow-broadcast-orange/30'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-white/10'
            }`}
            title="Settings & Preferences"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
