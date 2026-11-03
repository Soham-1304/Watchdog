import { useState } from 'react';
import { Play, Pause, RotateCcw, ChevronUp, ChevronDown, Sliders } from 'lucide-react';
import { useReplayStore } from '../store/useReplayStore';

export function ReplayControlsPill() {
  const [isExpanded, setIsExpanded] = useState(false);
  const isPlaying = useReplayStore((s) => s.isPlaying);
  const togglePlay = useReplayStore((s) => s.togglePlay);
  const speed = useReplayStore((s) => s.speed);
  const setSpeed = useReplayStore((s) => s.setSpeed);
  const currentTime = useReplayStore((s) => s.currentTime);
  const seek = useReplayStore((s) => s.seek);
  const maxTime = useReplayStore((s) => s.maxTime);
  const restart = useReplayStore((s) => s.restart);

  const mins = Math.floor(currentTime / 60);
  const secs = Math.floor(currentTime % 60);
  const formattedTime = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  const speeds: (1 | 5 | 10 | 20)[] = [1, 5, 10, 20];

  return (
    <aside aria-label="Replay simulation controller" className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 select-none">
      <div className="bg-[#111317]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-2 transition-all ring-1 ring-white/5">
        {/* Compact Collapsed Pill */}
        <div className="flex items-center gap-2.5 px-2">
          {/* Play/Pause */}
          <button
            onClick={togglePlay}
            className="w-7 h-7 rounded-lg bg-broadcast-orange hover:brightness-110 text-white flex items-center justify-center transition-all shadow-md shadow-broadcast-orange/30"
            title="Toggle playback (Space)"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
          </button>

          {/* Time Badge */}
          <span className="font-mono-numbers text-xs font-bold text-white px-2 py-0.5 rounded bg-white/5">
            {formattedTime}
          </span>

          {/* Speed Selector */}
          <div className="flex items-center bg-white/5 rounded-lg p-0.5">
            {speeds.map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-mono-numbers transition-all ${
                  speed === s ? 'bg-broadcast-orange text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>

          {/* Restart */}
          <button
            onClick={restart}
            className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
            title="Restart replay from T=0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Expand/Collapse Timeline Scrubber */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors flex items-center gap-0.5 text-[11px]"
            title="Toggle timeline scrubber"
          >
            <Sliders className="w-3 h-3" />
            {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Expanded Scrubber Drawer */}
        {isExpanded && (
          <div className="mt-2.5 pt-2 border-t border-white/10 px-2 space-y-1.5">
            <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono-numbers">
              <span>00:00</span>
              <span className="text-broadcast-orange font-bold">Interactive Telemetry Timeline</span>
              <span>06:00</span>
            </div>
            <input
              type="range"
              min={0}
              max={maxTime || 360}
              value={currentTime}
              onChange={(e) => seek(Number(e.target.value))}
              className="w-full accent-broadcast-orange bg-white/10 rounded-lg h-1.5 cursor-pointer"
            />
          </div>
        )}
      </div>
    </aside>
  );
}
