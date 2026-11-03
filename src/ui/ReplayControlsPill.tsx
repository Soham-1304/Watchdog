import { useState } from 'react';
import { Play, Pause, RotateCcw, ChevronUp, ChevronDown } from 'lucide-react';
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
    <aside
      aria-label="Replay simulation controller"
      className="fixed bottom-3 left-4 z-40 select-none opacity-50 hover:opacity-100 transition-opacity"
    >
      <div className="bg-[#111317]/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-1.5 transition-all text-xs">
        {/* Compact Discreet Pill */}
        <div className="flex items-center gap-2 px-1">
          {/* Play/Pause */}
          <button
            onClick={togglePlay}
            className="w-6 h-6 rounded-md bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            title="Toggle playback"
          >
            {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 fill-current ml-0.5" />}
          </button>

          {/* Time Badge */}
          <span className="font-mono-numbers text-[11px] font-bold text-zinc-300">
            {formattedTime}
          </span>

          {/* Speed Selector */}
          <div className="flex items-center bg-white/5 rounded p-0.5">
            {speeds.map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`px-1 py-0.5 rounded text-[10px] font-bold font-mono-numbers transition-colors ${
                  speed === s ? 'bg-broadcast-orange text-white' : 'text-zinc-500 hover:text-white'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>

          {/* Restart */}
          <button
            onClick={restart}
            className="p-1 text-zinc-500 hover:text-white rounded hover:bg-white/5 transition-colors"
            title="Restart"
          >
            <RotateCcw className="w-3 h-3" />
          </button>

          {/* Scrubber toggle */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-zinc-500 hover:text-white p-1 rounded hover:bg-white/5 transition-colors"
          >
            {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
          </button>
        </div>

        {/* Expanded Scrubber */}
        {isExpanded && (
          <div className="mt-2 pt-2 border-t border-white/10 px-1 space-y-1 w-64">
            <input
              type="range"
              min={0}
              max={maxTime || 360}
              value={currentTime}
              onChange={(e) => seek(Number(e.target.value))}
              className="w-full accent-broadcast-orange bg-white/10 rounded h-1 cursor-pointer"
            />
          </div>
        )}
      </div>
    </aside>
  );
}
