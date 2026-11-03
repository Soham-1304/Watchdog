import { useState } from 'react';
import {
  ArrowLeft,
  Sparkles,
  User,
  Pin,
  Check,
  ShieldCheck,
  Tv,
} from 'lucide-react';
import { useReplayStore } from '../store/useReplayStore';

export function SettingsPage() {
  const setCurrentPage = useReplayStore((s) => s.setCurrentPage);
  const settings = useReplayStore((s) => s.settings);
  const updateSettings = useReplayStore((s) => s.updateSettings);
  const matches = useReplayStore((s) => s.matches);
  const quickWatchList = useReplayStore((s) => s.quickWatchList);
  const toggleQuickWatch = useReplayStore((s) => s.toggleQuickWatch);

  const [newPlayer, setNewPlayer] = useState('');

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
    <div className="max-w-4xl mx-auto space-y-8 animate-ticker-slide pb-12">
      {/* Top Header with Back Navigation */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <button
          onClick={() => setCurrentPage('match')}
          className="flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Match</span>
        </button>
        <span className="text-xs text-zinc-500 font-mono-numbers">Account ID: #FC-948201</span>
      </div>

      {/* Page Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Settings & Preferences
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1">
          Customize your streaming companion, multi-match alerts, and QuickWatch feeds.
        </p>
      </div>

      {/* SECTION 1: USER PROFILE & MEMBERSHIP */}
      <div className="bg-[#111317] rounded-2xl p-5 sm:p-6 border border-white/10 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-broadcast-orange to-amber-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-broadcast-orange/30">
            <User className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-white">Soham Karandikar</h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 border border-emerald-500/30">
                <ShieldCheck className="w-3 h-3" />
                Pass Active
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">FanCode Unlimited Sports Pass · Auto-renews Dec 2026</p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs font-mono-numbers text-zinc-400 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
            1080p60 · Synced
          </span>
        </div>
      </div>

      {/* SECTION 2: CUTAWAY LIVE AI SETTINGS */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-white">
          <Sparkles className="w-4 h-4 text-broadcast-orange fill-current" />
          <h2 className="text-base sm:text-lg font-black tracking-tight">Live Turning Point Alerts</h2>
        </div>

        <div className="bg-[#111317] rounded-2xl p-5 sm:p-6 border border-white/10 shadow-xl space-y-6">
          {/* Master Switch */}
          <div className="flex items-center justify-between gap-4 pb-5 border-b border-white/10">
            <div>
              <h3 className="font-bold text-sm text-white">In-Stream Turning Point Cues</h3>
              <p className="text-xs text-zinc-400 mt-0.5 max-w-xl">
                Surfaces discreet 7-second overlays when high-leverage plays (break points, wickets, lead changes) happen on concurrent matches.
              </p>
            </div>
            <button
              onClick={() => updateSettings({ enabled: !settings.enabled })}
              className={`w-12 h-6 rounded-full transition-colors p-0.5 shadow-inner shrink-0 ${
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

          {/* Sensitivity */}
          <div className="space-y-2.5 pb-5 border-b border-white/10">
            <label className="text-xs font-bold text-zinc-200 block">
              Alert Sensitivity
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                { threshold: 5, label: 'All Exciting Plays', desc: 'Frequent alerts on every momentum shift' },
                { threshold: 7, label: 'High Stakes (Default)', desc: 'Alerts on break points, wickets, safety cars' },
                { threshold: 9, label: 'Deciders Only', desc: 'Alerts only on match points, final laps, final overs' },
              ].map((opt) => (
                <button
                  key={opt.threshold}
                  onClick={() => updateSettings({ threshold: opt.threshold })}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    settings.threshold === opt.threshold
                      ? 'bg-broadcast-orange/15 border-broadcast-orange text-white ring-1 ring-broadcast-orange/50'
                      : 'bg-white/5 hover:bg-white/10 border-white/5 text-zinc-300'
                  }`}
                >
                  <div className="text-xs font-black">{opt.label}</div>
                  <div className="text-[11px] text-zinc-400 mt-1">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Commentary Style */}
          <div className="space-y-2.5 pb-5 border-b border-white/10">
            <label className="text-xs font-bold text-zinc-200 block">
              Commentary Detail Level
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                { depth: 'concise', label: 'Quick Glance', desc: '1-sentence punchy headline' },
                { depth: 'tactical', label: 'Tactical (Default)', desc: 'Strategic rationale and player momentum' },
                { depth: 'stat_heavy', label: 'Data & Stats', desc: 'Win probability and historical splits' },
              ].map((opt) => (
                <button
                  key={opt.depth}
                  onClick={() => updateSettings({ contentDepth: opt.depth as any })}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    settings.contentDepth === opt.depth
                      ? 'bg-broadcast-orange/15 border-broadcast-orange text-white ring-1 ring-broadcast-orange/50'
                      : 'bg-white/5 hover:bg-white/10 border-white/5 text-zinc-300'
                  }`}
                >
                  <div className="text-xs font-black">{opt.label}</div>
                  <div className="text-[11px] text-zinc-400 mt-1">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Casual Fan Mode */}
          <div className="flex items-center justify-between gap-4 pb-5 border-b border-white/10">
            <div>
              <h3 className="font-bold text-sm text-white">Casual Fan Mode (Terminology Helper)</h3>
              <p className="text-xs text-zinc-400 mt-0.5 max-w-xl">
                Translates complex sports rules and terms (such as break points, DRS reviews, safety cars) into plain, friendly explanations.
              </p>
            </div>
            <button
              onClick={() => updateSettings({ novice: !settings.novice })}
              className={`w-12 h-6 rounded-full transition-colors p-0.5 shadow-inner shrink-0 ${
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

          {/* Favorite Teams & Players */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-zinc-200 block flex items-center gap-1.5">
              <Pin className="w-3.5 h-3.5 text-amber-400" />
              <span>Favorite Athletes & Teams (+2 Priority Boost)</span>
            </label>
            <p className="text-xs text-zinc-400">
              Plays involving your pinned favorites are boosted by +2, ensuring you never miss their key moments even at lower sensitivity.
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              {(settings.pins?.players || []).map((p) => (
                <span
                  key={p}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 text-white text-xs font-bold border border-white/10"
                >
                  <span>{p}</span>
                  <button
                    onClick={() => handleRemovePlayer(p)}
                    className="text-zinc-400 hover:text-white ml-1"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2 max-w-md pt-2">
              <input
                type="text"
                value={newPlayer}
                onChange={(e) => setNewPlayer(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddPlayer()}
                placeholder="Add favorite (e.g. Sinner, Verstappen, Kohli)..."
                className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-broadcast-orange"
              />
              <button
                onClick={handleAddPlayer}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: QUICKWATCH FEEDS MANAGEMENT */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-white">
          <Tv className="w-4 h-4 text-broadcast-orange" />
          <h2 className="text-base sm:text-lg font-black tracking-tight">
            QuickWatch Streams ({quickWatchList.length} Selected)
          </h2>
        </div>

        <div className="bg-[#111317] rounded-2xl p-5 sm:p-6 border border-white/10 shadow-xl space-y-3">
          <p className="text-xs text-zinc-400">
            Select which live feeds are actively monitored in background while you watch your primary stream:
          </p>

          <div className="space-y-2 pt-2">
            {matches.map((m) => {
              const isChecked = quickWatchList.includes(m.id);
              return (
                <div
                  key={m.id}
                  onClick={() => toggleQuickWatch(m.id)}
                  className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    isChecked
                      ? 'bg-emerald-500/10 border-emerald-500/30'
                      : 'bg-white/5 hover:bg-white/10 border-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                        isChecked ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-white/20'
                      }`}
                    >
                      {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">{m.title}</h4>
                      <p className="text-[11px] text-zinc-400 mt-0.5">{m.tournament}</p>
                    </div>
                  </div>

                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-white/10 text-zinc-300">
                    {m.sport}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
