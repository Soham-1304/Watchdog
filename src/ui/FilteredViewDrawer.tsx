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
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-md flex justify-end animate-ticker-slide">
      <div className="w-full max-w-xl bg-broadcast-surface h-full border-l border-broadcast-border flex flex-col shadow-2xl animate-slide-in-right">
        {/* Header */}
        <div className="p-5 border-b border-broadcast-border flex items-center justify-between bg-broadcast-card/90">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-broadcast-orange/15 text-broadcast-orange border border-broadcast-orange/30 shadow-md">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Proof of Restraint</h3>
              <p className="text-xs text-broadcast-muted">
                Audit trail of events filtered out to protect viewing immersion
              </p>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 text-broadcast-subtle hover:text-white rounded-lg hover:bg-broadcast-cardHover transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Anti-Bloat Stat Cards */}
        <div className="grid grid-cols-3 gap-3 p-5 border-b border-broadcast-border bg-broadcast-canvas/60">
          <div className="bg-broadcast-card p-3.5 rounded-2xl border border-broadcast-border text-center shadow-sm">
            <span className="text-[11px] text-broadcast-subtle uppercase font-bold tracking-wider">Evaluated</span>
            <div className="text-2xl font-black font-mono-numbers text-white mt-1">
              {totalEvaluated}
            </div>
          </div>
          <div className="bg-broadcast-card p-3.5 rounded-2xl border border-broadcast-border text-center shadow-sm">
            <span className="text-[11px] text-broadcast-orange uppercase font-bold tracking-wider">Alerts Fired</span>
            <div className="text-2xl font-black font-mono-numbers text-broadcast-orange mt-1">
              {totalAlerts}
            </div>
          </div>
          <div className="bg-broadcast-card p-3.5 rounded-2xl border border-broadcast-border text-center shadow-sm">
            <span className="text-[11px] text-emerald-400 uppercase font-bold tracking-wider">Restraint Rate</span>
            <div className="text-2xl font-black font-mono-numbers text-emerald-400 mt-1">
              {suppressionRate}%
            </div>
          </div>
        </div>

        {/* Philosophy Note */}
        <div className="px-5 py-3.5 bg-amber-500/10 border-b border-amber-500/20 text-xs text-amber-200/90 flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>
            <strong>FDE Design Principle:</strong> Existing apps spam on every boundary, lap, or routine point. Cutaway’s two-stage gate holds back 70–85%+ of events, firing only on decisive swings (threshold &ge; {threshold}).
          </span>
        </div>

        {/* Filter Tabs */}
        <div className="flex border-b border-broadcast-border px-5 pt-3 gap-2 bg-broadcast-surface text-xs font-bold">
          <button
            onClick={() => setActiveTab('all')}
            className={`pb-2.5 px-3 border-b-2 transition-colors ${
              activeTab === 'all'
                ? 'border-broadcast-orange text-white'
                : 'border-transparent text-broadcast-muted hover:text-white'
            }`}
          >
            All Suppressed ({suppressedCount})
          </button>
          <button
            onClick={() => setActiveTab('rules_gate')}
            className={`pb-2.5 px-3 border-b-2 transition-colors ${
              activeTab === 'rules_gate'
                ? 'border-broadcast-orange text-white'
                : 'border-transparent text-broadcast-muted hover:text-white'
            }`}
          >
            Stage 1: Rules Gate
          </button>
          <button
            onClick={() => setActiveTab('below_threshold')}
            className={`pb-2.5 px-3 border-b-2 transition-colors ${
              activeTab === 'below_threshold'
                ? 'border-broadcast-orange text-white'
                : 'border-transparent text-broadcast-muted hover:text-white'
            }`}
          >
            Stage 2: Below Threshold
          </button>
        </div>

        {/* Suppressed Events List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-2.5">
          {filteredList.length === 0 ? (
            <div className="text-center py-16 text-broadcast-subtle text-sm">
              <Filter className="w-8 h-8 mx-auto mb-2 opacity-40" />
              No suppressed events recorded yet. Run the replay to see events pass through the gate!
            </div>
          ) : (
            filteredList.map((item, idx) => (
              <div
                key={`${item.event.id}-${idx}`}
                className="bg-broadcast-card/85 p-3.5 rounded-2xl border border-broadcast-border/80 flex items-start justify-between gap-3 text-xs shadow-sm hover:border-broadcast-borderLight transition-all"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase text-broadcast-orange bg-broadcast-orange/10 px-2 py-0.5 rounded border border-broadcast-orange/20">
                      {item.event.sport}
                    </span>
                    <span className="font-mono-numbers text-[11px] font-bold text-broadcast-subtle">
                      t={Math.floor(item.event.t)}s
                    </span>
                    <span className="text-[10px] font-semibold text-broadcast-muted bg-broadcast-canvas px-2 py-0.5 rounded border border-broadcast-border">
                      {item.event.type}
                    </span>
                  </div>
                  <p className="font-bold text-white text-xs">{item.event.headline}</p>
                  <p className="text-[11px] text-broadcast-subtle flex items-center gap-1 font-medium">
                    <ChevronRight className="w-3 h-3 text-broadcast-muted" />
                    <span>Reason: {item.details || item.reason}</span>
                  </p>
                </div>

                {item.score !== undefined ? (
                  <span className="font-mono-numbers font-black px-2.5 py-1 rounded-xl bg-zinc-800 text-zinc-200 border border-zinc-700 text-xs shrink-0">
                    {item.score}/10
                  </span>
                ) : (
                  <span className="font-mono-numbers text-[10px] font-bold px-2.5 py-1 rounded-xl bg-zinc-900 text-zinc-500 border border-zinc-800 shrink-0">
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
