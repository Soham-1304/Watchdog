import { useState, useRef, useEffect } from 'react';
import { ArrowRight, X, Pin, Hand } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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

  useEffect(() => {
    return () => {
      if (holdTimerRef.current) clearInterval(holdTimerRef.current);
    };
  }, []);

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

  const startHold = () => {
    holdStartTimeRef.current = Date.now();
    holdTimerRef.current = setInterval(() => {
      if (!holdStartTimeRef.current) return;
      const elapsed = Date.now() - holdStartTimeRef.current;
      const progress = Math.min(100, (elapsed / 900) * 100);
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

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 50, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 40, opacity: 0, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          endHold();
        }}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[320px] select-none"
      >
        <div className="bg-white/95 dark:bg-[#0c0e14]/95 backdrop-blur-xl border border-slate-200 dark:border-white/15 rounded-2xl p-3.5 shadow-2xl relative overflow-hidden ring-1 ring-black/5 dark:ring-white/10">
          {/* Top Bar: Badges + Dismiss */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-white/10">
                {sport}
              </span>

              <span className="px-2 py-0.5 rounded-md font-black text-[10px] font-mono-numbers bg-broadcast-orange/15 text-broadcast-orange border border-broadcast-orange/30">
                {activeAlert.effectiveScore}/10
              </span>

              {activeAlert.isPinnedBoost && (
                <span className="text-[10px] font-bold text-amber-500 flex items-center gap-0.5">
                  <Pin className="w-2.5 h-2.5 fill-current" />
                  +2
                </span>
              )}
            </div>

            <button
              onClick={dismissAlert}
              className="text-slate-400 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
              title="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Headline */}
          <h4 className="text-xs sm:text-[13px] font-black text-slate-900 dark:text-white leading-snug tracking-tight mb-1">
            {activeAlert.alert}
          </h4>

          {/* Tactical Context */}
          <p className="text-[11px] text-slate-600 dark:text-zinc-300 leading-snug font-medium mb-2.5 line-clamp-2">
            {activeAlert.why}
          </p>

          {/* Optional Novice Explainer */}
          {settings.novice && activeAlert.novice_note && (
            <div className="mb-2.5 p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-700 dark:text-amber-300 flex items-start gap-1.5">
              <span className="font-bold uppercase text-[9px] shrink-0 text-amber-600 dark:text-amber-400">Rule:</span>
              <span className="line-clamp-2">{activeAlert.novice_note}</span>
            </div>
          )}

          {/* Actions: Stay + Hold-to-Switch */}
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-white/10">
            <button
              onClick={dismissAlert}
              className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
            >
              Stay
            </button>

            <button
              onMouseDown={startHold}
              onMouseUp={endHold}
              onTouchStart={startHold}
              onTouchEnd={endHold}
              onTouchCancel={endHold}
              onClick={() => {
                if (holdProgress < 10) handleSwitch();
              }}
              className="relative overflow-hidden flex items-center gap-1.5 px-3.5 py-1.5 bg-broadcast-orange hover:bg-broadcast-orangeHover text-white rounded-xl text-xs font-black transition-all shadow-md shadow-broadcast-orange/30 active:scale-95"
            >
              {/* Hold fill progress indicator */}
              {holdProgress > 0 && (
                <div
                  className="absolute inset-0 bg-white/35 transition-all pointer-events-none"
                  style={{ width: `${holdProgress}%` }}
                />
              )}

              <Hand className="w-3 h-3 sm:hidden" />
              <span className="relative z-10">
                {holdProgress > 0 ? `Holding ${Math.round(holdProgress)}%...` : 'HOLD TO SWITCH'}
              </span>
              <ArrowRight className="w-3.5 h-3.5 relative z-10" />
            </button>
          </div>

          {/* 7-Second Auto Dismiss Indicator Bar */}
          {!isHovered && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100 dark:bg-white/10 overflow-hidden">
              <div className="h-full bg-broadcast-orange animate-shrink-width origin-left" />
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
