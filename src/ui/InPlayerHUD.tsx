import { Sparkles, Sliders, BookOpen, Shield } from 'lucide-react';
import { useReplayStore } from '../store/useReplayStore';

export function InPlayerHUD() {
  const isOpen = useReplayStore((s) => s.isInPlayerHUDOpen);
  const setIsOpen = useReplayStore((s) => s.setIsInPlayerHUDOpen);
  const settings = useReplayStore((s) => s.settings);
  const updateSettings = useReplayStore((s) => s.updateSettings);
  const setSettingsDrawerOpen = useReplayStore((s) => s.setSettingsDrawerOpen);

  if (!isOpen) return null;

  return (
    <div className="absolute top-12 right-4 z-40 w-80 broadcast-glass rounded-2xl p-4 shadow-2xl border border-white/15 animate-ticker-slide text-xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-broadcast-orange/20 text-broadcast-orange border border-broadcast-orange/30">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="font-extrabold text-white text-xs">In-Stream AI Sentinel</h4>
            <p className="text-[10px] text-broadcast-subtle">Quick live cues (like CC / Audio)</p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-broadcast-subtle hover:text-white p-1 rounded"
        >
          ✕
        </button>
      </div>

      <div className="space-y-3.5">
        {/* Master In-Stream Toggle */}
        <div className="flex items-center justify-between bg-broadcast-card/80 p-2.5 rounded-xl border border-white/5">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-broadcast-orange" />
            <div>
              <span className="font-bold text-white block">Cutaway Alerts</span>
              <span className="text-[10px] text-broadcast-subtle">Show turning points on video</span>
            </div>
          </div>
          <button
            onClick={() => updateSettings({ enabled: !settings.enabled })}
            className={`w-11 h-6 rounded-full transition-colors p-0.5 shadow-inner ${
              settings.enabled ? 'bg-broadcast-orange' : 'bg-broadcast-border'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                settings.enabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            ></div>
          </button>
        </div>

        {/* Content Depth Selector */}
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-broadcast-subtle block mb-1.5">
            Alert Depth (Cues)
          </label>
          <div className="grid grid-cols-3 gap-1.5 bg-broadcast-card p-1 rounded-xl border border-white/5">
            {(['concise', 'tactical', 'stat_heavy'] as const).map((depth) => (
              <button
                key={depth}
                onClick={() => updateSettings({ contentDepth: depth })}
                className={`py-1 text-[10px] font-bold rounded-lg transition-all capitalize ${
                  settings.contentDepth === depth
                    ? 'bg-broadcast-orange text-white shadow-sm'
                    : 'text-broadcast-muted hover:text-white'
                }`}
              >
                {depth === 'stat_heavy' ? 'Stats' : depth}
              </button>
            ))}
          </div>
        </div>

        {/* Novice Jargon Explainer Toggle */}
        <div className="flex items-center justify-between bg-broadcast-card/80 p-2.5 rounded-xl border border-white/5">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-amber-400" />
            <div>
              <span className="font-bold text-white block">Novice Jargon Mode</span>
              <span className="text-[10px] text-broadcast-subtle">Explain technical sports rules</span>
            </div>
          </div>
          <button
            onClick={() => updateSettings({ novice: !settings.novice })}
            className={`w-11 h-6 rounded-full transition-colors p-0.5 shadow-inner ${
              settings.novice ? 'bg-broadcast-orange' : 'bg-broadcast-border'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                settings.novice ? 'translate-x-5' : 'translate-x-0'
              }`}
            ></div>
          </button>
        </div>

        {/* Link to Permanent Settings */}
        <button
          onClick={() => {
            setIsOpen(false);
            setSettingsDrawerOpen(true);
          }}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-broadcast-surface hover:bg-broadcast-card border border-white/10 text-broadcast-muted hover:text-white transition-all text-[11px] font-semibold"
        >
          <div className="flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-broadcast-orange" />
            <span>All Preferences (Delay, Pins, Dream11)</span>
          </div>
          <span>→</span>
        </button>
      </div>
    </div>
  );
}
