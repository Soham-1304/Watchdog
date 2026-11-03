import { useState } from 'react';
import { ArrowRight, X, Sparkles, Pin, BookOpen } from 'lucide-react';
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
    if (score >= 9) return 'from-red-600 via-broadcast-orange to-broadcast-amber text-white shadow-red-600/30';
    if (score >= 7) return 'from-broadcast-orange to-broadcast-amber text-white shadow-broadcast-orange/30';
    return 'from-zinc-700 to-zinc-600 text-zinc-200';
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="fixed bottom-6 right-6 z-50 max-w-md w-[calc(100vw-3rem)] animate-slide-in-right"
    >
      <div className="broadcast-glass border border-broadcast-orange/80 rounded-3xl p-5 sm:p-6 shadow-2xl shadow-broadcast-orange/25 relative overflow-hidden ring-1 ring-broadcast-orange/40">
        {/* Glow corner ambient light */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-broadcast-orange/20 rounded-full blur-3xl -mr-12 -mt-12 pointer-events-none"></div>

        {/* Top bar of Alert Card */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-black uppercase tracking-widest text-broadcast-orange bg-broadcast-orange/15 px-2.5 py-0.5 rounded-md border border-broadcast-orange/30">
              {activeAlert.event.sport}
            </span>

            {/* Importance Chip */}
            <div
              className={`px-3 py-0.5 rounded-full font-black text-xs font-mono-numbers bg-gradient-to-r ${getScoreColor(
                activeAlert.effectiveScore
              )} shadow-md flex items-center gap-1.5`}
            >
              <span>{activeAlert.effectiveScore}/10</span>
              <span className="text-[10px] tracking-wider uppercase">PIVOTAL</span>
            </div>

            {/* Pinned boost indicator */}
            {activeAlert.isPinnedBoost && (
              <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1">
                <Pin className="w-2.5 h-2.5 fill-current" />
                PIN BOOST (+2)
              </span>
            )}
          </div>

          <button
            onClick={dismissAlert}
            className="text-broadcast-subtle hover:text-white p-1 rounded-lg hover:bg-broadcast-card transition-colors"
            title="Dismiss alert (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Alert Headline */}
        <h4 className="text-base sm:text-lg font-black text-white leading-snug tracking-tight mb-2.5">
          {activeAlert.alert}
        </h4>

        {/* Contextual "Why" */}
        <div className="bg-broadcast-canvas/80 rounded-2xl p-3.5 border border-broadcast-border/80 mb-3.5 shadow-inner">
          <div className="flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-broadcast-orange shrink-0 mt-0.5" />
            <p className="text-xs text-zinc-300 leading-relaxed font-medium">
              <span className="font-extrabold text-white">Why it matters: </span>
              {activeAlert.why}
            </p>
          </div>

          {/* Novice explainer if enabled */}
          {settings.novice && activeAlert.novice_note && (
            <div className="mt-2.5 pt-2.5 border-t border-broadcast-border/60 flex items-start gap-2 text-[11px] text-amber-200/90 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/25">
              <BookOpen className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                <strong className="text-amber-300 font-bold">Rule Explainer: </strong>
                {activeAlert.novice_note}
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-1">
          <button
            onClick={dismissAlert}
            className="px-3.5 py-2 text-xs font-bold text-broadcast-muted hover:text-white rounded-xl hover:bg-broadcast-card transition-colors"
          >
            Stay Here
          </button>

          <button
            onClick={handleSwitch}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-broadcast-orange to-broadcast-orangeHover hover:brightness-110 text-white rounded-xl text-xs font-black transition-all shadow-lg shadow-broadcast-orange/30 active:scale-95"
          >
            <span>Switch to Stream</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Auto-dismiss progress bar (pauses if hovered) */}
        {!isHovered && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-broadcast-card overflow-hidden">
            <div className="h-full bg-broadcast-orange animate-shrink-width origin-left"></div>
          </div>
        )}
      </div>
    </div>
  );
}
