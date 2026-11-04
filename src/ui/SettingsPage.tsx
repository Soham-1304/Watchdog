import { useState } from 'react';
import type { ReactNode } from 'react';
import {
  Activity,
  ArrowLeft,
  Check,
  ChevronRight,
  Clock3,
  CircleHelp,
  Moon,
  MessageSquareText,
  Plus,
  Radio,
  ShieldCheck,
  Sun,
  Trash2,
} from 'lucide-react';
import { useReplayStore } from '../store/useReplayStore';

function SettingSwitch({
  id,
  checked,
  onChange,
}: {
  id: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-labelledby={id}
      onClick={() => onChange(!checked)}
      className={`relative h-7 w-12 shrink-0 rounded-full p-[3px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-broadcast-orange focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#111318] motion-reduce:transition-none ${checked ? 'bg-broadcast-orange' : 'bg-slate-300 dark:bg-white/15'}`}
    >
      <span className={`block h-[22px] w-[22px] rounded-full bg-white shadow-sm transition-transform motion-reduce:transition-none ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  );
}

function SettingCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-[1.4rem] border border-slate-200 bg-white p-5 shadow-[0_16px_44px_rgba(15,23,42,0.045)] dark:border-white/[0.08] dark:bg-[#111318] dark:shadow-[0_20px_50px_rgba(0,0,0,0.18)] sm:p-6 ${className}`}>
      {children}
    </section>
  );
}

function AgentToggleRow({
  id,
  label,
  description,
  checked,
  onChange,
  icon,
}: {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  icon: ReactNode;
}) {
  const labelId = `${id}-label`;
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50/80 p-4 dark:border-white/[0.07] dark:bg-white/[0.025]">
      <div className="flex min-w-0 items-start gap-3">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-broadcast-orange/10 text-broadcast-orange">{icon}</span>
        <div className="min-w-0">
          <p id={labelId} className="text-sm font-bold text-slate-900 dark:text-zinc-100">{label}</p>
          <p className="mt-0.5 max-w-lg text-xs leading-5 text-slate-500 dark:text-zinc-400">{description}</p>
        </div>
      </div>
      <SettingSwitch id={labelId} checked={checked} onChange={onChange} />
    </div>
  );
}

function SystemAgentRow({
  name,
  description,
  status,
  icon,
}: {
  name: string;
  description: string;
  status: string;
  icon: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 dark:border-white/[0.07] dark:bg-white/[0.025]">
      <div className="flex min-w-0 items-start gap-3">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-200/70 text-slate-500 dark:bg-white/[0.06] dark:text-zinc-300">{icon}</span>
        <div className="min-w-0">
          <p className="text-sm font-bold text-slate-800 dark:text-zinc-200">{name}</p>
          <p className="mt-0.5 text-xs leading-5 text-slate-500 dark:text-zinc-500">{description}</p>
        </div>
      </div>
      <span className="shrink-0 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[9px] font-extrabold tracking-[0.09em] text-slate-500 dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-400">{status}</span>
    </div>
  );
}

const thresholds = [
  { value: 5, label: 'All action', detail: 'More frequent updates' },
  { value: 7, label: 'Turning points', detail: 'Big swings & key plays' },
  { value: 9, label: 'Deciders only', detail: 'Only the biggest moments' },
] as const;

const detailLevels = [
  { value: 'concise', label: 'Quick' },
  { value: 'tactical', label: 'Tactical' },
  { value: 'stat_heavy', label: 'Stats' },
] as const;

