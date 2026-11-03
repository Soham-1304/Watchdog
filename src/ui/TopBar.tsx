import { ChevronDown, Sparkles, User } from 'lucide-react';
import { useReplayStore } from '../store/useReplayStore';

export function TopBar() {
  const currentPage = useReplayStore((s) => s.currentPage);
  const setCurrentPage = useReplayStore((s) => s.setCurrentPage);
  const quickWatchList = useReplayStore((s) => s.quickWatchList);
  const switchMatch = useReplayStore((s) => s.switchMatch);
  const matches = useReplayStore((s) => s.matches);

  const openQuickWatchSettings = () => {
    setCurrentPage('settings');
  };

  const openUserSettings = () => {
    setCurrentPage('settings');
  };

  const handleSelectSport = (sport: string) => {
    const match = matches.find((m) => m.sport === sport);
    if (match) {
      switchMatch(match.id);
      setCurrentPage('match');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0c0d12]/95 backdrop-blur-md border-b border-white/10 px-4 lg:px-8 py-3 transition-all select-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: FanCode Logo & Primary Navigation */}
        <div className="flex items-center gap-6 sm:gap-8">
          {/* FanCode Wordmark Logo */}
          <div
            onClick={() => setCurrentPage('home')}
            className="flex items-center gap-1.5 cursor-pointer group"
          >
            <span className="text-xl sm:text-2xl font-black italic tracking-tighter text-broadcast-orange group-hover:brightness-110 transition-all">
              FANCODE
            </span>
          </div>

          {/* Navigation Links (Matches Real FanCode Screenshot) */}
          <nav className="flex items-center gap-4 sm:gap-6 text-xs font-semibold text-zinc-400">
            {/* Home Tab */}
            <button
              onClick={() => setCurrentPage('home')}
              className={`relative py-1 transition-colors ${
                currentPage === 'home'
                  ? 'text-white font-extrabold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-broadcast-orange'
                  : 'hover:text-white'
              }`}
            >
              Home
            </button>

            {/* Live Now Tab */}
            <button
              onClick={() => setCurrentPage('match')}
              className={`relative py-1 flex items-center gap-1.5 transition-colors ${
                currentPage === 'match'
                  ? 'text-white font-extrabold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-broadcast-orange'
                  : 'hover:text-white'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
              <span>Live Now</span>
            </button>

            {/* Sport Links */}
            <span
              onClick={() => handleSelectSport('cricket')}
              className="hidden md:inline cursor-pointer hover:text-white transition-colors"
            >
              Cricket
            </span>
            <span
              onClick={() => handleSelectSport('f1')}
              className="hidden md:inline cursor-pointer hover:text-white transition-colors"
            >
              Formula 1
            </span>
            <span
              onClick={() => handleSelectSport('tennis')}
              className="hidden lg:inline cursor-pointer hover:text-white transition-colors"
            >
              Tennis
            </span>
            <span className="hidden xl:flex items-center gap-1 hover:text-white cursor-pointer transition-colors">
              All Sports <ChevronDown className="w-3 h-3" />
            </span>
          </nav>
        </div>

        {/* Right: QuickWatch Pill & User Profile (Opens Settings Dialog) */}
        <div className="flex items-center gap-3">
          {/* QuickWatch Indicator Pill */}
          <button
            onClick={openQuickWatchSettings}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-zinc-300 hover:text-white transition-all shadow-inner"
            title="QuickWatch Feeds"
          >
            <Sparkles className="w-3.5 h-3.5 text-broadcast-orange fill-current" />
            <span className="hidden sm:inline">QuickWatch</span>
            <span className="px-1.5 py-0.2 rounded-full bg-broadcast-orange/20 text-broadcast-orange font-mono-numbers text-[10px]">
              {quickWatchList.length}
            </span>
          </button>

          {/* User Profile Avatar (Opens Settings Tabs: Profile, QuickWatch, Cutaway AI) */}
          <button
            onClick={openUserSettings}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-zinc-300 hover:text-white transition-all"
            title="Account & Alert Preferences"
          >
            <User className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
