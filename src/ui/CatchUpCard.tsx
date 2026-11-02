import { History, X, Check } from 'lucide-react';
import { useReplayStore } from '../store/useReplayStore';

export function CatchUpCard() {
  const activeCatchUp = useReplayStore((s) => s.activeCatchUp);
  const dismissCatchUp = useReplayStore((s) => s.dismissCatchUp);

  if (!activeCatchUp) return null;

  return (
    <div className="bg-gradient-to-r from-blue-950/70 via-indigo-950/70 to-fancode-card border border-blue-500/40 rounded-xl p-4 shadow-xl backdrop-blur-md mb-4 relative animate-fadeIn">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30 shrink-0 mt-0.5">
            <History className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                Catch-Up Summary
              </span>
              <span className="text-[10px] bg-blue-500/10 text-blue-300 px-1.5 py-0.2 rounded border border-blue-500/20">
                While you were away
              </span>
            </div>
            <p className="text-sm font-semibold text-white leading-relaxed">
              {activeCatchUp.summary}
            </p>
            <div className="mt-2 text-xs font-mono-numbers text-blue-200/90 bg-blue-950/50 px-2.5 py-1 rounded border border-blue-800/40 inline-block">
              Current: {activeCatchUp.currentStateLine}
            </div>
          </div>
        </div>

        <button
          onClick={dismissCatchUp}
          className="text-fancode-subtle hover:text-white p-1 rounded-lg hover:bg-fancode-card transition-colors shrink-0"
          title="Dismiss Catch-Up"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex justify-end mt-2">
        <button
          onClick={dismissCatchUp}
          className="flex items-center gap-1 px-3 py-1 bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 rounded-lg text-xs font-medium border border-blue-500/30 transition-colors"
        >
          <Check className="w-3.5 h-3.5" />
          <span>Understood</span>
        </button>
      </div>
    </div>
  );
}
