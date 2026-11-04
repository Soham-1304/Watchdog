import { useEffect } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Flame } from 'lucide-react';
import { useReplayStore } from '../store/useReplayStore';

export function AlertCard() {
  const activeAlert = useReplayStore((s) => s.activeAlert);
  const activeCatchUp = useReplayStore((s) => s.activeCatchUp);
  const activeMatchId = useReplayStore((s) => s.activeMatchId);
  const settings = useReplayStore((s) => s.settings);
  const matches = useReplayStore((s) => s.matches);
  const dismissAlert = useReplayStore((s) => s.dismissAlert);
  const switchMatch = useReplayStore((s) => s.switchMatch);
  const setCurrentPage = useReplayStore((s) => s.setCurrentPage);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!activeAlert) return;
    const timeout = window.setTimeout(dismissAlert, 7000);
    return () => window.clearTimeout(timeout);
  }, [activeAlert?.event.id, dismissAlert]);

  const target = activeAlert && matches.find((match) => match.id === activeAlert.event.match_id);
  const isOtherStream = activeAlert?.event.match_id !== activeMatchId;
  const headline = activeAlert && (settings.narrativeAgentEnabled ? activeAlert.alert : activeAlert.event.headline);
  const showToast = Boolean(activeAlert && target && isOtherStream && !activeCatchUp);

  const handleSwitch = () => {
    if (!activeAlert) return;
    switchMatch(activeAlert.event.match_id);
    setCurrentPage('match');
    dismissAlert();
  };

  return (
    <AnimatePresence>
      {showToast && activeAlert && headline && (
        <motion.aside
          key={activeAlert.event.id}
          data-tour="stream-switch-cue"
          role="status"
          aria-label="QuickWatch match update"
          aria-live="polite"
          initial={reduceMotion ? { opacity: 0 } : { x: 16, y: 18, opacity: 0 }}
          animate={{ x: 0, y: 0, opacity: 1 }}
          exit={reduceMotion ? { opacity: 0 } : { x: 12, y: 12, opacity: 0 }}
          transition={{ duration: reduceMotion ? 0.12 : 0.24, ease: [0.2, 0.8, 0.2, 1] }}
          className="absolute bottom-4 right-4 z-50 w-[min(440px,calc(100%-2rem))]"
        >
          <div className="flex items-center gap-2.5 rounded-2xl border border-white/[0.12] bg-[#0b0f14]/78 px-3 py-3 text-white shadow-[0_14px_42px_rgba(0,0,0,.36)] backdrop-blur-2xl sm:gap-3 sm:px-3.5">
            <span className="inline-flex h-8 shrink-0 items-center gap-1 rounded-full border border-orange-300/20 bg-gradient-to-br from-orange-300/15 to-red-500/[0.06] px-2 text-xs font-extrabold text-orange-100" aria-label={`Hotness ${activeAlert.effectiveScore}`}>
              <Flame aria-hidden="true" size={13} className="text-orange-300" />{activeAlert.effectiveScore}
            </span>
            <p className="min-w-0 flex-1 line-clamp-2 text-[12px] font-semibold leading-[1.35] text-white/95 sm:text-[13px]">{headline}</p>
            <button
              type="button"
              onClick={handleSwitch}
              aria-label={`Switch to ${target?.title ?? 'this match'}`}
              className="inline-flex h-9 shrink-0 items-center gap-1 rounded-xl border border-orange-300/20 bg-orange-300/[0.08] px-3 text-[11px] font-extrabold text-orange-200 transition-colors hover:bg-orange-300/[0.14] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300/80 motion-reduce:transition-none"
            >
              Switch <ArrowRight aria-hidden="true" size={13} />
            </button>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
