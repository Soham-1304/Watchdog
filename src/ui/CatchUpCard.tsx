import { useEffect } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { History, X } from 'lucide-react';
import { useReplayStore } from '../store/useReplayStore';

export function CatchUpCard() {
  const activeCatchUp = useReplayStore((s) => s.activeCatchUp);
  const dismissCatchUp = useReplayStore((s) => s.dismissCatchUp);
  const matches = useReplayStore((s) => s.matches);
  const reduceMotion = useReducedMotion();
  const summary = activeCatchUp?.summary
    .replace(/^Since you left \([^)]*\),\s*/i, '')
    .replace(/^You were away for [^.]+\. No major incidents or score changes occurred during this window\.?$/i, 'No major incidents; score unchanged.');

  useEffect(() => {
    if (!activeCatchUp) return;
    const timeout = window.setTimeout(dismissCatchUp, 5500);
    return () => window.clearTimeout(timeout);
  }, [activeCatchUp?.match_id, activeCatchUp?.to_t, dismissCatchUp]);

  const match = activeCatchUp && matches.find((item) => item.id === activeCatchUp.match_id);

  return (
    <AnimatePresence>
      {activeCatchUp && (
        <motion.aside
          key={`${activeCatchUp.match_id}-${activeCatchUp.to_t}`}
          role="group"
          aria-label="Catch-up summary"
          aria-live="polite"
          initial={reduceMotion ? { opacity: 0 } : { y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={reduceMotion ? { opacity: 0 } : { y: 8, opacity: 0 }}
          transition={{ duration: reduceMotion ? 0.12 : 0.2, ease: 'easeOut' }}
          className="absolute bottom-4 left-4 right-4 z-40 mx-auto max-w-[500px]"
        >
          <div className="flex max-h-[68px] items-center gap-2.5 overflow-hidden rounded-2xl border border-white/[0.14] bg-[#0b1118]/75 px-3 py-2.5 text-white shadow-[0_12px_36px_rgba(0,0,0,0.36)] backdrop-blur-2xl sm:px-4">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-sky-200/[0.12] text-sky-100/90">
              <History aria-hidden="true" size={15} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="line-clamp-1 text-[11px] font-bold leading-4 text-white/95" title={match?.title}>
                {summary}
              </p>
              <p className="mt-0.5 truncate text-[10px] font-medium leading-4 text-white/60 font-mono-numbers">
                {activeCatchUp.currentStateLine}
              </p>
            </div>
            <button
              type="button"
              onClick={dismissCatchUp}
              aria-label="Dismiss catch-up summary"
              className="-mr-1 shrink-0 rounded-lg p-1.5 text-white/50 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 motion-reduce:transition-none"
            >
              <X aria-hidden="true" size={14} />
            </button>
          </div>
          <span className="sr-only">Catch-up summary for {match?.title ?? 'the selected match'}</span>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
