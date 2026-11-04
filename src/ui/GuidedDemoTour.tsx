import { useEffect, useState } from 'react';
import { ArrowRight, Sparkles, X } from 'lucide-react';
import { useReducedMotion } from 'framer-motion';
import { useReplayStore } from '../store/useReplayStore';

const tourSteps = [
  {
    target: 'home-feature',
    title: 'The match at a glance',
    copy: 'Live score and the latest AI signal share one clear view. Signals appear after their event happens.',
    action: 'Next',
  },
  {
    target: 'home-highlights',
    title: 'Highlights worth a look',
    copy: 'Key moments appear as the scripted match unfolds. No future events are shown early.',
    action: 'Next',
  },
  {
    target: 'home-quickwatch',
    title: 'Keep another stream close',
    copy: 'QuickWatch marks the matches that can surface a small switch cue while you watch.',
    action: 'Open the stream',
  },
  {
    target: 'stream-player',
    title: 'The stream view',
    copy: 'The score stays central. Events advance on their own at a calm pace; you won’t need to step through each one.',
    action: 'Next',
  },
  {
    target: 'stream-explainer',
    title: 'Cues arrive quietly',
    copy: 'Jargon help eases in from the bottom. A QuickWatch update appears bottom-right with its hotness score, headline, and Switch.',
    action: 'Start watching',
  },
];

type Rect = { top: number; left: number; width: number; height: number };

export function GuidedDemoTour() {
  const isGuidedDemoActive = useReplayStore((s) => s.isGuidedDemoActive);
  const demoStep = useReplayStore((s) => s.demoStep);
  const nextDemoStep = useReplayStore((s) => s.nextDemoStep);
  const exitGuidedDemo = useReplayStore((s) => s.exitGuidedDemo);
  const reduceMotion = useReducedMotion();
  const [rect, setRect] = useState<Rect | null>(null);
  const current = isGuidedDemoActive ? tourSteps[demoStep - 1] : undefined;

  useEffect(() => {
    if (!current) {
      setRect(null);
      return;
    }

    const selector = `[data-tour="${current.target}"]`;
    const target = document.querySelector<HTMLElement>(selector);
    if (!target) {
      setRect(null);
      return;
    }

    target.scrollIntoView({ block: 'center', behavior: reduceMotion ? 'auto' : 'smooth' });
    const measure = () => {
      const bounds = target.getBoundingClientRect();
      setRect({ top: bounds.top, left: bounds.left, width: bounds.width, height: bounds.height });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(target);
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
    };
  }, [current?.target, reduceMotion]);

  if (!current) return null;

  const stepLabel = `${String(demoStep).padStart(2, '0')} / ${String(tourSteps.length).padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 z-[100]" aria-label="Guided app tour">
      {rect && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed rounded-[1.3rem] border border-orange-300/85 shadow-[0_0_0_9999px_rgba(3,5,8,.66),0_0_38px_rgba(255,82,0,.16)] transition-[top,left,width,height] duration-300 motion-reduce:transition-none"
          style={{ top: rect.top - 5, left: rect.left - 5, width: rect.width + 10, height: rect.height + 10 }}
        />
      )}

      <section className="fixed bottom-4 left-1/2 z-[101] w-[min(500px,calc(100vw-2rem))] -translate-x-1/2 rounded-2xl border border-white/[0.12] bg-[#101318]/95 p-4 text-white shadow-[0_24px_70px_rgba(0,0,0,.52)] backdrop-blur-2xl sm:bottom-6 sm:p-5" role="dialog" aria-modal="false" aria-labelledby="guided-tour-title" aria-describedby="guided-tour-copy">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[.16em] text-orange-300"><Sparkles size={14} /> Product tour</div>
          <div className="flex items-center gap-3">
            <span className="font-mono-numbers text-[10px] font-semibold text-white/40">{stepLabel}</span>
            <button onClick={exitGuidedDemo} aria-label="Skip tour" className="flex h-8 w-8 items-center justify-center rounded-full text-white/55 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300"><X size={15} /></button>
          </div>
        </div>
        <h2 id="guided-tour-title" className="mt-3 text-base font-extrabold tracking-tight sm:text-lg">{current.title}</h2>
        <p id="guided-tour-copy" className="mt-1 text-xs leading-5 text-white/65 sm:text-sm">{current.copy}</p>
        <div className="mt-4 flex items-center justify-between gap-4">
          <div className="flex h-1 flex-1 overflow-hidden rounded-full bg-white/10" aria-hidden="true">
            <div className="rounded-full bg-broadcast-orange transition-[width] duration-300 motion-reduce:transition-none" style={{ width: `${(demoStep / tourSteps.length) * 100}%` }} />
          </div>
          <button onClick={nextDemoStep} className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl bg-broadcast-orange px-4 text-xs font-extrabold text-white shadow-[0_8px_24px_rgba(255,82,0,.2)] transition hover:bg-broadcast-orangeHover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#101318]">
            {current.action}<ArrowRight size={14} />
          </button>
        </div>
      </section>
    </div>
  );
}
