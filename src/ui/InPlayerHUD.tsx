import { Sparkles, Sliders } from 'lucide-react';
import { useReplayStore } from '../store/useReplayStore';

export function InPlayerHUD() {
  const isOpen = useReplayStore((s) => s.isInPlayerHUDOpen);
  const setIsOpen = useReplayStore((s) => s.setIsInPlayerHUDOpen);
  const settings = useReplayStore((s) => s.settings);
  const updateSettings = useReplayStore((s) => s.updateSettings);
  const setSettingsDrawerOpen = useReplayStore((s) => s.setSettingsDrawerOpen);
  const setSettingsTab = useReplayStore((s) => s.setSettingsTab);

  if (!isOpen) return null;

  return (
    <div className="absolute top-12 right-4 z-40 w-72 bg-[#12151d]/95 backdrop-blur-xl rounded-2xl p-3.5 shadow-2xl border border-white/15 animate-ticker-slide text-xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-2.5">
        <div className="flex items-center gap-1.5 font-bold text-white text-xs">
          <Sparkles className="w-3.5 h-3.5 text-broadcast-orange fill-current" />
          <span>Smart Cues</span>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-zinc-400 hover:text-white p-0.5 rounded text-xs"
        >
          ✕
        </button>
      </div>

      <div className="space-y-3">
        {/* Toggle 1: Pivotal Alerts */}
        <div className="flex items-center justify-between">
          <span className="text-zinc-200 font-medium">Live Turning Points</span>
          <button
            onClick={() => updateSettings({ enabled: !settings.enabled })}
            className={`w-9 h-5 rounded-full transition-colors p-0.5 shadow-inner ${
              settings.enabled ? 'bg-broadcast-orange' : 'bg-zinc-700'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform ${
                settings.enabled ? 'translate-x-4' : 'translate-x-0'
              }`}
            ></div>
          </button>
        </div>

        {/* Detail Level */}
        <div>
          <span className="text-[10px] text-zinc-400 block mb-1">Detail</span>
          <div className="grid grid-cols-3 gap-1 bg-white/5 p-0.5 rounded-lg border border-white/5">
            {(['concise', 'tactical', 'stat_heavy'] as const).map((depth) => (
              <button
                key={depth}
                onClick={() => updateSettings({ contentDepth: depth })}
                className={`py-1 text-[10px] font-bold rounded capitalize transition-all ${
                  settings.contentDepth === depth
                    ? 'bg-broadcast-orange text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {depth === 'stat_heavy' ? 'Stats' : depth}
              </button>
            ))}
          </div>
        </div>

        {/* Toggle 2: Casual Explanations */}
        <div className="flex items-center justify-between pt-1 border-t border-white/5">
          <span className="text-zinc-200 font-medium">Casual Explanations</span>
          <button
            onClick={() => updateSettings({ novice: !settings.novice })}
            className={`w-9 h-5 rounded-full transition-colors p-0.5 shadow-inner ${
              settings.novice ? 'bg-amber-500' : 'bg-zinc-700'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform ${
                settings.novice ? 'translate-x-4' : 'translate-x-0'
              }`}
            ></div>
          </button>
        </div>

        {/* Link to Settings */}
        <button
          onClick={() => {
            setIsOpen(false);
            setSettingsTab('cutaway');
            setSettingsDrawerOpen(true);
          }}
          className="w-full pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-zinc-400 hover:text-white"
        >
          <div className="flex items-center gap-1">
            <Sliders className="w-3 h-3 text-broadcast-orange" />
            <span>All Preferences</span>
          </div>
          <span>→</span>
        </button>
      </div>
    </div>
  );
}
