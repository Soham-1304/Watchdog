import {
  Play,
  Pause,
  RotateCcw,
  Sliders,
  Filter,
  Sparkles,
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
    <header className="bg-fancode-surface/95 backdrop-blur-md border-b border-fancode-border sticky top-0 z-40 px-4 lg:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-lg">
      {/* Brand & Prototype Chip */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-fancode-orange to-fancode-orangeLight flex items-center justify-center text-white font-black text-lg shadow-md shadow-fancode-orange/20">
            C
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight text-white">Cutaway</span>
              <span className="text-[10px] font-medium bg-fancode-card px-1.5 py-0.5 rounded text-fancode-orange border border-fancode-orange/30">
                Built for FanCode
              </span>
            </div>
            <p className="text-[11px] text-fancode-subtle hidden sm:block">
              Multi-Match AI Companion · Real-time turning points
            </p>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-1.5 ml-2 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
          Replay of recorded matches (prototype)
        </div>
      </div>

      {/* Center Controls: Playback & Speed */}
      <div className="flex items-center gap-2 sm:gap-3 bg-fancode-bg/80 px-3 py-1.5 rounded-xl border border-fancode-border/80">
        <button
          onClick={restart}
          title="Restart Replay"
          className="p-1.5 text-fancode-muted hover:text-white hover:bg-fancode-card rounded-lg transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          onClick={togglePlay}
          className="flex items-center gap-1.5 px-3 py-1 bg-fancode-orange hover:bg-fancode-orangeLight text-white rounded-lg text-xs font-bold transition-all shadow-sm shadow-fancode-orange/30 active:scale-95"
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
          <span>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
        </button>

        {/* Speed Selector */}
        <div className="flex items-center bg-fancode-card p-0.5 rounded-lg border border-fancode-border">
          {speeds.map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={`px-2 py-0.5 text-xs font-semibold rounded transition-colors ${
                speed === s
                  ? 'bg-fancode-orange text-white'
                  : 'text-fancode-muted hover:text-white'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>

        {/* Clock */}
        <div className="font-mono-numbers text-xs font-bold text-fancode-muted bg-fancode-card px-2.5 py-1 rounded-lg border border-fancode-border flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          {timeFormatted}
        </div>
      </div>

      {/* Right Controls: Filtered View CTA, Demo Mode, Settings */}
      <div className="flex items-center gap-2">
        {/* Restraint Proof: Filtered View button */}
        <button
          onClick={() => setFilteredDrawerOpen(true)}
          title="View suppressed events (Proof of restraint)"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-fancode-card hover:bg-fancode-hover border border-fancode-border text-xs font-medium text-fancode-text transition-colors"
        >
          <Filter className="w-3.5 h-3.5 text-fancode-orange" />
          <span className="hidden sm:inline">Suppressed:</span>
          <span className="font-mono-numbers font-bold text-white">
            {totalEvaluated} ev / {totalAlerts} al
          </span>
        </button>

        {/* Start Guided Demo button */}
        <button
          onClick={startGuidedDemo}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            isGuidedDemoActive
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
              : 'bg-gradient-to-r from-fancode-orange to-amber-500 text-white shadow-md shadow-fancode-orange/20 hover:brightness-110 active:scale-95'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Guided Demo</span>
        </button>

        {/* Settings button */}
        <button
          onClick={() => setSettingsDrawerOpen(true)}
          title="Settings & Thresholds"
          className="p-2 text-fancode-muted hover:text-white bg-fancode-card hover:bg-fancode-hover rounded-lg border border-fancode-border transition-colors"
        >
          <Sliders className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
