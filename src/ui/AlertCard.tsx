import { useState } from 'react';
import { ArrowRight, X, Sparkles, Pin, HelpCircle } from 'lucide-react';
import { useReplayStore } from '../store/useReplayStore';

export function AlertCard() {
  const activeAlert = useReplayStore((s) => s.activeAlert);
  const settings = useReplayStore((s) => s.settings);
  const dismissAlert = useReplayStore((s) => s.dismissAlert);
  const switchMatch = useReplayStore((s) => s.switchMatch);

  const [isHovered, setIsHovered] = useState(false);

  if (!activeAlert) return null;

  const handleSwitch = () => {
    switchMatch(activeAlert.event.match_id);
    dismissAlert();
  };

  const getScoreColor = (score: number) => {
    if (score >= 9) return 'from-red-600 to-fancode-orange text-white';
    if (score >= 7) return 'from-fancode-orange to-amber-500 text-white';
    return 'from-zinc-700 to-zinc-600 text-zinc-200';
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="fixed bottom-6 right-6 z-50 max-w-md w-[calc(100vw-3rem)] animate-slide-in-right"
    >
      <div className="bg-fancode-surface/95 backdrop-blur-xl border border-fancode-orange/80 rounded-2xl p-5 shadow-2xl shadow-fancode-orange/20 relative overflow-hidden ring-1 ring-fancode-orange/50">
        {/* Glow corner */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-fancode-orange/15 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>

        {/* Top bar of Alert Card */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-fancode-orange bg-fancode-orange/15 px-2 py-0.5 rounded border border-fancode-orange/30">
              {activeAlert.event.sport}
            </span>

            {/* Importance Chip */}
            <div
              className={`px-2.5 py-0.5 rounded-full font-black text-xs font-mono-numbers bg-gradient-to-r ${getScoreColor(
                activeAlert.effectiveScore
              )} shadow-sm`}
            >
              {activeAlert.effectiveScore}/10 PIVOTAL
            </div>

            {/* Pinned boost indicator */}
            {activeAlert.isPinnedBoost && (
              <span className="text-[10px] font-semibold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1">
                <Pin className="w-2.5 h-2.5 fill-current" />
                PIN BOOST (+2)
              </span>
            )}
          </div>

          <button
            onClick={dismissAlert}
            className="text-fancode-subtle hover:text-white p-1 rounded-lg hover:bg-fancode-card transition-colors"
            title="Dismiss alert (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Alert Headline */}
        <h4 className="text-base font-extrabold text-white leading-snug tracking-tight mb-2">
          {activeAlert.alert}
        </h4>

        {/* Contextual "Why" */}
        <div className="bg-fancode-card/80 rounded-xl p-3 border border-fancode-border/70 mb-3">
          <div className="flex items-start gap-2">
            <Sparkles className="w-3.5 h-3.5 text-fancode-orange shrink-0 mt-0.5" />
            <p className="text-xs text-fancode-muted leading-relaxed">
              <span className="font-semibold text-zinc-300">Why it matters: </span>
              {activeAlert.why}
            </p>
          </div>

          {/* Novice explainer if enabled */}
          {settings.novice && activeAlert.novice_note && (
            <div className="mt-2 pt-2 border-t border-fancode-border/50 flex items-start gap-2 text-[11px] text-amber-200/90 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
              <HelpCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              <span>
                <strong className="text-amber-300">Rule Explainer: </strong>
                {activeAlert.novice_note}
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            onClick={dismissAlert}
            className="px-3 py-1.5 text-xs font-semibold text-fancode-muted hover:text-white rounded-lg transition-colors"
          >
            Stay Here
          </button>

          <button
            onClick={handleSwitch}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-fancode-orange to-fancode-orangeLight hover:brightness-110 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-fancode-orange/30 active:scale-95"
          >
            <span>Switch to Stream</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Auto-dismiss progress bar (pauses if hovered) */}
        {!isHovered && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-fancode-card overflow-hidden">
            <div className="h-full bg-fancode-orange animate-[shrink_9s_linear_forwards] origin-left"></div>
          </div>
        )}
      </div>
    </div>
  );
}
