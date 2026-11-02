import { useState } from 'react';
import { X, Filter, ShieldCheck, CheckCircle2, ChevronRight } from 'lucide-react';
import { useReplayStore } from '../store/useReplayStore';

export function FilteredViewDrawer() {
  const isOpen = useReplayStore((s) => s.isFilteredDrawerOpen);
  const setOpen = useReplayStore((s) => s.setFilteredDrawerOpen);
  const totalEvaluated = useReplayStore((s) => s.totalEvaluatedCount);
  const totalAlerts = useReplayStore((s) => s.totalAlertsCount);
  const suppressedEvents = useReplayStore((s) => s.suppressedEvents);
  const threshold = useReplayStore((s) => s.settings.threshold);

  const [activeTab, setActiveTab] = useState<'all' | 'rules_gate' | 'below_threshold'>('all');

  if (!isOpen) return null;

  const suppressedCount = suppressedEvents.length;
  const suppressionRate =
    totalEvaluated > 0 ? Math.round(((totalEvaluated - totalAlerts) / totalEvaluated) * 100) : 0;

  const filteredList = suppressedEvents.filter((item) => {
    if (activeTab === 'all') return true;
    return item.reason === activeTab;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end animate-fadeIn">
      <div className="w-full max-w-xl bg-fancode-surface h-full border-l border-fancode-border flex flex-col shadow-2xl animate-slide-in-right">
        {/* Header */}
        <div className="p-5 border-b border-fancode-border flex items-center justify-between bg-fancode-card/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-fancode-orange/15 text-fancode-orange border border-fancode-orange/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">Proof of Restraint</h3>
              <p className="text-xs text-fancode-muted">
                What Cutaway filtered out to protect your viewing stream
              </p>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 text-fancode-subtle hover:text-white rounded-lg hover:bg-fancode-hover transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Anti-Bloat Stat Cards */}
        <div className="grid grid-cols-3 gap-3 p-5 border-b border-fancode-border bg-fancode-bg/50">
          <div className="bg-fancode-card p-3 rounded-xl border border-fancode-border text-center">
            <span className="text-[11px] text-fancode-subtle uppercase font-semibold">Evaluated</span>
            <div className="text-xl font-black font-mono-numbers text-white mt-0.5">
              {totalEvaluated}
            </div>
          </div>
          <div className="bg-fancode-card p-3 rounded-xl border border-fancode-border text-center">
            <span className="text-[11px] text-fancode-orange uppercase font-semibold">Alerts Fired</span>
            <div className="text-xl font-black font-mono-numbers text-fancode-orange mt-0.5">
              {totalAlerts}
            </div>
          </div>
          <div className="bg-fancode-card p-3 rounded-xl border border-fancode-border text-center">
            <span className="text-[11px] text-emerald-400 uppercase font-semibold">Filtered Rate</span>
            <div className="text-xl font-black font-mono-numbers text-emerald-400 mt-0.5">
              {suppressionRate}%
            </div>
          </div>
        </div>

        {/* Philosophy Note */}
        <div className="px-5 py-3 bg-amber-500/10 border-b border-amber-500/20 text-xs text-amber-200/90 flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>
            <strong>Design Principle:</strong> Existing apps spam on every boundary or lap. Cutaway’s two-stage gate holds back ~85%+ of events, firing only on decisive swings (threshold &ge; {threshold}).
          </span>
        </div>

        {/* Filter Tabs */}
        <div className="flex border-b border-fancode-border px-5 pt-3 gap-2 bg-fancode-surface text-xs font-semibold">
          <button
            onClick={() => setActiveTab('all')}
            className={`pb-2.5 px-3 border-b-2 transition-colors ${
              activeTab === 'all'
                ? 'border-fancode-orange text-white'
                : 'border-transparent text-fancode-muted hover:text-white'
            }`}
          >
            All Suppressed ({suppressedCount})
          </button>
          <button
            onClick={() => setActiveTab('rules_gate')}
            className={`pb-2.5 px-3 border-b-2 transition-colors ${
              activeTab === 'rules_gate'
                ? 'border-fancode-orange text-white'
                : 'border-transparent text-fancode-muted hover:text-white'
            }`}
          >
            Stage 1: Rules Gate
          </button>
          <button
            onClick={() => setActiveTab('below_threshold')}
            className={`pb-2.5 px-3 border-b-2 transition-colors ${
              activeTab === 'below_threshold'
                ? 'border-fancode-orange text-white'
                : 'border-transparent text-fancode-muted hover:text-white'
            }`}
          >
            Stage 2: Below Threshold
          </button>
        </div>

        {/* Suppressed Events List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-2.5">
          {filteredList.length === 0 ? (
            <div className="text-center py-12 text-fancode-subtle text-sm">
              <Filter className="w-8 h-8 mx-auto mb-2 opacity-40" />
              No suppressed events recorded yet. Play the replay to see events pass through the gate!
            </div>
          ) : (
            filteredList.map((item, idx) => (
              <div
                key={`${item.event.id}-${idx}`}
                className="bg-fancode-card/80 p-3.5 rounded-xl border border-fancode-border/70 flex items-start justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase text-fancode-orange bg-fancode-orange/10 px-1.5 py-0.2 rounded border border-fancode-orange/20">
                      {item.event.sport}
                    </span>
                    <span className="font-mono-numbers text-[10px] text-fancode-subtle">
                      t={Math.floor(item.event.t)}s
                    </span>
                    <span className="text-[10px] text-fancode-muted bg-fancode-surface px-1.5 py-0.2 rounded border border-fancode-border">
                      {item.event.type}
                    </span>
                  </div>
                  <p className="font-medium text-white">{item.event.headline}</p>
                  <p className="text-[11px] text-fancode-subtle flex items-center gap-1">
                    <ChevronRight className="w-3 h-3 text-fancode-muted" />
                    <span>Suppressed: {item.details || item.reason}</span>
                  </p>
                </div>

                {item.score !== undefined ? (
                  <span className="font-mono-numbers font-black px-2 py-1 rounded bg-zinc-800 text-zinc-300 border border-zinc-700 text-xs shrink-0">
                    {item.score}/10
                  </span>
                ) : (
                  <span className="font-mono-numbers text-[10px] px-2 py-0.5 rounded bg-zinc-900 text-zinc-500 border border-zinc-800 shrink-0">
                    Gate Cut
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
