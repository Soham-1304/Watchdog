import { useState } from 'react';
import { X, Sliders, Pin, Clock, BookOpen, Bot, Plus, Trash2 } from 'lucide-react';
import { useReplayStore } from '../store/useReplayStore';

export function SettingsDrawer() {
  const isOpen = useReplayStore((s) => s.isSettingsDrawerOpen);
  const setOpen = useReplayStore((s) => s.setSettingsDrawerOpen);
  const settings = useReplayStore((s) => s.settings);
  const updateSettings = useReplayStore((s) => s.updateSettings);

  const [newPlayer, setNewPlayer] = useState('');

  if (!isOpen) return null;

  const handleAddPlayer = () => {
    if (!newPlayer.trim()) return;
    const current = settings.pins?.players || [];
    if (!current.includes(newPlayer.trim())) {
      updateSettings({
        pins: {
          ...settings.pins,
          players: [...current, newPlayer.trim()],
        },
      });
    }
    setNewPlayer('');
  };

  const handleRemovePlayer = (p: string) => {
    const current = settings.pins?.players || [];
    updateSettings({
      pins: {
        ...settings.pins,
        players: current.filter((item) => item !== p),
      },
    });
  };

  const getThresholdLabel = (val: number) => {
    if (val >= 9) return 'Decisive Title / Championship Moments only (9-10)';
    if (val >= 7) return 'Major Turning Points & Wickets (7-8) [Default]';
    if (val >= 4) return 'Notable Milestones & Key Battles (4-6)';
    return 'Loud / Routine Events (1-3)';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-md flex justify-end animate-ticker-slide">
      <div className="w-full max-w-md bg-broadcast-surface h-full border-l border-broadcast-border flex flex-col shadow-2xl animate-slide-in-right">
        {/* Header */}
        <div className="p-5 border-b border-broadcast-border flex items-center justify-between bg-broadcast-card/90">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-broadcast-orange/15 text-broadcast-orange border border-broadcast-orange/30 shadow-md">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Viewer Controls</h3>
              <p className="text-xs text-broadcast-muted">Configure AI sensitivity & presentation filters</p>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 text-broadcast-subtle hover:text-white rounded-lg hover:bg-broadcast-cardHover transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* 1. Importance Threshold */}
          <div className="bg-broadcast-card/90 p-4 rounded-2xl border border-broadcast-border shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-black uppercase tracking-wider text-white">
                Importance Threshold
              </label>
              <span className="font-mono-numbers font-black text-xs px-2.5 py-0.5 rounded-lg bg-broadcast-orange text-white shadow-sm">
                &ge; {settings.threshold}/10
              </span>
            </div>
            <p className="text-[11px] text-broadcast-subtle mb-3 font-medium">
              {getThresholdLabel(settings.threshold)}
            </p>
            <input
              type="range"
              min="1"
              max="10"
              value={settings.threshold}
              onChange={(e) => updateSettings({ threshold: Number(e.target.value) })}
              className="w-full accent-broadcast-orange cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-broadcast-subtle mt-1.5 font-mono-numbers font-bold">
              <span>1 (Loud)</span>
              <span>7 (Balanced)</span>
              <span>10 (Decisive)</span>
            </div>
          </div>

          {/* 2. Pinned Players & Priorities */}
          <div className="bg-broadcast-card/90 p-4 rounded-2xl border border-broadcast-border shadow-sm">
            <div className="flex items-center gap-2 mb-1.5">
              <Pin className="w-4 h-4 text-broadcast-orange" />
              <label className="text-xs font-black uppercase tracking-wider text-white">
                Pinned Players & Athletes
              </label>
            </div>
            <p className="text-[11px] text-broadcast-subtle mb-3 font-medium">
              Events involving pinned players receive an automatic <strong>+2 boost</strong> to importance score.
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-3">
              {settings.pins?.players?.map((p) => (
                <span
                  key={p}
                  className="bg-broadcast-canvas px-3 py-1 rounded-xl border border-broadcast-border text-xs text-white font-bold flex items-center gap-2 shadow-sm"
                >
                  <span>{p}</span>
                  <button
                    onClick={() => handleRemovePlayer(p)}
                    className="text-broadcast-subtle hover:text-red-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>

            {/* Add player */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. Sinner, Hamilton, Klaasen"
                value={newPlayer}
                onChange={(e) => setNewPlayer(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddPlayer()}
                className="bg-broadcast-canvas border border-broadcast-border rounded-xl px-3.5 py-2 text-xs text-white placeholder-broadcast-subtle flex-1 focus:outline-none focus:border-broadcast-orange shadow-inner"
              />
              <button
                onClick={handleAddPlayer}
                className="px-3.5 py-2 bg-broadcast-card hover:bg-broadcast-cardHover text-white rounded-xl border border-broadcast-border text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            </div>
          </div>

          {/* 3. Anti-Spoiler Presentation Delay */}
          <div className="bg-broadcast-card/90 p-4 rounded-2xl border border-broadcast-border shadow-sm">
            <div className="flex justify-between items-center mb-1.5">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-broadcast-orange" />
                <label className="text-xs font-black uppercase tracking-wider text-white">
                  Stream Sync Delay (PTS Anchor)
                </label>
              </div>
              <span className="font-mono-numbers font-black text-xs text-broadcast-orange bg-broadcast-orange/15 px-2 py-0.5 rounded-md border border-broadcast-orange/25">
                +{settings.delaySeconds}s
              </span>
            </div>
            <p className="text-[11px] text-broadcast-subtle mb-3 font-medium">
              Synchronizes alert presentation with your video buffer latency to guarantee zero broadcast spoilers.
            </p>
            <input
              type="range"
              min="0"
              max="60"
              step="5"
              value={settings.delaySeconds}
              onChange={(e) => updateSettings({ delaySeconds: Number(e.target.value) })}
              className="w-full accent-broadcast-orange cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-broadcast-subtle mt-1.5 font-mono-numbers font-bold">
              <span>0s (Real-time data)</span>
              <span>15s (HLS Low Latency)</span>
              <span>60s (Standard Video)</span>
            </div>
          </div>

          {/* 4. Novice Mode Toggle */}
          <div className="bg-broadcast-card/90 p-4 rounded-2xl border border-broadcast-border flex items-center justify-between shadow-sm">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <BookOpen className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-black text-white uppercase tracking-wider">
                  Novice Fan Mode
                </span>
              </div>
              <p className="text-[11px] text-broadcast-subtle max-w-[260px] font-medium">
                Adds 1-line plain-English explainers for technical sports jargon (undercuts, DRS, tiebreaks).
              </p>
            </div>
            <button
              onClick={() => updateSettings({ novice: !settings.novice })}
              className={`w-12 h-6 rounded-full transition-colors p-0.5 shadow-inner ${
                settings.novice ? 'bg-broadcast-orange' : 'bg-broadcast-border'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform shadow-md ${
                  settings.novice ? 'translate-x-6' : 'translate-x-0'
                }`}
              ></div>
            </button>
          </div>

          {/* 5. Live AI Toggle */}
          <div className="bg-broadcast-card/90 p-4 rounded-2xl border border-broadcast-border flex items-center justify-between shadow-sm">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Bot className="w-4 h-4 text-broadcast-orange" />
                <span className="text-xs font-black text-white uppercase tracking-wider">
                  Live Agent Mesh
                </span>
              </div>
              <p className="text-[11px] text-broadcast-subtle max-w-[260px] font-medium">
                When enabled, invokes live backend multi-agent pipeline with automatic fallback.
              </p>
            </div>
            <button
              onClick={() => updateSettings({ liveAI: !settings.liveAI })}
              className={`w-12 h-6 rounded-full transition-colors p-0.5 shadow-inner ${
                settings.liveAI ? 'bg-broadcast-orange' : 'bg-broadcast-border'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform shadow-md ${
                  settings.liveAI ? 'translate-x-6' : 'translate-x-0'
                }`}
              ></div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
