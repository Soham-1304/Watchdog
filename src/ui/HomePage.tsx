import { Check, ChevronLeft, ChevronRight, CirclePlay, Plus, Sparkles, X } from 'lucide-react';
import { useState } from 'react';
import { useReplayStore } from '../store/useReplayStore';
import type { MatchEvent, MatchMetadata } from '../types';

const sportArtwork: Record<MatchMetadata['sport'], string> = {
  tennis: '/images/tennis-editorial.jpg',
  f1: '/images/f1-editorial.jpg',
  cricket: '/images/cricket-editorial.jpg',
};

const sportLabels: Record<MatchMetadata['sport'], string> = {
  tennis: 'Tennis',
  f1: 'Formula 1',
  cricket: 'Cricket',
};

type MatchSnapshot = {
  scoreLine: string;
  detailLine: string;
};

function getMatchSnapshot(match: MatchMetadata, event?: MatchEvent): MatchSnapshot {
  if (!event) {
    return { scoreLine: 'Awaiting first step', detailLine: match.venue || match.tournament };
  }

  if (event.sport === 'cricket' && 'score' in event.state) {
    const state = event.state;
    return {
      scoreLine: `${state.score}/${state.wickets}`,
      detailLine: `${state.overs} overs${state.target ? ` · Target ${state.target}` : ''}`,
    };
  }

  if (event.sport === 'tennis' && 'player1' in event.state) {
    const state = event.state;
    return {
      scoreLine: `${state.player1.setsWon} – ${state.player2.setsWon} sets`,
      detailLine: `Set ${state.currentSet} · ${state.gameScore}${state.isTiebreak ? ' · Tiebreak' : ''}`,
    };
  }

  if (event.sport === 'f1' && 'lap' in event.state) {
    const state = event.state;
    const status = state.status === 'GREEN' ? 'Green flag' : state.status.replace('_', ' ');
    return {
      scoreLine: `Lap ${state.lap}/${state.totalLaps}`,
      detailLine: `${state.leader} leads · ${status}`,
    };
  }

  return { scoreLine: 'Live now', detailLine: match.venue || match.tournament };
}

function QuickWatchButton({
  match,
  active,
  onToggle,
  compact = false,
  prominent = false,
}: {
  match: MatchMetadata;
  active: boolean;
  onToggle: () => void;
  compact?: boolean;
  prominent?: boolean;
}) {
  const theme = useReplayStore((s) => s.theme);

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={`${active ? 'Remove from' : 'Add to'} QuickWatch: ${match.title}`}
      aria-pressed={active}
      title={active ? 'Remove from QuickWatch' : 'Add to QuickWatch'}
      data-tour={prominent ? 'home-quickwatch' : undefined}
      style={compact || prominent ? {
        backgroundImage: active
          ? theme === 'dark'
            ? 'linear-gradient(120deg, rgba(16,185,129,0.075), rgba(5,150,105,0.025))'
            : 'linear-gradient(120deg, rgba(16,185,129,0.065), rgba(5,150,105,0.018))'
          : theme === 'dark'
            ? 'linear-gradient(120deg, rgba(244,63,94,0.07), rgba(127,29,29,0.025))'
            : 'linear-gradient(120deg, rgba(244,63,94,0.055), rgba(127,29,29,0.018))',
        backgroundColor: theme === 'dark' ? 'rgba(0,0,0,0.28)' : '#ffffff',
        borderColor: active
          ? (theme === 'dark' ? 'rgba(52,211,153,0.14)' : 'rgba(5,150,105,0.12)')
          : (theme === 'dark' ? 'rgba(251,113,133,0.14)' : 'rgba(225,29,72,0.12)'),
        color: active
          ? (theme === 'dark' ? '#c7d8cf' : '#426653')
          : (theme === 'dark' ? '#ddc9ce' : '#805761'),
      } : undefined}
      className={`inline-flex shrink-0 items-center justify-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-broadcast-orange focus-visible:ring-offset-2 focus-visible:ring-offset-[#090A0C] ${
        compact
          ? 'h-10 gap-2 px-3 text-xs font-bold hover:brightness-105'
          : prominent
            ? 'h-12 w-[148px] gap-2.5 px-4 text-sm font-extrabold hover:brightness-105'
          : active
            ? 'gap-2 border-emerald-400/40 bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-200 hover:bg-emerald-400/15'
            : 'gap-2 border-white/20 bg-black/25 px-4 py-2 text-sm font-semibold text-white hover:border-white/40 hover:bg-black/40'
      }`}
    >
      {compact || prominent ? (
        <span
          className={`flex items-center justify-center rounded-full ${prominent ? 'h-5 w-5' : 'h-[19px] w-[19px]'}`}
          style={{
            backgroundImage: active
              ? theme === 'dark'
                ? 'linear-gradient(145deg, rgba(110,169,137,0.38), rgba(20,72,48,0.25))'
                : 'linear-gradient(145deg, rgba(127,177,144,0.34), rgba(55,119,81,0.18))'
              : theme === 'dark'
                ? 'linear-gradient(145deg, rgba(190,112,128,0.34), rgba(104,35,48,0.25))'
                : 'linear-gradient(145deg, rgba(201,128,142,0.3), rgba(138,51,68,0.16))',
            color: active
              ? (theme === 'dark' ? '#d1e0d7' : '#355843')
              : (theme === 'dark' ? '#ead1d6' : '#764550'),
          }}
        >
          {active ? <Check aria-hidden="true" size={12} strokeWidth={2.7} /> : <X aria-hidden="true" size={12} strokeWidth={2.7} />}
        </span>
      ) : active ? <Check aria-hidden="true" size={16} /> : <Plus aria-hidden="true" size={16} />}
      <span>QuickWatch</span>
    </button>
  );
}

