import { useState, useRef, useEffect } from 'react';
import { ArrowRight, X, Pin, Hand } from 'lucide-react';
import { useReplayStore } from '../store/useReplayStore';

export function AlertCard() {
  const activeAlert = useReplayStore((s) => s.activeAlert);
  const settings = useReplayStore((s) => s.settings);
  const dismissAlert = useReplayStore((s) => s.dismissAlert);
  const switchMatch = useReplayStore((s) => s.switchMatch);
  const setCurrentPage = useReplayStore((s) => s.setCurrentPage);

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
    setCurrentPage('match');
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
          border: 'border-lime-400/50',
          chip: 'bg-lime-500/15 text-lime-300 border-lime-400/30',
          progress: 'bg-lime-400',
        };
      case 'f1':
        return {
          glow: 'from-red-600/20 to-amber-500/10',
          border: 'border-red-500/50',
          chip: 'bg-red-500/15 text-red-300 border-red-500/30',
          progress: 'bg-red-500',
        };
      case 'cricket':
      default:
        return {
          glow: 'from-broadcast-orange/20 to-amber-500/10',
          border: 'border-broadcast-orange/50',
          chip: 'bg-broadcast-orange/15 text-broadcast-orange border-broadcast-orange/30',
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
      className="fixed bottom-4 right-4 sm:bottom-5 sm:right-5 z-50 w-[calc(100vw-2rem)] sm:w-[310px] animate-slide-in-right select-none"
    >
      <div
        className={`bg-[#090b14]/85 backdrop-blur-xl border ${accent.border} rounded-2xl p-3 sm:p-3.5 shadow-2xl relative overflow-hidden ring-1 ring-white/10`}
      >
        {/* Glow corner ambient light */}
        <div
          className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${accent.glow} rounded-full blur-2xl -mr-6 -mt-6 pointer-events-none`}
        ></div>

        {/* Top Header of Alert Card */}
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border ${accent.chip}`}
            >
              {activeAlert.event.sport}
            </span>

            {/* Importance Chip */}
            <span className="px-1.5 py-0.5 rounded-full font-black text-[10px] font-mono-numbers bg-broadcast-orange/20 text-broadcast-orange border border-broadcast-orange/30">
              {activeAlert.effectiveScore}/10
            </span>

            {/* Pinned boost indicator */}
            {activeAlert.isPinnedBoost && (
              <span className="text-[9px] font-bold text-amber-300 flex items-center gap-0.5">
                <Pin className="w-2.5 h-2.5 fill-current" />
                +2
              </span>
            )}
          </div>

          <button
            onClick={dismissAlert}
            className="text-zinc-500 hover:text-white p-0.5 rounded hover:bg-white/10 transition-colors"
            title="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Alert Headline */}
        <h4 className="text-xs sm:text-[13px] font-extrabold text-white leading-tight tracking-tight mb-1">
          {activeAlert.alert}
        </h4>

        {/* Tactical Context */}
        <p className="text-[11px] text-zinc-300 leading-snug font-medium mb-2 line-clamp-2">
          {activeAlert.why}
        </p>

        {/* Novice explainer if enabled */}
        {settings.novice && activeAlert.novice_note && (
          <div className="mb-2 p-1.5 rounded-lg bg-black/40 border border-white/5 text-[10px] text-amber-300 flex items-start gap-1">
            <span className="font-bold text-amber-400 uppercase text-[9px] shrink-0">Rule:</span>
            <span className="line-clamp-2">{activeAlert.novice_note}</span>
          </div>
        )}

        {/* Action Controls: Hold-to-switch & Dismiss */}
        <div className="flex items-center justify-between gap-2 pt-0.5">
          <button
            onClick={dismissAlert}
            className="text-[10px] font-bold text-zinc-400 hover:text-white px-2 py-1 rounded hover:bg-white/5 transition-colors"
          >
            Stay
          </button>

          {/* Hold-to-Switch Button */}
          <button
            onMouseDown={startHold}
            onMouseUp={endHold}
            onTouchStart={startHold}
            onTouchEnd={endHold}
            onTouchCancel={endHold}
            onClick={() => {
              if (holdProgress < 10) handleSwitch();
            }}
            className="relative overflow-hidden flex items-center gap-1.5 px-3 py-1.5 bg-broadcast-orange hover:bg-broadcast-orangeHover text-white rounded-xl text-[11px] font-black transition-all shadow-md shadow-broadcast-orange/30 active:scale-95"
          >
            {/* Animated hold progress bar */}
            {holdProgress > 0 && (
              <div
                className="absolute inset-0 bg-white/30 transition-all pointer-events-none"
                style={{ width: `${holdProgress}%` }}
              ></div>
            )}

            <Hand className="w-3 h-3 sm:hidden" />
            <span className="relative z-10">
              {holdProgress > 0 ? `Holding ${Math.round(holdProgress)}%...` : 'HOLD TO SWITCH'}
            </span>
            <ArrowRight className="w-3 h-3 relative z-10" />
          </button>
        </div>

        {/* 7-Second Auto-dismiss thin progress line */}
        {!isHovered && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10 overflow-hidden">
            <div className={`h-full ${accent.progress} animate-shrink-width origin-left`}></div>
          </div>
        )}
      </div>
    </div>
  );
}
