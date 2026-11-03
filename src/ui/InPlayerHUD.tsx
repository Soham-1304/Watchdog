import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Sliders, X } from 'lucide-react';
import { useReplayStore } from '../store/useReplayStore';

export function InPlayerHUD() {
  const isOpen = useReplayStore((s) => s.isInPlayerHUDOpen);
  const setIsOpen = useReplayStore((s) => s.setIsInPlayerHUDOpen);
  const settings = useReplayStore((s) => s.settings);
  const updateSettings = useReplayStore((s) => s.updateSettings);
  const setCurrentPage = useReplayStore((s) => s.setCurrentPage);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: 60, opacity: 0, scale: 0.98 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 60, opacity: 0, scale: 0.98 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="absolute bottom-16 inset-x-3 sm:inset-x-6 z-40 bg-black/85 backdrop-blur-2xl border border-white/20 p-3.5 sm:p-4 rounded-2xl shadow-2xl select-none"
        >
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            {/* Left: Title & Sparkle Icon */}
            <div className="flex items-center justify-between w-full sm:w-auto gap-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-broadcast-orange/20 text-broadcast-orange">
                  <Sparkles className="w-3.5 h-3.5 fill-current" />
                </span>
                <span className="font-black text-white text-xs tracking-wide">
                  Live Cues & Explainer Toolbar
                </span>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="sm:hidden text-zinc-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Center: Controls */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 w-full sm:w-auto">
              {/* Turning Point Alerts */}
              <div className="flex items-center gap-2 bg-white/10 px-2.5 py-1.5 rounded-xl border border-white/10">
                <span className="text-[11px] font-bold text-zinc-200">Alerts:</span>
                <button
                  onClick={() => updateSettings({ enabled: !settings.enabled })}
                  className={`w-8 h-4.5 rounded-full transition-colors p-0.5 shadow-inner ${
                    settings.enabled ? 'bg-broadcast-orange' : 'bg-zinc-700'
                  }`}
                >
                  <div
                    className={`w-3.5 h-3.5 rounded-full bg-white transition-transform ${
                      settings.enabled ? 'translate-x-3.5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Depth Pills */}
              <div className="flex items-center gap-1 bg-white/10 p-1 rounded-xl border border-white/10">
                {(['concise', 'tactical', 'stat_heavy'] as const).map((depth) => (
                  <button
                    key={depth}
                    onClick={() => updateSettings({ contentDepth: depth })}
                    className={`px-2.5 py-1 text-[10px] font-bold rounded-lg capitalize transition-all ${
                      settings.contentDepth === depth
                        ? 'bg-broadcast-orange text-white shadow-sm'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {depth === 'stat_heavy' ? 'Stats' : depth}
                  </button>
                ))}
              </div>

              {/* Rules Explainer */}
              <div className="flex items-center gap-2 bg-white/10 px-2.5 py-1.5 rounded-xl border border-white/10">
                <span className="text-[11px] font-bold text-zinc-200">Rules Helper:</span>
                <button
                  onClick={() => updateSettings({ novice: !settings.novice })}
                  className={`w-8 h-4.5 rounded-full transition-colors p-0.5 shadow-inner ${
                    settings.novice ? 'bg-amber-500' : 'bg-zinc-700'
                  }`}
                >
                  <div
                    className={`w-3.5 h-3.5 rounded-full bg-white transition-transform ${
                      settings.novice ? 'translate-x-3.5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Right: Settings & Close */}
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={() => {
                  setIsOpen(false);
                  setCurrentPage('settings');
                }}
                className="flex items-center gap-1 text-[11px] font-bold text-zinc-300 hover:text-white px-2.5 py-1.5 rounded-xl hover:bg-white/10 transition-colors border border-white/10"
              >
                <Sliders className="w-3.5 h-3.5 text-broadcast-orange" />
                <span>All Settings</span>
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="text-zinc-400 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-colors"
                title="Close toolbar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