function LiveMatchCard({
  match,
  snapshot,
  signal,
  isQuickWatch,
  onWatch,
  onToggleQuickWatch,
}: {
  match: MatchMetadata;
  snapshot: MatchSnapshot;
  signal?: string;
  isQuickWatch: boolean;
  onWatch: () => void;
  onToggleQuickWatch: () => void;
}) {
  const theme = useReplayStore((s) => s.theme);

  return (
    <article className="flex min-h-[382px] flex-col overflow-hidden rounded-[1.35rem] border border-slate-200 bg-white shadow-[0_12px_36px_rgba(18,22,32,0.07)] transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-[0_20px_48px_rgba(18,22,32,0.12)] dark:border-white/10 dark:bg-[#111318] dark:shadow-[0_16px_40px_rgba(0,0,0,0.24)] dark:hover:border-white/20 motion-reduce:transition-none motion-reduce:hover:transform-none">
      <button
        type="button"
        onClick={onWatch}
        className="relative flex min-h-[242px] flex-1 flex-col justify-between overflow-hidden p-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-broadcast-orange"
        aria-label={`Watch ${match.title}`}
      >
        <img src={sportArtwork[match.sport]} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/15 to-black/90" aria-hidden="true" />

        <div className="relative flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/45 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-white backdrop-blur-sm">
            <span className="h-2 w-2 rounded-full bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.9)]" />Live
          </span>
          <span className="rounded-full border border-white/15 bg-black/45 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-white/90 backdrop-blur-sm">{sportLabels[match.sport]}</span>
        </div>

        <div className="relative space-y-2 text-white">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/65">{match.tournament}</p>
          <h3 className="max-w-[28rem] text-2xl font-extrabold leading-tight tracking-[-0.035em] sm:text-[1.7rem]">{match.title}</h3>
          {signal && <p className="line-clamp-2 max-w-[30rem] text-sm font-medium leading-5 text-white/75"><span className="mr-1 text-[10px] font-extrabold uppercase tracking-[.12em] text-orange-300">AI signal</span>{signal}</p>}
        </div>
      </button>

      <div
        className="flex items-center justify-between gap-3 border-t px-5 py-4"
        style={{
          backgroundColor: theme === 'dark' ? '#0a0c10' : '#f8fafc',
          borderColor: theme === 'dark' ? 'rgba(255,255,255,0.07)' : '#e2e8f0',
        }}
      >
        <div className="min-w-0">
          <p className="truncate text-sm font-extrabold tracking-tight text-slate-900 dark:text-white">{snapshot.scoreLine}</p>
          <p className="mt-1 truncate text-xs font-medium text-slate-500 dark:text-zinc-400">{snapshot.detailLine}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <QuickWatchButton match={match} active={isQuickWatch} onToggle={onToggleQuickWatch} compact />
          <button
            type="button"
            onClick={onWatch}
            className="inline-flex h-10 items-center gap-2 rounded-full bg-broadcast-orange px-4 text-sm font-extrabold text-white shadow-[0_8px_22px_rgba(255,82,0,0.22)] transition hover:bg-broadcast-orangeHover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-broadcast-orange focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#111318] motion-reduce:transition-none"
          >
            <span className="whitespace-nowrap">Watch</span><ChevronRight aria-hidden="true" size={15} />
          </button>
        </div>
      </div>
    </article>
  );
}

