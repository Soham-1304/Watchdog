import { useState, useRef, useEffect } from 'react';
import { ArrowRight, X, Sparkles, Pin, BookOpen, Hand } from 'lucide-react';
import { useReplayStore } from '../store/useReplayStore';

export function AlertCard() {
  const activeAlert = useReplayStore((s) => s.activeAlert);
  const settings = useReplayStore((s) => s.settings);
  const dismissAlert = useReplayStore((s) => s.dismissAlert);
  const switchMatch = useReplayStore((s) => s.switchMatch);

  const [isHovered, setIsHovered] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const holdStartTimeRef = useRef<number | null>(null);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (holdTimerRef.current) clearInterval(holdTimerRef.current);
    };
  }, []);

  // Reset hold when activeAlert changes
  useEffect(() => {
    setHoldProgress(0);
    if (holdTimerRef.current) clearInterval(holdTimerRef.current);
  }, [activeAlert?.event?.id]);

  if (!activeAlert) return null;

  const handleSwitch = () => {
    switchMatch(activeAlert.event.match_id);
    dismissAlert();
  };

  // Hold gesture handler (1000ms duration)
  const startHold = () => {
    holdStartTimeRef.current = Date.now();
    holdTimerRef.current = setInterval(() => {
      if (!holdStartTimeRef.current) return;
      const elapsed = Date.now() - holdStartTimeRef.current;
      const progress = Math.min(100, (elapsed / 1000) * 100);
      setHoldProgress(progress);

      if (progress >= 100) {
        if (holdTimerRef.current) clearInterval(holdTimerRef.current);
        handleSwitch();
      }
    }, 16);
  };

  const endHold = () => {
    if (holdTimerRef.current) {
      clearInterval(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    holdStartTimeRef.current = null;
    setHoldProgress(0);
  };

  const sport = activeAlert.event.sport;
  const getSportAccent = () => {
    switch (sport) {
      case 'tennis':
        return {
          glow: 'from-lime-500/20 to-emerald-500/10',
          border: 'border-lime-400/60 ring-lime-400/30',
          chip: 'bg-lime-500/15 text-lime-300 border-lime-400/40',
          progress: 'bg-lime-400',
        };
      case 'f1':
        return {
          glow: 'from-red-600/25 to-amber-500/10',
          border: 'border-red-500/60 ring-red-500/30',
          chip: 'bg-red-500/15 text-red-300 border-red-500/40',
          progress: 'bg-red-500',
        };
      case 'cricket':
      default:
        return {
          glow: 'from-broadcast-orange/25 to-amber-500/10',
          border: 'border-broadcast-orange/60 ring-broadcast-orange/30',
          chip: 'bg-broadcast-orange/15 text-broadcast-orange border-broadcast-orange/40',
          progress: 'bg-broadcast-orange',
        };
    }
  };

  const accent = getSportAccent();

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        endHold();
      }}
      className="fixed bottom-6 right-4 sm:right-6 z-50 max-w-md w-[calc(100vw-2rem)] sm:w-[420px] animate-slide-in-right"
    >
      <div
        className={`broadcast-glass-translucent border ${accent.border} rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-2xl relative overflow-hidden ring-1`}
      >
        {/* Glow corner ambient light */}
        <div
          className={`absolute top-0 right-0 w-36 h-36 bg-gradient-to-br ${accent.glow} rounded-full blur-3xl -mr-12 -mt-12 pointer-events-none`}
        ></div>

        {/* Top bar of Alert Card */}
        <div className="flex items-center justify-between gap-2.5 mb-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${accent.chip}`}
            >
              {activeAlert.event.sport}
            </span>

            {/* Importance Chip */}
            <div className="px-2.5 py-0.5 rounded-full font-black text-xs font-mono-numbers bg-gradient-to-r from-broadcast-orange to-amber-500 text-white shadow-md flex items-center gap-1">
              <span>{activeAlert.effectiveScore}/10</span>
              <span className="text-[9px] tracking-wider uppercase">PIVOTAL</span>
            </div>

            {/* Pinned boost indicator */}
            {activeAlert.isPinnedBoost && (
              <span className="text-[9px] font-bold text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-0.5">
                <Pin className="w-2.5 h-2.5 fill-current" />
                PIN BOOST (+2)
              </span>
            )}
          </div>

          <button
            onClick={dismissAlert}
            className="text-broadcast-subtle hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            title="Dismiss alert"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Alert Headline */}
        <h4 className="text-sm sm:text-base font-extrabold text-white leading-snug tracking-tight mb-2">
          {activeAlert.alert}
        </h4>

        {/* Contextual "Why" */}
        <div className="bg-[#090A0C]/80 rounded-xl p-3 border border-white/10 mb-3 shadow-inner">
          <div className="flex items-start gap-2">
            <Sparkles className="w-3.5 h-3.5 text-broadcast-orange shrink-0 mt-0.5" />
            <p className="text-xs text-zinc-300 leading-relaxed font-medium">
              <span className="font-bold text-white">Why it matters: </span>
              {activeAlert.why}
            </p>
          </div>

          {/* Novice explainer if enabled */}
          {settings.novice && activeAlert.novice_note && (
            <div className="mt-2 pt-2 border-t border-white/10 flex items-start gap-1.5 text-[11px] text-amber-200/95 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
              <BookOpen className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              <span>
                <strong className="text-amber-300 font-bold">Rule Explainer: </strong>
                {activeAlert.novice_note}
              </span>
            </div>
          )}
        </div>

        {/* Action Controls: Mobile HOLD gesture + Desktop Tap */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <button
            onClick={dismissAlert}
            className="px-3 py-1.5 text-xs font-bold text-broadcast-muted hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          >
            Stay Here
          </button>

          {/* Mobile & Desktop Hold-to-Switch Button */}
          <div className="relative select-none">
            <button
              onMouseDown={startHold}
              onMouseUp={endHold}
              onTouchStart={startHold}
              onTouchEnd={endHold}
              onTouchCancel={endHold}
              onClick={() => {
                // Allow instant tap on desktop if not holding
                if (holdProgress < 10) handleSwitch();
              }}
              className="relative overflow-hidden flex items-center gap-2 px-3.5 sm:px-4 py-2 bg-gradient-to-r from-broadcast-orange to-broadcast-orangeHover hover:brightness-110 text-white rounded-xl text-xs font-black transition-all shadow-lg shadow-broadcast-orange/30 active:scale-95"
            >
              {/* Radial or linear hold fill */}
              {holdProgress > 0 && (
                <div
                  className="absolute inset-0 bg-white/30 transition-all pointer-events-none"
                  style={{ width: `${holdProgress}%` }}
                ></div>
              )}

              <Hand className="w-3.5 h-3.5 sm:hidden animate-pulse" />
              <span className="relative z-10 hidden sm:inline">
                {holdProgress > 0 ? `Switching ${Math.round(holdProgress)}%...` : 'Switch to Stream'}
              </span>
              <span className="relative z-10 sm:hidden">
                {holdProgress > 0 ? `Holding ${Math.round(holdProgress)}%...` : 'HOLD 1s TO SWITCH'}
              </span>
              <ArrowRight className="w-3.5 h-3.5 relative z-10" />
            </button>
          </div>
        </div>

        {/* 7-Second Auto-dismiss progress bar (pauses if hovered) */}
        {!isHovered && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 overflow-hidden">
            <div className={`h-full ${accent.progress} animate-shrink-width origin-left`}></div>
          </div>
        )}
      </div>
    </div>
  );
}
