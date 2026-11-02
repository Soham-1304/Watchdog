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
      highlight: 'Focus on the main scoreboard',
    },
    {
      step: 2,
      title: 'Step 2: The Multi-Sport Sentinel',
      desc: 'In the background, Cutaway is tracking live feeds for the F1 Abu Dhabi title decider and the T20 World Cup final. Routine events are silently filtered.',
      icon: Radio,
      highlight: 'Observe the Other Feeds strip below',
    },
    {
      step: 3,
      title: 'Step 3: Decisive Alert & Restraint',
      desc: 'Within seconds, a pivotal event in F1 (Safety Car deployment) will fire an alert card. Tap "Switch" to jump instantly, and click "Suppressed" in the top bar to inspect filtered events.',
      icon: Shield,
      highlight: 'Alerts appear in bottom-right corner',
    },
  ];

  const current = steps[demoStep - 1] || steps[0];
  const Icon = current.icon;

  return (
    <div className="fixed bottom-6 left-6 z-50 max-w-sm w-[calc(100vw-3rem)] animate-slide-in-right">
      <div className="bg-gradient-to-br from-fancode-card via-fancode-surface to-black border-2 border-fancode-orange rounded-2xl p-4 shadow-2xl shadow-fancode-orange/30">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-fancode-orange">
            <Sparkles className="w-4 h-4" />
            <span>GUIDED DEMO · STEP {demoStep} OF 3</span>
          </div>
          <button
            onClick={exitGuidedDemo}
            className="text-fancode-subtle hover:text-white p-1 rounded hover:bg-fancode-card"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-start gap-3 my-2">
          <div className="p-2 rounded-xl bg-fancode-orange/20 text-fancode-orange border border-fancode-orange/30 shrink-0">
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white mb-1">{current.title}</h4>
            <p className="text-xs text-fancode-muted leading-relaxed">{current.desc}</p>
          </div>
        </div>

        <div className="mt-3 pt-2 border-t border-fancode-border flex items-center justify-between">
          <span className="text-[11px] text-fancode-orange font-medium">
            {current.highlight}
          </span>
          <button
            onClick={nextDemoStep}
            className="flex items-center gap-1 px-3 py-1 bg-fancode-orange hover:bg-fancode-orangeLight text-white rounded-lg text-xs font-bold transition-all"
          >
            <span>{demoStep === 3 ? 'Got it!' : 'Next'}</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
