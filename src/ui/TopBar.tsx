import { ChevronDown, Sparkles, Settings, User } from 'lucide-react';
import { useReplayStore } from '../store/useReplayStore';

export function TopBar() {
  const activePage = useReplayStore((s) => s.activePage);
  const setActivePage = useReplayStore((s) => s.setActivePage);
  const activeMatchId = useReplayStore((s) => s.activeMatchId);
  const matches = useReplayStore((s) => s.matches);
  const switchMatch = useReplayStore((s) => s.switchMatch);
  const setSettingsDrawerOpen = useReplayStore((s) => s.setSettingsDrawerOpen);

  return (
    <header className="sticky top-0 z-40 bg-[#0c0d12]/95 backdrop-blur-md border-b border-white/10 px-4 lg:px-8 py-2.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: FanCode Logo & Primary Navigation */}
        <div className="flex items-center gap-6">
          {/* FanCode Wordmark Logo */}
          <div
            onClick={() => setActivePage('stream')}
            className="flex items-center gap-1.5 cursor-pointer group select-none"
          >
            <span className="text-xl sm:text-2xl font-black italic tracking-tighter text-broadcast-orange group-hover:brightness-110 transition-all">
              FANCODE
            </span>
          </div>

          {/* Navigation Links (Matches FanCode Desktop Screenshot) */}
          <nav className="hidden lg:flex items-center gap-5 text-xs font-semibold text-zinc-400">
            <span className="hover:text-white cursor-pointer transition-colors">Home</span>
            <span className="text-white font-bold cursor-pointer relative py-1 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-broadcast-orange">
              Live Now
            </span>
            <span className="hover:text-white cursor-pointer transition-colors">Schedule</span>
            <span className="hover:text-white cursor-pointer transition-colors">Cricket</span>
            <span className="hover:text-white cursor-pointer transition-colors">Formula 1</span>
            <span className="hover:text-white cursor-pointer transition-colors flex items-center gap-1">
              All Sports <ChevronDown className="w-3 h-3" />
            </span>
          </nav>
        </div>

        {/* Center: Clean 2-Page Primary View Switcher */}
        <div className="flex items-center bg-white/5 p-1 rounded-xl border border-white/10 shadow-inner">
          <button
            onClick={() => setActivePage('stream')}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activePage === 'stream'
                ? 'bg-broadcast-orange text-white shadow-md shadow-broadcast-orange/30'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-red-400 animate-ping"></span>
            <span>Live Stream</span>
          </button>

          <button
            onClick={() => setActivePage('hub')}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activePage === 'hub'
                ? 'bg-broadcast-orange text-white shadow-md shadow-broadcast-orange/30'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 fill-current" />
            <span>Multi-Match Hub</span>
          </button>
        </div>

        {/* Right: Quick Match Selector & User Profile */}
        <div className="flex items-center gap-3">
          {/* Active Stream Selector Dropdown */}
          <div className="hidden sm:block">
            <select
              value={activeMatchId}
              onChange={(e) => {
                switchMatch(e.target.value);
                setActivePage('stream');
              }}
              className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-zinc-300 focus:outline-none focus:border-broadcast-orange/60 cursor-pointer"
            >
              {matches.map((m) => (
                <option key={m.id} value={m.id} className="bg-[#111317] text-white">
                  {m.title} ({m.sport.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          {/* Settings Drawer Button */}
          <button
            onClick={() => setSettingsDrawerOpen(true)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-white transition-colors"
            title="AI Sentinel & Alert Preferences"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* User Profile Avatar */}
          <div className="w-8 h-8 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-zinc-300 hover:text-white cursor-pointer hover:bg-white/20 transition-all">
            <User className="w-4 h-4" />
          </div>
        </div>
      </div>
    </header>
  );
}