export function HomePage() {
  const [manualFeatureId, setManualFeatureId] = useState<string | null>(null);
  const matches = useReplayStore((s) => s.matches);
  const events = useReplayStore((s) => s.events);
  const eventResults = useReplayStore((s) => s.eventResults);
  const firedEventIds = useReplayStore((s) => s.firedEventIds);
  const activeMatchId = useReplayStore((s) => s.activeMatchId);
  const switchMatch = useReplayStore((s) => s.switchMatch);
  const setCurrentPage = useReplayStore((s) => s.setCurrentPage);
  const play = useReplayStore((s) => s.play);
  const quickWatchList = useReplayStore((s) => s.quickWatchList);
  const toggleQuickWatch = useReplayStore((s) => s.toggleQuickWatch);
  const theme = useReplayStore((s) => s.theme);
  const significanceAgentEnabled = useReplayStore((s) => s.settings.significanceAgentEnabled);
  const narrativeAgentEnabled = useReplayStore((s) => s.settings.narrativeAgentEnabled);

  const visibleEvents = events.filter((event) => firedEventIds.has(event.id));
  const latestEventByMatch = new Map<string, MatchEvent>();
  const latestSignalByMatch = new Map<string, MatchEvent>();
  for (const event of visibleEvents) {
    const previous = latestEventByMatch.get(event.match_id);
    if (!previous || event.t > previous.t) latestEventByMatch.set(event.match_id, event);
    const result = eventResults[event.id];
    const previousSignal = latestSignalByMatch.get(event.match_id);
    if (result?.narrative && result.significance && result.significance.importance_score >= 7 && (!previousSignal || event.t > previousSignal.t)) {
      latestSignalByMatch.set(event.match_id, event);
    }
  }

  const keyMoments = visibleEvents
    .filter((event) => {
      const result = eventResults[event.id];
      return significanceAgentEnabled && Boolean(result?.narrative) && (result?.significance?.importance_score ?? 0) >= 7;
    })
    .sort((a, b) => {
      const scoreDifference = (eventResults[b.id]?.significance?.importance_score ?? 0) - (eventResults[a.id]?.significance?.importance_score ?? 0);
      return scoreDifference || b.t - a.t;
    })
    .slice(0, 3);

  const featuredEvent = visibleEvents
    .filter((event) => significanceAgentEnabled && eventResults[event.id]?.narrative && (eventResults[event.id]?.significance?.importance_score ?? 0) >= 7)
    .sort((a, b) => b.t - a.t)[0];
  const recommendedMatch = matches.find((match) => match.id === featuredEvent?.match_id)
    || matches.find((match) => match.id === activeMatchId)
    || matches[0];
  const featuredMatch = matches.find((match) => match.id === manualFeatureId) || recommendedMatch;

  const openMatch = (matchId: string) => {
    switchMatch(matchId);
    setCurrentPage('match');
    play();
  };

  const moveFeature = (direction: -1 | 1) => {
    if (!featuredMatch || matches.length < 2) return;
    const currentIndex = matches.findIndex((match) => match.id === featuredMatch.id);
    const nextIndex = (currentIndex + direction + matches.length) % matches.length;
    setManualFeatureId(matches[nextIndex].id);
  };

  if (!featuredMatch) return null;

  const featuredMatchEvent = latestEventByMatch.get(featuredMatch.id);
  const featuredMatchMoment = visibleEvents
    .filter((event) => significanceAgentEnabled && event.match_id === featuredMatch.id && eventResults[event.id]?.narrative && (eventResults[event.id]?.significance?.importance_score ?? 0) >= 7)
    .sort((a, b) => b.t - a.t)[0];
  const featuredSnapshot = getMatchSnapshot(featuredMatch, featuredMatchEvent);
  const featuredAlert = featuredMatchMoment ? eventResults[featuredMatchMoment.id] : undefined;
  const featuredDetail = (narrativeAgentEnabled && featuredAlert?.narrative?.headline && `AI signal · ${featuredAlert.narrative.headline}`)
    || (featuredMatchEvent && eventResults[featuredMatchEvent.id]?.narrative?.headline && `AI signal · ${eventResults[featuredMatchEvent.id].narrative?.headline}`)
    || (visibleEvents.length ? 'AI signal appears when the moment qualifies.' : 'Walkthrough ready · advance events to reveal AI signals.');

  return (
    <div className="space-y-11 pb-12 sm:space-y-14">
      <section aria-labelledby="home-feature-title" data-tour="home-feature">
        <div className="relative isolate h-[560px] overflow-hidden rounded-[1.75rem] border border-slate-200 bg-[#08090b] shadow-[0_28px_80px_rgba(13,18,26,0.20)] dark:border-white/10 sm:h-[540px]">
          <img src={sportArtwork[featuredMatch.sport]} alt="" fetchPriority="high" className="absolute inset-0 h-full w-full object-cover object-center" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#050608] via-[#050608]/85 to-[#050608]/10" aria-hidden="true" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050608]/75 via-transparent to-black/10" aria-hidden="true" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_18%_50%,rgba(255,82,0,0.12),transparent_44%)]" aria-hidden="true" />

          <div className="relative flex h-full items-center p-5 sm:p-9 lg:p-12">
            <div className="w-full max-w-[820px] space-y-4 sm:space-y-5">
              <div className="flex h-8 min-w-0 items-center gap-2.5 overflow-hidden">
                <span className="inline-flex items-center gap-2 rounded-full bg-red-600 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.15em] text-white shadow-[0_8px_24px_rgba(220,38,38,0.25)]">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white motion-reduce:animate-none" />Live now
                </span>
                <span style={{ color: '#ffffff' }} className="rounded-full border border-white/20 bg-black/30 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-white/85 backdrop-blur-sm">{sportLabels[featuredMatch.sport]}</span>
                <span style={{ color: 'rgba(255,255,255,0.72)' }} className="min-w-0 truncate text-xs font-semibold text-white/60">{featuredMatch.tournament}</span>
              </div>

              <div className="space-y-2 sm:space-y-3">
                <h1 id="home-feature-title" className="line-clamp-2 min-h-[2em] max-w-[44rem] text-4xl font-black leading-[0.98] tracking-[-0.055em] text-white sm:text-5xl lg:text-[3.8rem]">{featuredMatch.title}</h1>
                <p style={{ color: 'rgba(255,255,255,0.78)' }} className="line-clamp-2 h-12 max-w-[39rem] text-sm font-medium leading-6 text-white/70 sm:text-base">{featuredDetail}</p>
              </div>

              <div className="flex min-h-[84px] flex-col justify-center gap-2 rounded-xl border border-white/15 bg-black/50 px-4 py-3 text-white shadow-lg backdrop-blur-md" style={{ width: 'min(100%, 360px)' }}>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-white/50">Live state</span>
                  <span className="text-xl font-black tracking-tight">{featuredSnapshot.scoreLine}</span>
                </div>
                <div className="flex items-center justify-between gap-3 border-t border-white/10 pt-2">
                  <span className="min-w-0 truncate text-xs font-semibold text-white/70">{featuredSnapshot.detailLine}</span>
                  {featuredAlert?.significance && <span className="shrink-0 rounded-full bg-broadcast-orange/15 px-2.5 py-1 text-[10px] font-extrabold text-orange-200">Hotness {featuredAlert.significance.importance_score}</span>}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => openMatch(featuredMatch.id)}
                  className="inline-flex h-12 w-[148px] items-center justify-center gap-2.5 rounded-full bg-broadcast-orange px-4 text-sm font-extrabold text-white shadow-[0_12px_34px_rgba(255,82,0,0.32)] transition hover:-translate-y-0.5 hover:bg-broadcast-orangeHover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-broadcast-orange motion-reduce:transition-none"
                >
                  <CirclePlay aria-hidden="true" size={18} />Watch live
                </button>
                <QuickWatchButton match={featuredMatch} active={quickWatchList.includes(featuredMatch.id)} onToggle={() => toggleQuickWatch(featuredMatch.id)} prominent />
              </div>
            </div>
          </div>

          {matches.length > 1 && (
            <>
              <div className="absolute right-4 top-4 z-10 flex items-center gap-1.5 sm:right-5 sm:top-5 sm:gap-2">
                <button
                  type="button"
                  onClick={() => moveFeature(-1)}
                  aria-label="Previous featured match"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/35 text-white/90 shadow-lg backdrop-blur-sm transition-colors hover:bg-black/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:h-10 sm:w-10 motion-reduce:transition-none"
                >
                  <ChevronLeft aria-hidden="true" size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => moveFeature(1)}
                  aria-label="Next featured match"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/35 text-white/90 shadow-lg backdrop-blur-sm transition-colors hover:bg-black/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:h-10 sm:w-10 motion-reduce:transition-none"
                >
                  <ChevronRight aria-hidden="true" size={18} />
                </button>
              </div>
              <div className="absolute bottom-5 right-5 z-10 flex items-center gap-1.5 rounded-full border border-white/10 bg-black/30 px-2.5 py-2 backdrop-blur-sm" role="group" aria-label="Choose featured match">
                {matches.map((match) => (
                  <button
                    key={match.id}
                    type="button"
                    onClick={() => setManualFeatureId(match.id)}
                    aria-label={`Show ${match.title}`}
                    aria-pressed={featuredMatch.id === match.id}
                    className={`h-1.5 rounded-full transition-[width,background-color] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${featuredMatch.id === match.id ? 'w-6 bg-broadcast-orange' : 'w-1.5 bg-white/45 hover:bg-white/80'} motion-reduce:transition-none`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      <section aria-labelledby="live-matches-title" className="space-y-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="mb-1.5 text-[10px] font-extrabold uppercase tracking-[0.18em] text-broadcast-orange">Across your sports</p>
            <h2 id="live-matches-title" className="text-2xl font-black tracking-[-0.04em] text-slate-950 dark:text-white sm:text-3xl">Live matches</h2>
          </div>
          <span className="pb-1 text-sm font-semibold text-slate-500 dark:text-zinc-400">{matches.length} streams</span>
        </div>

        <div className="grid gap-4 xl:gap-5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 20rem), 1fr))' }}>
          {matches.map((match) => {
            const recentEvent = latestEventByMatch.get(match.id);
            return (
              <LiveMatchCard
                key={match.id}
                match={match}
                snapshot={getMatchSnapshot(match, recentEvent)}
                signal={latestSignalByMatch.get(match.id) ? eventResults[latestSignalByMatch.get(match.id)!.id]?.narrative?.headline : undefined}
                isQuickWatch={quickWatchList.includes(match.id)}
                onWatch={() => openMatch(match.id)}
                onToggleQuickWatch={() => toggleQuickWatch(match.id)}
              />
            );
          })}
        </div>
      </section>

      <section aria-labelledby="key-moments-title" className="space-y-5" data-tour="home-highlights">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="mb-1.5 text-[10px] font-extrabold uppercase tracking-[0.18em] text-broadcast-orange">Cutaway picks up the signal</p>
            <h2 id="key-moments-title" className="text-2xl font-black tracking-[-0.04em] text-slate-950 dark:text-white sm:text-3xl">Key moments</h2>
          </div>
          {keyMoments.length > 0 && <span className="pb-1 text-sm font-semibold text-slate-500 dark:text-zinc-400">{keyMoments.length} pivotal updates</span>}
        </div>

        {keyMoments.length === 0 ? (
          <div className="flex min-h-28 items-center gap-4 rounded-2xl border border-dashed border-slate-300 bg-white/60 px-5 py-6 dark:border-white/15 dark:bg-white/[0.025] sm:px-7">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-broadcast-orange/10 text-broadcast-orange"><Sparkles aria-hidden="true" size={19} /></span>
            <div>
              <p className="font-bold text-slate-900 dark:text-white">{significanceAgentEnabled ? 'Moments will appear as the action unfolds.' : 'Significance scoring is paused.'}</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">{significanceAgentEnabled ? 'We’ll surface the turns worth looking up for.' : 'Turn on the Significance & leverage scorer in Settings to surface key moments.'}</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 19rem), 1fr))' }}>
            {keyMoments.map((event) => {
              const match = matches.find((candidate) => candidate.id === event.match_id);
              const result = eventResults[event.id];
              if (!match || !result?.narrative || !result.significance) return null;
              return (
                <article
                  key={event.id}
                  className="flex min-h-[190px] max-w-[560px] flex-col justify-between rounded-2xl border p-5 shadow-sm"
                  style={{
                    backgroundColor: theme === 'dark' ? '#111317' : '#ffffff',
                    borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
                    maxWidth: '560px',
                  }}
                >
                  <div>
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <span className="line-clamp-1 text-[10px] font-extrabold uppercase tracking-[0.15em] text-slate-500 dark:text-zinc-400">{sportLabels[event.sport]} · {match.title}</span>
                      <span className="shrink-0 rounded-full bg-broadcast-orange/10 px-2.5 py-1 text-[10px] font-extrabold text-broadcast-orange">Hotness {result.significance.importance_score}</span>
                    </div>
                    <h3 className="line-clamp-2 text-[15px] font-bold leading-6 tracking-[-0.015em] text-slate-900 dark:text-white">{result.narrative.headline}</h3>
                    <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500 dark:text-zinc-400">{result.narrative.why_it_matters}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => openMatch(match.id)}
                    className="mt-4 inline-flex w-fit items-center gap-1.5 text-xs font-extrabold text-broadcast-orange transition hover:gap-2.5 focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-broadcast-orange motion-reduce:transition-none"
                  >
                    Watch this match<ChevronRight aria-hidden="true" size={14} />
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
