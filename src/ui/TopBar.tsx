import { motion } from 'framer-motion';
import { Settings, Sun, Moon } from 'lucide-react';
import { useReplayStore } from '../store/useReplayStore';

export function TopBar() {
  const currentPage = useReplayStore((s) => s.currentPage);
  const setCurrentPage = useReplayStore((s) => s.setCurrentPage);
  const activeMatchId = useReplayStore((s) => s.activeMatchId);
  const switchMatch = useReplayStore((s) => s.switchMatch);
  const matches = useReplayStore((s) => s.matches);
  const theme = useReplayStore((s) => s.theme);
  const toggleTheme = useReplayStore((s) => s.toggleTheme);
  const play = useReplayStore((s) => s.play);
  const exitGuidedDemo = useReplayStore((s) => s.exitGuidedDemo);

  const handleSelectSport = (sport: 'tennis' | 'f1' | 'cricket') => {
    const match = matches.find((m) => m.sport === sport);
    if (match) {
      switchMatch(match.id);
      setCurrentPage('match');
      play();
      exitGuidedDemo();
    }
  };

  const activeMatch = matches.find((m) => m.id === activeMatchId);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 px-3 py-2.5 backdrop-blur-xl transition-colors duration-200 dark:border-white/5 dark:bg-[#08090c]/90 sm:px-4 lg:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 sm:gap-4">
        {/* Left: FanCode Logo & Primary Navigation */}
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-8">
          {/* FanCode Wordmark Logo */}
          <button
            type="button"
            onClick={() => { exitGuidedDemo(); setCurrentPage('home'); }}
            aria-label="FanCode home"
            className="group shrink-0 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-broadcast-orange"
          >
            <span className="text-lg font-black italic tracking-tighter text-broadcast-orange transition-all drop-shadow-[0_0_12px_rgba(255,82,0,0.2)] group-hover:brightness-110 sm:text-2xl">
              FANCODE
            </span>
          </button>

          {/* Simple Clean Navigation: Home + 3 Streams */}
          <nav aria-label="Main navigation" className="scrollbar-none flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto text-[11px] font-bold text-slate-600 dark:text-zinc-400 sm:gap-2 sm:text-xs">
            {/* Home */}
            <button
              onClick={() => { exitGuidedDemo(); setCurrentPage('home'); }}
              aria-current={currentPage === 'home' ? 'page' : undefined}
              className={`relative min-h-9 shrink-0 whitespace-nowrap rounded-lg px-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-broadcast-orange sm:px-3 ${
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
              aria-label="Tennis stream"
              aria-current={currentPage === 'match' && activeMatch?.sport === 'tennis' ? 'page' : undefined}
              className={`relative flex min-h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-broadcast-orange sm:px-3 ${
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
              aria-label="Formula 1 stream"
              aria-current={currentPage === 'match' && activeMatch?.sport === 'f1' ? 'page' : undefined}
              className={`relative flex min-h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-broadcast-orange sm:px-3 ${
                currentPage === 'match' && activeMatch?.sport === 'f1'
                  ? 'text-slate-900 dark:text-white'
                  : 'hover:text-slate-900 dark:hover:text-zinc-200'
              }`}
            >
              <span className="sm:hidden">F1</span><span className="hidden sm:inline">Formula 1</span>
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
              aria-label="Cricket stream"
              aria-current={currentPage === 'match' && activeMatch?.sport === 'cricket' ? 'page' : undefined}
              className={`relative flex min-h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-broadcast-orange sm:px-3 ${
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

        {/* Right: Theme Toggle & Settings */}
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2.5">
          {/* Light / Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            type="button"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-slate-700 transition-colors hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-broadcast-orange dark:border-white/10 dark:bg-white/5 dark:text-zinc-300 dark:hover:bg-white/10 sm:h-10 sm:w-10"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {/* Settings Button */}
          <button
            onClick={() => { exitGuidedDemo(); setCurrentPage('settings'); }}
            type="button"
            aria-label="Open settings"
            aria-current={currentPage === 'settings' ? 'page' : undefined}
            className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-broadcast-orange sm:h-10 sm:w-10 ${
              currentPage === 'settings'
                ? 'bg-broadcast-orange text-white shadow-lg shadow-broadcast-orange/30'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-white/10'
            }`}
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
