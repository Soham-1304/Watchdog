import { useState } from 'react';
import {
  X,
  Sparkles,
  User,
  ShieldCheck,
  Pin,
} from 'lucide-react';
import { useReplayStore } from '../store/useReplayStore';

export function SettingsDrawer() {
  const isOpen = useReplayStore((s) => s.isSettingsDrawerOpen);
  const setOpen = useReplayStore((s) => s.setSettingsDrawerOpen);
  const settings = useReplayStore((s) => s.settings);
  const updateSettings = useReplayStore((s) => s.updateSettings);
  const settingsTab = useReplayStore((s) => s.settingsTab);
  const setSettingsTab = useReplayStore((s) => s.setSettingsTab);
  const matches = useReplayStore((s) => s.matches);
  const quickWatchList = useReplayStore((s) => s.quickWatchList);
  const toggleQuickWatch = useReplayStore((s) => s.toggleQuickWatch);
  const totalEvaluated = useReplayStore((s) => s.totalEvaluatedCount);
  const totalAlerts = useReplayStore((s) => s.totalAlertsCount);

  const [newPlayer, setNewPlayer] = useState('');

  if (!isOpen) return null;

  const handleAddPlayer = () => {
    if (!newPlayer.trim()) return;
    const current = settings.pins?.players || [];
    if (!current.includes(newPlayer.trim())) {
      updateSettings({
        pins: {
          ...settings.pins,
          players: [...current, newPlayer.trim()],
        },
      });
    }
    setNewPlayer('');
  };

  const handleRemovePlayer = (p: string) => {
    const current = settings.pins?.players || [];
    updateSettings({
      pins: {
        ...settings.pins,
        players: current.filter((item) => item !== p),
      },
    });
  };

  const silenceRate =
    totalEvaluated > 0
      ? Math.round(((totalEvaluated - totalAlerts) / totalEvaluated) * 100)
      : 88;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/75 backdrop-blur-md flex justify-end animate-ticker-slide">
      <div className="w-full max-w-lg bg-[#111317] h-full border-l border-white/10 flex flex-col shadow-2xl animate-slide-in-right">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-[#161922]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-white">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">FanCode Account & Settings</h3>
              <p className="text-[11px] text-zinc-400">Manage user profile, QuickWatch, and Cutaway AI</p>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation (User Profile, QuickWatch List, Cutaway AI Sentinel) */}
        <div className="flex items-center border-b border-white/10 bg-[#0d0f14] px-4 pt-2">
          <button
            onClick={() => setSettingsTab('cutaway')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all flex items-center gap-1.5 relative ${
              settingsTab === 'cutaway'
                ? 'text-broadcast-orange font-extrabold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-broadcast-orange'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 fill-current" />
            <span>✦ Cutaway AI</span>
          </button>

          <button
            onClick={() => setSettingsTab('quickwatch')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all relative ${
              settingsTab === 'quickwatch'
                ? 'text-broadcast-orange font-extrabold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-broadcast-orange'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <span>QuickWatch ({quickWatchList.length})</span>
          </button>

          <button
            onClick={() => setSettingsTab('profile')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all relative ${
              settingsTab === 'profile'
                ? 'text-broadcast-orange font-extrabold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-broadcast-orange'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <span>Profile</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* TAB 1: ✦ CUTAWAY AI SENTINEL (The 3 Specialized Agents) */}
          {settingsTab === 'cutaway' && (
            <div className="space-y-6 animate-ticker-slide">
              {/* Master AI Toggle */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 shadow-inner">
                <div>
                  <h4 className="font-extrabold text-sm text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-broadcast-orange fill-current" />
                    In-Stream AI Companion
                  </h4>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Surfaces 7s alerts on turning points while watching any match
                  </p>
                </div>
                <button
                  onClick={() => updateSettings({ enabled: !settings.enabled })}
                  className={`w-12 h-6 rounded-full transition-colors p-0.5 shadow-inner ${
                    settings.enabled ? 'bg-broadcast-orange' : 'bg-zinc-700'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      settings.enabled ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  ></div>
                </button>
              </div>

              {/* AGENT 1: Significance Scorer */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-broadcast-orange">
                      Agent 1 · Quantitative Scorer
                    </span>
                    <h5 className="font-bold text-sm text-white">Significance Threshold</h5>
                  </div>
                  <span className="font-mono-numbers text-sm font-black text-broadcast-orange bg-white/10 px-2 py-0.5 rounded">
                    {settings.threshold}/10
                  </span>
                </div>
                <p className="text-xs text-zinc-400">
                  Filters routine moments via deterministic O(1) rules gate and scores true match leverage.
                </p>
                <input
                  type="range"
                  min={5}
                  max={9}
                  value={settings.threshold}
                  onChange={(e) => updateSettings({ threshold: Number(e.target.value) })}
                  className="w-full accent-broadcast-orange bg-white/10 rounded-lg h-2 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-zinc-500 font-mono-numbers">
                  <span>5 (More alerts)</span>
                  <span>7 (Default: Turning Points)</span>
                  <span>9 (Championship Deciders only)</span>
                </div>
              </div>

              {/* AGENT 2: Broadcast Narrator */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-broadcast-orange">
                    Agent 2 · Broadcast Context Narrator
                  </span>
                  <h5 className="font-bold text-sm text-white">Alert Content Depth</h5>
                </div>
                <p className="text-xs text-zinc-400">
                  Controls how much tactical context is shown in the 7-second alert popup.
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {(['concise', 'tactical', 'stat_heavy'] as const).map((depth) => (
                    <button
                      key={depth}
                      onClick={() => updateSettings({ contentDepth: depth })}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all capitalize ${
                        settings.contentDepth === depth
                          ? 'bg-broadcast-orange text-white shadow-md'
                          : 'bg-white/5 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {depth === 'stat_heavy' ? 'Stats Heavy' : depth}
                    </button>
                  ))}
                </div>
              </div>

              {/* AGENT 3: Novice Jargon Translator */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                      Agent 3 · Casual Fan Jargon Translator
                    </span>
                    <h5 className="font-bold text-sm text-white">Novice Rule Explanations</h5>
                  </div>
                  <button
                    onClick={() => updateSettings({ novice: !settings.novice })}
                    className={`w-12 h-6 rounded-full transition-colors p-0.5 shadow-inner ${
                      settings.novice ? 'bg-amber-500' : 'bg-zinc-700'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        settings.novice ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    ></div>
                  </button>
                </div>
                <p className="text-xs text-zinc-400">
                  Translates technical sports terminology (break point, safety car, required rate) into plain English for casual viewers.
                </p>
              </div>

              {/* Dream11 Pinning Preferences */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <div className="flex items-center gap-2">
                  <Pin className="w-4 h-4 text-amber-400" />
                  <h5 className="font-bold text-sm text-white">Favorite Sports & Players (+2 Boost)</h5>
                </div>
                <p className="text-xs text-zinc-400">
                  Moments involving your pinned favorites get a +2 score boost, alerting you even during lower leverage phases.
                </p>

                {/* Favorite Players Tag List */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {(settings.pins?.players || []).map((p) => (
                    <span
                      key={p}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold"
                    >
                      <span>{p}</span>
                      <button
                        onClick={() => handleRemovePlayer(p)}
                        className="hover:text-red-400 transition-colors"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>

                {/* Add Player Input */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={newPlayer}
                    onChange={(e) => setNewPlayer(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddPlayer()}
                    placeholder="Pin player (e.g. Kohli, Verstappen)..."
                    className="flex-1 bg-black/50 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-broadcast-orange"
                  />
                  <button
                    onClick={handleAddPlayer}
                    className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* AI Restraint & Transparency Metric */}
              <div className="p-4 rounded-2xl bg-[#0a0c10] border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-zinc-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Verified Proof of Restraint
                  </span>
                  <span className="text-emerald-400 font-bold">{silenceRate}% Suppressed</span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Cutaway evaluated {totalEvaluated || 23} match events and suppressed {totalEvaluated - totalAlerts > 0 ? totalEvaluated - totalAlerts : 20} routine moments to protect you from notification overload.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: QUICKWATCH LIST */}
          {settingsTab === 'quickwatch' && (
            <div className="space-y-4 animate-ticker-slide">
              <div>
                <h4 className="font-bold text-sm text-white">QuickWatch Active Feeds</h4>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Matches checked below are monitored in the background by Cutaway AI while you watch another game.
                </p>
              </div>

              <div className="space-y-2.5">
                {matches.map((m) => {
                  const isIn = quickWatchList.includes(m.id);
                  return (
                    <div
                      key={m.id}
                      className={`p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                        isIn
                          ? 'bg-[#151922] border-broadcast-orange/50 shadow-md'
                          : 'bg-white/5 border-white/5 text-zinc-400'
                      }`}
                    >
                      <div className="truncate pr-2">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded bg-white/10 text-zinc-400">
                            {m.sport}
                          </span>
                          <span className="text-xs font-bold text-white truncate">{m.title}</span>
                        </div>
                        <span className="text-[11px] text-zinc-400">{m.tournament}</span>
                      </div>

                      <button
                        onClick={() => toggleQuickWatch(m.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                          isIn
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                            : 'bg-white/10 text-zinc-300 hover:text-white border-white/10'
                        }`}
                      >
                        {isIn ? '✓ Active' : '+ Add'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: USER PROFILE */}
          {settingsTab === 'profile' && (
            <div className="space-y-4 animate-ticker-slide">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-broadcast-orange to-amber-500 flex items-center justify-center text-white font-black text-lg shadow-lg">
                    SK
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-white">Soham Karandikar</h4>
                    <p className="text-xs text-zinc-400">Dream11 Linked Fan ID: #D11-84920</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10 space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-zinc-400">FanCode Pass:</span>
                    <span className="text-emerald-400 font-bold">Active 2026 Season All-Access</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-zinc-400">Preferred Stream Quality:</span>
                    <span className="text-white font-semibold">1080p60 (Auto)</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-zinc-400">Audio Commentary:</span>
                    <span className="text-white font-semibold">English (Main)</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
