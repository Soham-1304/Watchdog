import {
  Play,
  Pause,
  RotateCcw,
  Sliders,
  Filter,
  Sparkles,
  Radio,
} from 'lucide-react';
import { useReplayStore } from '../store/useReplayStore';

export function TopBar() {
  const isPlaying = useReplayStore((s) => s.isPlaying);
  const speed = useReplayStore((s) => s.speed);
  const currentTime = useReplayStore((s) => s.currentTime);
  const totalEvaluated = useReplayStore((s) => s.totalEvaluatedCount);
  const totalAlerts = useReplayStore((s) => s.totalAlertsCount);

  const togglePlay = useReplayStore((s) => s.togglePlay);
  const setSpeed = useReplayStore((s) => s.setSpeed);
  const restart = useReplayStore((s) => s.restart);
  const setFilteredDrawerOpen = useReplayStore((s) => s.setFilteredDrawerOpen);
  const setSettingsDrawerOpen = useReplayStore((s) => s.setSettingsDrawerOpen);
  const startGuidedDemo = useReplayStore((s) => s.startGuidedDemo);
  const isGuidedDemoActive = useReplayStore((s) => s.isGuidedDemoActive);

  // Format MM:SS
  const mins = Math.floor(currentTime / 60);
  const secs = Math.floor(currentTime % 60);
  const timeFormatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  const speeds: (1 | 5 | 10 | 20)[] = [1, 5, 10, 20];

  return (
    <header className="broadcast-glass sticky top-0 z-40 px-4 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3 shadow-2xl border-b border-broadcast-border">
      {/* Brand & Prototype Identity */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-broadcast-orange to-broadcast-amber flex items-center justify-center text-white font-black text-xl shadow-lg shadow-broadcast-orange/30 ring-1 ring-white/20">
            C
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-white">Cutaway</span>
              <span className="text-[10px] font-bold bg-broadcast-card px-2 py-0.5 rounded text-broadcast-orange border border-broadcast-orange/30 uppercase tracking-wider">
                FanCode AI
              </span>
            </div>
            <p className="text-[11px] text-broadcast-subtle hidden sm:block">
              Multi-Match Sentinel · Decoupled Agent Mesh
            </p>
          </div>
        </div>

        <div className="hidden xl:flex items-center gap-2 ml-4 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
          <Radio className="w-3.5 h-3.5 animate-pulse text-amber-400" />
          <span>Synchronized Multi-Sport Replay</span>
        </div>
      </div>

      {/* Center Controls: Playback, Speed, Clock */}
      <div className="flex items-center gap-2 sm:gap-3 bg-broadcast-canvas/80 px-3.5 py-1.5 rounded-xl border border-broadcast-border/90 shadow-inner">
        <button
          onClick={restart}
          title="Restart Replay (00:00)"
          className="p-1.5 text-broadcast-muted hover:text-white hover:bg-broadcast-card rounded-lg transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          onClick={togglePlay}
          className="flex items-center gap-1.5 px-3.5 py-1 bg-gradient-to-r from-broadcast-orange to-broadcast-orangeHover text-white rounded-lg text-xs font-extrabold transition-all shadow-md shadow-broadcast-orange/30 active:scale-95 hover:brightness-110"
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
          <span>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
        </button>

        {/* Speed Pills */}
        <div className="flex items-center bg-broadcast-card p-0.5 rounded-lg border border-broadcast-border">
          {speeds.map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={`px-2.5 py-0.5 text-xs font-bold rounded transition-all ${
                speed === s
                  ? 'bg-broadcast-orange text-white shadow-sm shadow-broadcast-orange/50'
                  : 'text-broadcast-muted hover:text-white'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>

        {/* High-Precision Clock */}
        <div className="font-mono-numbers text-xs font-bold text-broadcast-muted bg-broadcast-card px-2.5 py-1 rounded-lg border border-broadcast-border flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>{timeFormatted}</span>
        </div>
      </div>

      {/* Right Controls: Filtered View, Guided Demo, Settings */}
      <div className="flex items-center gap-2.5">
        {/* Restraint Counter CTA */}
        <button
          onClick={() => setFilteredDrawerOpen(true)}
          title="Inspect filtered events (Proof of restraint)"
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-broadcast-card hover:bg-broadcast-cardHover border border-broadcast-border text-xs font-medium text-broadcast-text transition-all hover:border-broadcast-borderLight shadow-sm"
        >
          <Filter className="w-3.5 h-3.5 text-broadcast-orange" />
          <span className="hidden sm:inline text-broadcast-muted">Filtered:</span>
          <span className="font-mono-numbers font-extrabold text-white">
            {totalEvaluated} ev / {totalAlerts} al
          </span>
        </button>

        {/* Guided Demo Button */}
        <button
          onClick={startGuidedDemo}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
            isGuidedDemoActive
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 ring-1 ring-emerald-500/50'
              : 'bg-gradient-to-r from-broadcast-orange to-broadcast-amber text-white shadow-lg shadow-broadcast-orange/25 hover:brightness-110 active:scale-95'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Guided Demo</span>
        </button>

        {/* Settings Slider Drawer */}
        <button
          onClick={() => setSettingsDrawerOpen(true)}
          title="Viewer Controls & AI Settings"
          className="p-2 text-broadcast-muted hover:text-white bg-broadcast-card hover:bg-broadcast-cardHover rounded-xl border border-broadcast-border transition-colors shadow-sm"
        >
          <Sliders className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
