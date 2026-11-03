import { History, X, Check } from 'lucide-react';
import { useReplayStore } from '../store/useReplayStore';

export function CatchUpCard() {
  const activeCatchUp = useReplayStore((s) => s.activeCatchUp);
  const dismissCatchUp = useReplayStore((s) => s.dismissCatchUp);

  if (!activeCatchUp) return null;

  return (
    <div className="bg-gradient-to-r from-blue-950/80 via-slate-900/90 to-broadcast-card border border-blue-500/40 rounded-2xl p-4 sm:p-5 shadow-2xl backdrop-blur-xl mb-4 relative animate-ticker-slide">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 shrink-0 mt-0.5 shadow-md shadow-blue-500/20">
            <History className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-black text-blue-400 uppercase tracking-widest">
                Catch-Up Brief
              </span>
              <span className="text-[10px] font-bold bg-blue-500/15 text-blue-300 px-2 py-0.5 rounded-md border border-blue-500/25">
                While you were away
              </span>
            </div>
            <p className="text-sm font-bold text-white leading-relaxed">
              {activeCatchUp.summary}
            </p>
            <div className="mt-2.5 text-xs font-mono-numbers text-blue-200 bg-blue-950/70 px-3 py-1.5 rounded-xl border border-blue-700/40 inline-block font-semibold">
              Current Game Equation: {activeCatchUp.currentStateLine}
            </div>
          </div>
        </div>

        <button
          onClick={dismissCatchUp}
          className="text-broadcast-subtle hover:text-white p-1 rounded-lg hover:bg-broadcast-card transition-colors shrink-0"
          title="Dismiss Catch-Up"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex justify-end mt-2">
        <button
          onClick={dismissCatchUp}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 rounded-xl text-xs font-bold border border-blue-500/30 transition-all hover:border-blue-400"
        >
          <Check className="w-3.5 h-3.5" />
          <span>Understood</span>
        </button>
      </div>
    </div>
  );
}
