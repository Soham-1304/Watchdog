import { Sparkles, ArrowRight, X, Eye, Shield, Radio } from 'lucide-react';
import { useReplayStore } from '../store/useReplayStore';

export function GuidedDemoTour() {
  const isGuidedDemoActive = useReplayStore((s) => s.isGuidedDemoActive);
  const demoStep = useReplayStore((s) => s.demoStep);
  const nextDemoStep = useReplayStore((s) => s.nextDemoStep);
  const exitGuidedDemo = useReplayStore((s) => s.exitGuidedDemo);

  if (!isGuidedDemoActive || demoStep === 0) return null;

  const steps = [
    {
      step: 1,
      title: 'Step 1: The Main Match',
      desc: "You're watching Jannik Sinner in the deciding 5th set of the Australian Open Final. This screen acts as FanCode's active video player.",
      icon: Eye,
      highlight: 'Focus on the main scoreboard above',
    },
    {
      step: 2,
      title: 'Step 2: The Multi-Sport Sentinel',
      desc: 'In the background, Cutaway tracks live feeds for the F1 Abu Dhabi decider and T20 World Cup final. Routine events are silently filtered.',
      icon: Radio,
      highlight: 'Observe the Other Feeds strip below',
    },
    {
      step: 3,
      title: 'Step 3: Decisive Alert & Restraint',
      desc: 'At ~15s, a Safety Car in F1 fires an alert. Tap "Switch" to jump instantly, and click "Filtered" in the top bar to inspect what was held back.',
      icon: Shield,
      highlight: 'Alerts appear in bottom-right corner',
    },
  ];

  const current = steps[demoStep - 1] || steps[0];
  const Icon = current.icon;

  return (
    <div className="fixed bottom-6 left-6 z-50 max-w-sm w-[calc(100vw-3rem)] animate-slide-in-right">
      <div className="broadcast-glass border-2 border-broadcast-orange rounded-3xl p-5 shadow-2xl shadow-broadcast-orange/30">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2 text-xs font-black text-broadcast-orange uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>GUIDED DEMO · STEP {demoStep} OF 3</span>
          </div>
          <button
            onClick={exitGuidedDemo}
            className="text-broadcast-subtle hover:text-white p-1 rounded-lg hover:bg-broadcast-card"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-start gap-3.5 my-2.5">
          <div className="p-2.5 rounded-2xl bg-broadcast-orange/20 text-broadcast-orange border border-broadcast-orange/30 shrink-0 shadow-md">
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-black text-white mb-1">{current.title}</h4>
            <p className="text-xs text-broadcast-muted leading-relaxed font-medium">{current.desc}</p>
          </div>
        </div>

        <div className="mt-3.5 pt-2.5 border-t border-broadcast-border flex items-center justify-between">
          <span className="text-[11px] text-broadcast-orange font-bold">
            {current.highlight}
          </span>
          <button
            onClick={nextDemoStep}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-broadcast-orange to-broadcast-amber hover:brightness-110 text-white rounded-xl text-xs font-black transition-all shadow-md shadow-broadcast-orange/30"
          >
            <span>{demoStep === 3 ? 'Got it!' : 'Next'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
