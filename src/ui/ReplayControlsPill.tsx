import { useState } from 'react';
import { Play, Pause, RotateCcw, Sliders, X } from 'lucide-react';
import { useReplayStore } from '../store/useReplayStore';

export function ReplayControlsPill() {
  const [isOpen, setIsOpen] = useState(false);
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
    <div className="fixed bottom-4 left-4 z-40 select-none">
      {!isOpen ? (
        /* Discreet, clean floating icon button that doesn't hinder UI */
        <button
          onClick={() => setIsOpen(true)}
          className="w-8 h-8 rounded-full bg-slate-900/80 hover:bg-slate-900 dark:bg-white/10 dark:hover:bg-white/20 text-white backdrop-blur-md border border-slate-700 dark:border-white/10 shadow-lg flex items-center justify-center transition-all hover:scale-105 active:scale-95"
          title="Replay Simulation Speed & Clock"
        >
          <Sliders className="w-3.5 h-3.5 text-broadcast-orange" />
        </button>
      ) : (
        /* Popover panel that opens on click */
        <div className="bg-slate-900/95 dark:bg-[#111317]/95 backdrop-blur-xl border border-slate-700 dark:border-white/10 rounded-2xl shadow-2xl p-2.5 transition-all text-xs flex items-center gap-2.5 animate-slide-in-right">
          <button
            onClick={togglePlay}
            className="w-7 h-7 rounded-lg bg-broadcast-orange text-white flex items-center justify-center transition-transform active:scale-95 shadow-md shadow-broadcast-orange/30"
            title="Toggle simulation"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
          </button>

          <span className="font-mono-numbers text-xs font-bold text-white">
            {formattedTime}
          </span>

          <div className="flex items-center bg-white/10 dark:bg-white/5 rounded-lg p-0.5">
            {speeds.map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-mono-numbers transition-colors ${
                  speed === s ? 'bg-broadcast-orange text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>

          <button
            onClick={restart}
            className="p-1 text-zinc-400 hover:text-white transition-colors"
            title="Restart simulation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <div className="w-px h-4 bg-white/10"></div>

          <input
            type="range"
            min={0}
            max={maxTime || 360}
            value={currentTime}
            onChange={(e) => seek(Number(e.target.value))}
            className="w-20 accent-broadcast-orange bg-white/10 rounded h-1 cursor-pointer"
          />

          <button
            onClick={() => setIsOpen(false)}
            className="text-zinc-400 hover:text-white p-1 rounded-lg transition-colors ml-1"
            title="Close"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