export function SettingsPage() {
  const setCurrentPage = useReplayStore((s) => s.setCurrentPage);
  const settings = useReplayStore((s) => s.settings);
  const updateSettings = useReplayStore((s) => s.updateSettings);
  const matches = useReplayStore((s) => s.matches);
  const quickWatchList = useReplayStore((s) => s.quickWatchList);
  const toggleQuickWatch = useReplayStore((s) => s.toggleQuickWatch);
  const theme = useReplayStore((s) => s.theme);
  const toggleTheme = useReplayStore((s) => s.toggleTheme);
  const [newFavorite, setNewFavorite] = useState('');
  const favorites = settings.pins?.players || [];

  const addFavorite = () => {
    const name = newFavorite.trim();
    if (!name || favorites.some((favorite) => favorite.toLowerCase() === name.toLowerCase())) return;
    updateSettings({ pins: { ...settings.pins, players: [...favorites, name] } });
    setNewFavorite('');
  };

  const removeFavorite = (name: string) => {
    updateSettings({ pins: { ...settings.pins, players: favorites.filter((favorite) => favorite !== name) } });
  };

  return (
    <div className="mx-auto max-w-6xl space-y-7 pb-12 sm:space-y-9">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => setCurrentPage('home')}
          className="inline-flex min-h-10 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-broadcast-orange dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-200 dark:hover:bg-white/[0.08] motion-reduce:transition-none"
        >
          <ArrowLeft aria-hidden="true" size={16} />
          Back to Home
        </button>
        <p className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-zinc-400">
          <Check aria-hidden="true" size={14} className="text-emerald-500" /> Changes save on this device
        </p>
      </div>

      <header className="relative overflow-hidden rounded-[1.6rem] border border-slate-200 bg-white px-6 py-7 shadow-[0_18px_55px_rgba(15,23,42,0.06)] dark:border-white/[0.08] dark:bg-[#111318] sm:px-9 sm:py-9">
        <div className="absolute inset-y-0 left-0 w-1.5 bg-broadcast-orange" aria-hidden="true" />
        <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <p className="mb-3 flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.2em] text-broadcast-orange">
              <Radio aria-hidden="true" size={14} /> Your match-day setup
            </p>
            <h1 className="text-4xl font-black tracking-[-0.055em] text-slate-950 dark:text-white sm:text-5xl">Settings</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 dark:text-zinc-400 sm:text-base">
              Choose which moments reach you, how much context you want, and which matches Watchdog keeps an eye on.
            </p>
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            className="inline-flex min-h-11 shrink-0 items-center gap-2.5 self-start rounded-full border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-broadcast-orange dark:border-white/10 dark:bg-black/20 dark:text-zinc-200 dark:hover:bg-white/[0.08] sm:self-auto motion-reduce:transition-none"
          >
            {theme === 'dark' ? <Sun aria-hidden="true" size={16} className="text-amber-400" /> : <Moon aria-hidden="true" size={16} />}
            {theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          </button>
        </div>
      </header>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(340px,0.9fr)]">
        <div className="space-y-5">
          <SettingCard>
            <div className="mb-5">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-broadcast-orange/10 text-broadcast-orange"><Activity aria-hidden="true" size={19} /></div>
              <h2 className="text-lg font-extrabold tracking-tight text-slate-950 dark:text-white">AI agents</h2>
              <p className="mt-1 max-w-md text-sm leading-5 text-slate-500 dark:text-zinc-400">Control the three agents that shape the moments and explanations you see.</p>
            </div>
            <div className="space-y-2.5">
              <AgentToggleRow
                id="significance-agent"
                label="Significance & leverage scorer"
                description="Finds meaningful swings from the match state and recent events."
                checked={settings.significanceAgentEnabled}
                onChange={(significanceAgentEnabled) => updateSettings({ significanceAgentEnabled })}
                icon={<Activity aria-hidden="true" size={17} />}
              />
              <AgentToggleRow
                id="narrative-agent"
                label="Broadcast narrative analyst"
                description="Adds a concise, factual headline and why the moment matters."
                checked={settings.narrativeAgentEnabled}
                onChange={(narrativeAgentEnabled) => updateSettings({ narrativeAgentEnabled })}
                icon={<MessageSquareText aria-hidden="true" size={17} />}
              />
              <AgentToggleRow
                id="novice-agent"
                label="Novice fan explainer"
                description="Explains unfamiliar sports terms when they appear."
                checked={settings.novice}
                onChange={(novice) => updateSettings({ novice })}
                icon={<CircleHelp aria-hidden="true" size={17} />}
              />
            </div>
          </SettingCard>

          <SettingCard>
            <div className="mb-5">
              <h2 className="text-lg font-extrabold tracking-tight text-slate-950 dark:text-white">Alert tuning</h2>
              <p className="mt-1 text-sm leading-5 text-slate-500 dark:text-zinc-400">Choose how selective the scorer is and how much context appears.</p>
            </div>

            <fieldset disabled={!settings.significanceAgentEnabled} className={!settings.significanceAgentEnabled ? 'opacity-50' : ''}>
              <legend className="mb-3 text-sm font-bold text-slate-900 dark:text-zinc-200">How much action?</legend>
              <div className="grid gap-2 sm:grid-cols-3">
                {thresholds.map((option) => {
                  const selected = settings.threshold === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => updateSettings({ threshold: option.value })}
                      className={`min-h-[82px] rounded-xl border px-3 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-broadcast-orange motion-reduce:transition-none ${selected ? 'border-broadcast-orange bg-broadcast-orange/[0.08] ring-1 ring-broadcast-orange/20' : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 dark:border-white/[0.08] dark:bg-white/[0.02] dark:hover:bg-white/[0.05]'}`}
                    >
                      <span className={`block text-xs font-extrabold ${selected ? 'text-broadcast-orange' : 'text-slate-800 dark:text-zinc-200'}`}>{option.label}</span>
                      <span className="mt-1 block text-[11px] leading-4 text-slate-500 dark:text-zinc-500">{option.detail}</span>
                    </button>
                  );
                })}
              </div>
              {!settings.significanceAgentEnabled && <p className="mt-2 text-xs text-slate-500 dark:text-zinc-500">Turn on the significance scorer to tune which moments it selects.</p>}
            </fieldset>

            <fieldset disabled={!settings.narrativeAgentEnabled} className={`mt-6 border-t border-slate-100 pt-5 dark:border-white/[0.07] ${!settings.narrativeAgentEnabled ? 'opacity-50' : ''}`}>
              <p className="mb-3 text-sm font-bold text-slate-900 dark:text-zinc-200">Explanation style</p>
              <div className="flex flex-wrap gap-2" role="group" aria-label="Explanation style">
                {detailLevels.map((option) => {
                  const selected = settings.contentDepth === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => updateSettings({ contentDepth: option.value })}
                      className={`min-h-10 rounded-full border px-4 text-xs font-extrabold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-broadcast-orange motion-reduce:transition-none ${selected ? 'border-broadcast-orange bg-broadcast-orange text-white' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-zinc-300 dark:hover:bg-white/[0.07]'}`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
              {!settings.narrativeAgentEnabled && <p className="mt-2 text-xs text-slate-500 dark:text-zinc-500">Turn on the narrative analyst to choose its explanation style.</p>}
            </fieldset>
          </SettingCard>

          <SettingCard>
            <div className="mb-5">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.17em] text-slate-400">Follow the names you care about</p>
              <h2 className="mt-1 text-lg font-extrabold tracking-tight text-slate-950 dark:text-white">Favourite athletes & teams</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">Use names to prioritize relevant moments.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {favorites.length ? favorites.map((favorite) => (
                <span key={favorite} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 py-1.5 pl-3 pr-1.5 text-xs font-bold text-slate-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-200">
                  {favorite}
                  <button type="button" onClick={() => removeFavorite(favorite)} aria-label={`Remove ${favorite}`} className="rounded-full p-1 text-slate-400 transition hover:bg-slate-200 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-broadcast-orange dark:hover:bg-white/10 dark:hover:text-white motion-reduce:transition-none"><Trash2 aria-hidden="true" size={13} /></button>
                </span>
              )) : <p className="text-xs text-slate-500 dark:text-zinc-500">No favourites yet. Add a player or team below.</p>}
            </div>
            <form onSubmit={(event) => { event.preventDefault(); addFavorite(); }} className="mt-4 flex gap-2">
              <label htmlFor="favorite-name" className="sr-only">Athlete or team name</label>
              <input
                id="favorite-name"
                value={newFavorite}
                onChange={(event) => setNewFavorite(event.target.value)}
                placeholder="Add a name, e.g. Sinner"
                className="min-h-11 min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-broadcast-orange focus:ring-2 focus:ring-broadcast-orange/15 dark:border-white/10 dark:bg-black/20 dark:text-white dark:placeholder:text-zinc-600"
              />
              <button type="submit" disabled={!newFavorite.trim()} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-bold text-white transition hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-broadcast-orange disabled:cursor-not-allowed disabled:opacity-45 dark:bg-white dark:text-slate-900 dark:hover:bg-zinc-200 motion-reduce:transition-none"><Plus aria-hidden="true" size={16} />Add</button>
            </form>
          </SettingCard>
        </div>

        <div className="space-y-5">
          <SettingCard>
            <div className="mb-5">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-white/[0.06] dark:text-zinc-300"><ShieldCheck aria-hidden="true" size={19} /></div>
              <h2 className="text-lg font-extrabold tracking-tight text-slate-950 dark:text-white">System agents</h2>
              <p className="mt-1 text-sm leading-5 text-slate-500 dark:text-zinc-400">These run automatically to keep recaps useful and outputs grounded.</p>
            </div>
            <div className="space-y-2.5">
              <SystemAgentRow
                name="Catch-up synthesizer"
                description="Builds a factual recap when you return after 10 seconds away."
                status="ON DEMAND"
                icon={<Clock3 aria-hidden="true" size={16} />}
              />
              <SystemAgentRow
                name="FactGuard"
                description="Checks names, scores and laps against match data; unsupported copy falls back to a deterministic line."
                status="ALWAYS ON"
                icon={<ShieldCheck aria-hidden="true" size={16} />}
              />
            </div>
          </SettingCard>

          <SettingCard>
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"><Radio aria-hidden="true" size={19} /></div>
                <h2 className="text-lg font-extrabold tracking-tight text-slate-950 dark:text-white">QuickWatch</h2>
                <p className="mt-1 text-sm leading-5 text-slate-500 dark:text-zinc-400">Choose the matches to monitor while you watch.</p>
              </div>
              <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-extrabold text-emerald-700 dark:text-emerald-400">{quickWatchList.length} on</span>
            </div>
            <div className="space-y-2">
              {matches.map((match) => {
                const selected = quickWatchList.includes(match.id);
                const labelId = `quickwatch-${match.id}`;
                return (
                  <button
                    key={match.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => toggleQuickWatch(match.id)}
                    className={`flex min-h-[76px] w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-broadcast-orange motion-reduce:transition-none ${selected ? 'border-emerald-500/30 bg-emerald-500/[0.045]' : 'border-slate-200 bg-slate-50/70 hover:bg-slate-100 dark:border-white/[0.07] dark:bg-white/[0.02] dark:hover:bg-white/[0.05]'}`}
                  >
                    <span className="min-w-0">
                      <span className="mb-1 block text-[9px] font-extrabold uppercase tracking-[0.14em] text-broadcast-orange">{match.sport === 'f1' ? 'Formula 1' : match.sport}</span>
                      <span id={labelId} className="block truncate text-sm font-extrabold text-slate-900 dark:text-zinc-100">{match.title}</span>
                      <span className="mt-0.5 block truncate text-xs text-slate-500 dark:text-zinc-500">{match.tournament}</span>
                    </span>
                    <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-colors ${selected ? 'border-emerald-600 bg-emerald-600 text-white dark:border-emerald-500 dark:bg-emerald-500' : 'border-slate-300 bg-white text-transparent dark:border-white/20 dark:bg-black/20'}`} aria-hidden="true"><Check size={14} /></span>
                  </button>
                );
              })}
            </div>
            <p className="mt-4 text-xs leading-5 text-slate-500 dark:text-zinc-500">QuickWatch affects which background match alerts are eligible while the replay plays.</p>
          </SettingCard>

          <div className="rounded-[1.4rem] border border-broadcast-orange/20 bg-gradient-to-br from-broadcast-orange/[0.11] via-broadcast-orange/[0.04] to-transparent p-5 dark:border-broadcast-orange/20 sm:p-6">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-broadcast-orange text-white shadow-lg shadow-broadcast-orange/20"><Check aria-hidden="true" size={18} /></span>
              <div>
                <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">Made for the moment</h2>
                <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-zinc-400">Your alert preferences are applied to the replay in real time. Change them whenever the match gets intense.</p>
                <button type="button" onClick={() => setCurrentPage('home')} className="mt-4 inline-flex items-center gap-1.5 text-xs font-extrabold text-broadcast-orange hover:gap-2.5 focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-broadcast-orange motion-reduce:transition-none">Back to live matches<ChevronRight aria-hidden="true" size={14} /></button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
