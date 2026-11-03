import { useState } from 'react';
import {
  ArrowLeft,
  Sparkles,
  Tv,
  Bell,
  ShieldCheck,
} from 'lucide-react';
import { useReplayStore } from '../store/useReplayStore';
import { SquishSwitch } from './SquishSwitch';

export function SettingsPage() {
  const setCurrentPage = useReplayStore((s) => s.setCurrentPage);
  const settings = useReplayStore((s) => s.settings);
  const updateSettings = useReplayStore((s) => s.updateSettings);
  const matches = useReplayStore((s) => s.matches);
  const quickWatchList = useReplayStore((s) => s.quickWatchList);
  const toggleQuickWatch = useReplayStore((s) => s.toggleQuickWatch);
  const theme = useReplayStore((s) => s.theme);

  // Local state for generic player preferences
  const [lowLatency, setLowLatency] = useState(true);
  const [autoPip, setAutoPip] = useState(false);
  const [quality, setQuality] = useState<'auto' | '1080p' | '720p'>('auto');

  const switchTrackColor = theme === 'dark' ? '#27272a' : '#e2e8f0';
  const switchThumbColor = theme === 'dark' ? '#71717a' : '#ffffff';

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-ticker-slide pb-16 select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/10">
        <button
          onClick={() => setCurrentPage('home')}
          className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>

        <span className="text-xs font-mono-numbers text-slate-500 dark:text-zinc-500">
          Settings · FanCode Live
        </span>
      </div>

      {/* Page Heading */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 mt-1 font-medium">
          Manage your stream playback, multi-match live alerts, and QuickWatch feeds.
        </p>
      </div>

      {/* SECTION 1: PLAYBACK & STREAM QUALITY */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-slate-900 dark:text-white">
          <Tv className="w-4 h-4 text-broadcast-orange" />
          <h2 className="text-sm sm:text-base font-black tracking-tight">Stream Playback</h2>
        </div>

        <div className="bg-white dark:bg-[#0e111a] rounded-2xl p-5 border border-slate-200 dark:border-white/10 shadow-sm space-y-5">
          {/* Quality Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-white/5">
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Video Quality</h3>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Dynamic adaptive bitrate for live sporting events.
              </p>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-white/5 p-1 rounded-xl border border-slate-200 dark:border-white/10">
              {[
                { id: 'auto', label: 'Auto (1080p60)' },
                { id: '1080p', label: '1080p' },
                { id: '720p', label: '720p' },
              ].map((q) => (
                <button
                  key={q.id}
                  onClick={() => setQuality(q.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    quality === q.id
                      ? 'bg-broadcast-orange text-white shadow-sm'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {q.label}
                </button>
              ))}
            </div>
          </div>

          {/* Low Latency Sync */}
          <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-white/5">
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Ultra-Low Latency Live Sync</h3>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Reduces broadcast delay to under 3 seconds across all live feeds.
              </p>
            </div>
            <SquishSwitch
              checked={lowLatency}
              onChange={setLowLatency}
              trackColor={switchTrackColor}
              thumbColor={switchThumbColor}
              trackOnColor="#ff5200"
            />
          </div>

          {/* Auto Picture-in-Picture */}
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Mini-Player on Tab Switch</h3>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Keeps the active match floating in a corner when switching tabs.
              </p>
            </div>
            <SquishSwitch
              checked={autoPip}
              onChange={setAutoPip}
              trackColor={switchTrackColor}
              thumbColor={switchThumbColor}
              trackOnColor="#ff5200"
            />
          </div>
        </div>
      </div>

      {/* SECTION 2: CUTAWAY LIVE TURNING POINT ALERTS */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-slate-900 dark:text-white">
          <Sparkles className="w-4 h-4 text-broadcast-orange fill-current" />
          <h2 className="text-sm sm:text-base font-black tracking-tight">Live Turning Point Alerts</h2>
        </div>

        <div className="bg-white dark:bg-[#0e111a] rounded-2xl p-5 border border-slate-200 dark:border-white/10 shadow-sm space-y-5">
          {/* Master Alerts Toggle */}
          <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-white/5">
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">In-Stream Turning Point Cues</h3>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Shows 7-second overlays when high-leverage plays (break points, wickets, lead passes) happen on concurrent matches.
              </p>
            </div>
            <SquishSwitch
              checked={settings.enabled}
              onChange={(val) => updateSettings({ enabled: val })}
              trackColor={switchTrackColor}
              thumbColor={switchThumbColor}
              trackOnColor="#ff5200"
            />
          </div>

          {/* Alert Sensitivity */}
          <div className="space-y-2 pb-4 border-b border-slate-100 dark:border-white/5">
            <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block">
              Alert Sensitivity
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                { threshold: 5, label: 'All Exciting Plays', desc: 'Frequent cues on every momentum shift' },
                { threshold: 7, label: 'High Stakes (Default)', desc: 'Break points, wickets, safety cars' },
                { threshold: 9, label: 'Deciders Only', desc: 'Match points, final laps, final overs' },
              ].map((opt) => (
                <button
                  key={opt.threshold}
                  onClick={() => updateSettings({ threshold: opt.threshold })}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    settings.threshold === opt.threshold
                      ? 'bg-broadcast-orange/10 border-broadcast-orange text-broadcast-orange ring-1 ring-broadcast-orange/30'
                      : 'bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 border-slate-200 dark:border-white/5 text-slate-700 dark:text-zinc-300'
                  }`}
                >
                  <div className="text-xs font-black">{opt.label}</div>
                  <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Commentary Depth */}
          <div className="space-y-2 pb-4 border-b border-slate-100 dark:border-white/5">
            <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block">
              Tactical Depth
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                { depth: 'concise', label: 'Quick Glance', desc: 'Punchy 1-sentence headline' },
                { depth: 'tactical', label: 'Tactical (Default)', desc: 'Strategic rationale & context' },
                { depth: 'stat_heavy', label: 'Stats Heavy', desc: 'Probabilities & split numbers' },
              ].map((opt) => (
                <button
                  key={opt.depth}
                  onClick={() => updateSettings({ contentDepth: opt.depth as any })}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    settings.contentDepth === opt.depth
                      ? 'bg-broadcast-orange/10 border-broadcast-orange text-broadcast-orange ring-1 ring-broadcast-orange/30'
                      : 'bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 border-slate-200 dark:border-white/5 text-slate-700 dark:text-zinc-300'
                  }`}
                >
                  <div className="text-xs font-black">{opt.label}</div>
                  <div className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Casual Fan Rule Helper */}
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Casual Fan Terminology Helper</h3>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                Translates complex sports rules (break points, DRS reviews, safety cars) into plain, friendly explanations.
              </p>
            </div>
            <SquishSwitch
              checked={settings.novice}
              onChange={(val) => updateSettings({ novice: val })}
              trackColor={switchTrackColor}
              thumbColor={switchThumbColor}
              trackOnColor="#ff5200"
            />
          </div>
        </div>
      </div>

      {/* SECTION 3: QUICKWATCH FEEDS (Select Which Matches to Monitor) */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-slate-900 dark:text-white">
          <Bell className="w-4 h-4 text-broadcast-orange" />
          <h2 className="text-sm sm:text-base font-black tracking-tight">
            QuickWatch Streams ({quickWatchList.length} Selected)
          </h2>
        </div>

        <div className="bg-white dark:bg-[#0e111a] rounded-2xl p-5 border border-slate-200 dark:border-white/10 shadow-sm space-y-3">
          <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
            Toggle which concurrent matches are monitored in the background while you watch your primary stream:
          </p>

          <div className="space-y-2 pt-1">
            {matches.map((m) => {
              const isChecked = quickWatchList.includes(m.id);

              return (
                <div
                  key={m.id}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black uppercase text-broadcast-orange px-2 py-0.5 rounded-md bg-broadcast-orange/10">
                      {m.sport}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{m.title}</h4>
                      <p className="text-[10px] text-slate-500 dark:text-zinc-400">{m.tournament}</p>
                    </div>
                  </div>

                  <SquishSwitch
                    checked={isChecked}
                    onChange={() => toggleQuickWatch(m.id)}
                    trackColor={switchTrackColor}
                    thumbColor={switchThumbColor}
                    trackOnColor="#ff5200"
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* SECTION 4: USER PASS */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-broadcast-orange/10 via-amber-500/10 to-transparent border border-broadcast-orange/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-broadcast-orange text-white flex items-center justify-center font-black shadow-md shadow-broadcast-orange/30">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">FanCode Sports Pass</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[9px] font-black uppercase">
                Active
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400">All concurrent HD streams unlocked · Zero ads</p>
          </div>
        </div>
      </div>
    </div>
  );
}
