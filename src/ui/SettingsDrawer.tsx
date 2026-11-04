import { useState } from 'react';
import {
  X,
  Pin,
  Check,
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

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/75 backdrop-blur-md flex justify-end animate-ticker-slide">
      <div className="w-full max-w-md bg-[#111317] h-full border-l border-white/10 flex flex-col shadow-2xl animate-slide-in-right">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-[#141720]">
          <div>
            <h3 className="text-base font-bold text-white">Preferences</h3>
            <p className="text-xs text-zinc-400">Stream settings and multi-match alerts</p>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Clean Segmented Tab Navigation */}
        <div className="flex border-b border-white/10 bg-[#0d0f14] p-1.5 gap-1">
          <button
            onClick={() => setSettingsTab('cutaway')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
              settingsTab === 'cutaway'
                ? 'bg-white/10 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Smart Alerts
          </button>

          <button
            onClick={() => setSettingsTab('quickwatch')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
              settingsTab === 'quickwatch'
                ? 'bg-white/10 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            QuickWatch ({quickWatchList.length})
          </button>

          <button
            onClick={() => setSettingsTab('profile')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
              settingsTab === 'profile'
                ? 'bg-white/10 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Account
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* TAB 1: SMART ALERTS */}
          {settingsTab === 'cutaway' && (
            <div className="space-y-6 animate-ticker-slide">
              {/* Cue delivery switch; agent controls live on the main Settings page. */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/5">
                <div>
                  <h4 className="font-bold text-sm text-white">In-stream cue overlays</h4>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Show or hide alerts here. AI agent controls are in Settings.
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={settings.enabled}
                  aria-label="Show in-stream cue overlays"
                  onClick={() => updateSettings({ enabled: !settings.enabled })}
                  className={`w-11 h-6 rounded-full transition-colors p-0.5 shadow-inner ${
                    settings.enabled ? 'bg-broadcast-orange' : 'bg-zinc-700'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      settings.enabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  ></div>
                </button>
              </div>

              {/* Alert Sensitivity */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-300 block">
                  Alert Sensitivity
                </label>
                <div className="grid grid-cols-2 gap-2 bg-white/5 p-1 rounded-xl border border-white/5">
                  <button
                    onClick={() => updateSettings({ threshold: 7 })}
                    className={`py-2 text-xs font-bold rounded-lg transition-all ${
                      settings.threshold <= 7
                        ? 'bg-broadcast-orange text-white shadow'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Turning Points (Default)
                  </button>
                  <button
                    onClick={() => updateSettings({ threshold: 9 })}
                    className={`py-2 text-xs font-bold rounded-lg transition-all ${
                      settings.threshold >= 8
                        ? 'bg-broadcast-orange text-white shadow'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Deciders Only
                  </button>
                </div>
                <p className="text-[11px] text-zinc-500">
                  {settings.threshold <= 7
                    ? 'Alerts on break points, wickets, safety cars, and decisive lead changes.'
                    : 'Alerts only on final match points, last-lap overtakes, and final-over finishes.'}
                </p>
              </div>

              {/* Alert Content Style */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-300 block">
                  Alert Detail Level
                </label>
                <div className="grid grid-cols-3 gap-1.5 bg-white/5 p-1 rounded-xl border border-white/5">
                  {(['concise', 'tactical', 'stat_heavy'] as const).map((depth) => (
                    <button
                      key={depth}
                      onClick={() => updateSettings({ contentDepth: depth })}
                      className={`py-1.5 text-xs font-bold rounded-lg transition-all capitalize ${
                        settings.contentDepth === depth
                          ? 'bg-white/15 text-white shadow-sm'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      {depth === 'stat_heavy' ? 'Stats' : depth}
                    </button>
                  ))}
                </div>
              </div>

              {/* Casual Fan Mode */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/5">
                <div>
                  <h4 className="font-bold text-sm text-white">Casual Fan Helper</h4>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Explains complex terms like break points and safety cars
                  </p>
                </div>
                <button
                  onClick={() => updateSettings({ novice: !settings.novice })}
                  className={`w-11 h-6 rounded-full transition-colors p-0.5 shadow-inner ${
                    settings.novice ? 'bg-amber-500' : 'bg-zinc-700'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      settings.novice ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  ></div>
                </button>
              </div>

              {/* Favorite Teams & Athletes */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-300 block flex items-center gap-1.5">
                  <Pin className="w-3.5 h-3.5 text-amber-400" />
                  <span>Favorite Athletes & Teams</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {(settings.pins?.players || []).map((p) => (
                    <span
                      key={p}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 text-white text-xs font-medium"
                    >
                      <span>{p}</span>
                      <button
                        onClick={() => handleRemovePlayer(p)}
                        className="text-zinc-400 hover:text-white ml-0.5"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={newPlayer}
                    onChange={(e) => setNewPlayer(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddPlayer()}
                    placeholder="Add favorite (e.g. Sinner, Kohli)..."
                    className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-broadcast-orange"
                  />
                  <button
                    onClick={handleAddPlayer}
                    className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: QUICKWATCH */}
          {settingsTab === 'quickwatch' && (
            <div className="space-y-3 animate-ticker-slide">
              <p className="text-xs text-zinc-400">
                Select concurrent live matches to monitor while watching your main stream:
              </p>

              <div className="space-y-2">
                {matches.map((m) => {
                  const isIn = quickWatchList.includes(m.id);
                  return (
                    <div
                      key={m.id}
                      onClick={() => toggleQuickWatch(m.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                        isIn
                          ? 'bg-white/10 border-white/20 text-white'
                          : 'bg-white/5 border-white/5 text-zinc-400'
                      }`}
                    >
                      <div className="truncate pr-2">
                        <span className="text-xs font-bold text-white block truncate">{m.title}</span>
                        <span className="text-[11px] text-zinc-400">{m.tournament}</span>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                          isIn ? 'bg-broadcast-orange text-white' : 'border border-white/20'
                        }`}
                      >
                        {isIn && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: ACCOUNT PROFILE */}
          {settingsTab === 'profile' && (
            <div className="space-y-4 animate-ticker-slide">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-broadcast-orange to-amber-500 flex items-center justify-center text-white font-black text-sm">
                    SK
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">Soham Karandikar</h4>
                    <p className="text-xs text-zinc-400">Watchdog account</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/5 space-y-1.5 text-xs text-zinc-300">
                  <div className="flex justify-between py-1">
                    <span className="text-zinc-500">Subscription</span>
                    <span className="text-emerald-400 font-semibold">2026 Season All-Access</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-zinc-500">Quality</span>
                    <span>1080p60 Auto</span>
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
