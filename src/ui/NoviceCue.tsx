import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { BookOpenText } from 'lucide-react';
import { useReplayStore } from '../store/useReplayStore';

export function NoviceCue() {
  const activeMatchId = useReplayStore((s) => s.activeMatchId);
  const events = useReplayStore((s) => s.events);
  const firedEventIds = useReplayStore((s) => s.firedEventIds);
  const eventResults = useReplayStore((s) => s.eventResults);
  const activeCatchUp = useReplayStore((s) => s.activeCatchUp);
  const enabled = useReplayStore((s) => s.settings.novice);
  const reduceMotion = useReducedMotion();
  const [visibleEventId, setVisibleEventId] = useState<string | null>(null);

  const latestMatchEvent = useMemo(() => events
    .filter((event) => event.match_id === activeMatchId && firedEventIds.has(event.id))
    .sort((a, b) => b.t - a.t)[0], [events, firedEventIds, activeMatchId]);
  const explanation = latestMatchEvent ? eventResults[latestMatchEvent.id]?.novice : undefined;

  useEffect(() => {
    if (!latestMatchEvent || !explanation || !enabled || activeCatchUp) {
      setVisibleEventId(null);
      return;
    }
    setVisibleEventId(latestMatchEvent.id);
    const timeout = window.setTimeout(() => setVisibleEventId(null), 5600);
    return () => window.clearTimeout(timeout);
  }, [latestMatchEvent?.id, explanation?.term_detected, enabled, activeCatchUp]);

  const visible = Boolean(explanation && visibleEventId === latestMatchEvent?.id && !activeCatchUp);
  const displayTerm = explanation?.term_detected
    ? explanation.term_detected.charAt(0).toUpperCase() + explanation.term_detected.slice(1)
    : '';

  return (
    <AnimatePresence>
      {visible && explanation && (
        <motion.aside
          key={latestMatchEvent?.id}
          data-tour="stream-explainer-cue"
          role="status"
          aria-live="polite"
          initial={reduceMotion ? { opacity: 0 } : { y: 18, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={reduceMotion ? { opacity: 0 } : { y: 10, opacity: 0 }}
          transition={{ duration: reduceMotion ? 0.12 : 0.26, ease: [0.2, 0.8, 0.2, 1] }}
          className="absolute bottom-4 left-4 z-40 w-[min(390px,calc(100%-2rem))]"
        >
          <div className="flex items-center gap-3 rounded-2xl border border-orange-300/[0.22] bg-[#0b1016]/76 px-3.5 py-3 text-white shadow-[0_0_16px_rgba(255,82,0,.09),0_12px_38px_rgba(0,0,0,.32)] backdrop-blur-2xl sm:px-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-sky-200/10 bg-sky-200/[0.08] text-sky-100/85"><BookOpenText aria-hidden="true" size={15} /></span>
            <p className="min-w-0 text-xs leading-[1.4] text-white/90"><span className="font-bold text-white">{displayTerm}</span><span className="px-1.5 text-white/35">·</span>{explanation.plain_english_explanation}</p>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
