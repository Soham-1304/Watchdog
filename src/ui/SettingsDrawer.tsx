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
    if (val >= 9) return 'Decisive Title / Match Moments only (9-10)';
    if (val >= 7) return 'Major Turning Points & Wickets (7-8) [Default]';
    if (val >= 4) return 'Notable Milestones & Battles (4-6)';
    return 'Loud / Routine Events (1-3)';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end animate-fadeIn">
      <div className="w-full max-w-md bg-fancode-surface h-full border-l border-fancode-border flex flex-col shadow-2xl animate-slide-in-right">
        {/* Header */}
        <div className="p-5 border-b border-fancode-border flex items-center justify-between bg-fancode-card/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-fancode-orange/15 text-fancode-orange border border-fancode-orange/30">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">Viewer Controls</h3>
              <p className="text-xs text-fancode-muted">Tune Cutaway's AI sensitivity & alerts</p>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 text-fancode-subtle hover:text-white rounded-lg hover:bg-fancode-hover transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* 1. Importance Threshold */}
          <div className="bg-fancode-card/80 p-4 rounded-xl border border-fancode-border">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-white">
                Importance Threshold
              </label>
              <span className="font-mono-numbers font-black text-sm px-2 py-0.5 rounded bg-fancode-orange text-white">
                &ge; {settings.threshold}/10
              </span>
            </div>
            <p className="text-[11px] text-fancode-subtle mb-3">
              {getThresholdLabel(settings.threshold)}
            </p>
            <input
              type="range"
              min="1"
              max="10"
              value={settings.threshold}
              onChange={(e) => updateSettings({ threshold: Number(e.target.value) })}
              className="w-full accent-fancode-orange cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-fancode-subtle mt-1 font-mono-numbers">
              <span>1 (Loud)</span>
              <span>7 (Balanced)</span>
              <span>10 (Decisive)</span>
            </div>
          </div>

          {/* 2. Pinned Players & Priorities */}
          <div className="bg-fancode-card/80 p-4 rounded-xl border border-fancode-border">
            <div className="flex items-center gap-1.5 mb-1">
              <Pin className="w-3.5 h-3.5 text-fancode-orange" />
              <label className="text-xs font-bold uppercase tracking-wider text-white">
                Pinned Players & Athletes
              </label>
            </div>
            <p className="text-[11px] text-fancode-subtle mb-3">
              Events involving pinned players get an automatic <strong>+2 boost</strong> to importance score.
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-3">
              {settings.pins?.players?.map((p) => (
                <span
                  key={p}
                  className="bg-fancode-surface px-2.5 py-1 rounded-lg border border-fancode-border text-xs text-white font-medium flex items-center gap-1.5"
                >
                  <span>{p}</span>
                  <button
                    onClick={() => handleRemovePlayer(p)}
                    className="text-fancode-subtle hover:text-red-400"
                  >
                    <Trash2 className="w-3 h-3" />
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
                className="bg-fancode-bg border border-fancode-border rounded-lg px-3 py-1.5 text-xs text-white placeholder-fancode-subtle flex-1 focus:outline-none focus:border-fancode-orange"
              />
              <button
                onClick={handleAddPlayer}
                className="px-3 py-1.5 bg-fancode-surface hover:bg-fancode-card text-white rounded-lg border border-fancode-border text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            </div>
          </div>

          {/* 3. Anti-Spoiler Presentation Delay */}
          <div className="bg-fancode-card/80 p-4 rounded-xl border border-fancode-border">
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-fancode-orange" />
                <label className="text-xs font-bold uppercase tracking-wider text-white">
                  Stream Sync Delay
                </label>
              </div>
              <span className="font-mono-numbers font-bold text-xs text-fancode-orange">
                +{settings.delaySeconds}s
              </span>
            </div>
            <p className="text-[11px] text-fancode-subtle mb-3">
              Delays alerts to prevent data feeds from spoiling your video broadcast latency (Principle #3).
            </p>
            <input
              type="range"
              min="0"
              max="60"
              step="5"
              value={settings.delaySeconds}
              onChange={(e) => updateSettings({ delaySeconds: Number(e.target.value) })}
              className="w-full accent-fancode-orange cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-fancode-subtle mt-1 font-mono-numbers">
              <span>0s (Real-time data)</span>
              <span>15s (HLS Low Latency)</span>
              <span>60s (Standard Video)</span>
            </div>
          </div>

          {/* 4. Novice Mode Toggle */}
          <div className="bg-fancode-card/80 p-4 rounded-xl border border-fancode-border flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Novice Mode
                </span>
              </div>
              <p className="text-[11px] text-fancode-subtle max-w-[260px]">
                Adds 1-line plain-English explainers for technical sports jargon (undercuts, DRS, tiebreaks).
              </p>
            </div>
            <button
              onClick={() => updateSettings({ novice: !settings.novice })}
              className={`w-11 h-6 rounded-full transition-colors p-0.5 ${
                settings.novice ? 'bg-fancode-orange' : 'bg-fancode-border'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  settings.novice ? 'translate-x-5' : 'translate-x-0'
                }`}
              ></div>
            </button>
          </div>

          {/* 5. Live AI Toggle */}
          <div className="bg-fancode-card/80 p-4 rounded-xl border border-fancode-border flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <Bot className="w-3.5 h-3.5 text-fancode-orange" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Live LLM Scoring
                </span>
              </div>
              <p className="text-[11px] text-fancode-subtle max-w-[260px]">
                When disabled, uses deterministic precomputed JSON. When enabled, routes to `/api/score`.
              </p>
            </div>
            <button
              onClick={() => updateSettings({ liveAI: !settings.liveAI })}
              className={`w-11 h-6 rounded-full transition-colors p-0.5 ${
                settings.liveAI ? 'bg-fancode-orange' : 'bg-fancode-border'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  settings.liveAI ? 'translate-x-5' : 'translate-x-0'
                }`}
              ></div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
