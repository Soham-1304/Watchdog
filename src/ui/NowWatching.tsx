import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Check, Expand, Minimize2, Pause, Play } from 'lucide-react';
import { useReplayStore } from '../store/useReplayStore';
import { AlertCard } from './AlertCard';
import { CatchUpCard } from './CatchUpCard';
import { NoviceCue } from './NoviceCue';
import type { CricketState, F1State, MatchEvent, MatchMetadata, TennisState } from '../types';

const DotField = lazy(() => import('./DotField'));
const Hyperspeed = lazy(() => import('./Hyperspeed'));
const MagicRings = lazy(() => import('./MagicRings'));

function stateLine(match: MatchMetadata, event?: MatchEvent) {
  if (!event) return { primary: '—', secondary: 'Waiting for the first update' };
  if (match.sport === 'cricket') {
    const s = event.state as CricketState;
    return { primary: `${s.score}/${s.wickets}`, secondary: `${s.battingTeam} · ${s.overs} overs${s.target ? ` · Target ${s.target}` : ''}` };
  }
  if (match.sport === 'f1') {
    const s = event.state as F1State;
    const flag = s.status === 'GREEN' ? 'Green flag' : s.status.replace('_', ' ').toLowerCase();
    return { primary: `Lap ${s.lap}/${s.totalLaps}`, secondary: `${s.leader} leads · ${flag}` };
  }
  const s = event.state as TennisState;
  return { primary: `${s.player1.setsWon} – ${s.player2.setsWon} sets`, secondary: `Set ${s.currentSet} · ${s.gameScore}${s.isTiebreak ? ' · Tiebreak' : ''}` };
}

function sportName(sport: MatchMetadata['sport']) {
  return sport === 'f1' ? 'Formula 1' : sport === 'tennis' ? 'Tennis' : 'Cricket';
}

export function NowWatching() {
  const activeMatchId = useReplayStore((s) => s.activeMatchId);
  const matches = useReplayStore((s) => s.matches);
  const events = useReplayStore((s) => s.events);
  const firedEventIds = useReplayStore((s) => s.firedEventIds);
  const eventResults = useReplayStore((s) => s.eventResults);
  const quickWatchList = useReplayStore((s) => s.quickWatchList);
  const isPlaying = useReplayStore((s) => s.isPlaying);
  const togglePlay = useReplayStore((s) => s.togglePlay);
  const switchMatch = useReplayStore((s) => s.switchMatch);
  const setCurrentPage = useReplayStore((s) => s.setCurrentPage);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sync = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', sync);
    return () => document.removeEventListener('fullscreenchange', sync);
  }, []);

  const activeMatch = matches.find((match) => match.id === activeMatchId);
  const latestMatchEvent = useMemo(() => events
    .filter((event) => event.match_id === activeMatchId && firedEventIds.has(event.id))
    .sort((a, b) => b.t - a.t)[0], [events, firedEventIds, activeMatchId]);
  const latestResult = latestMatchEvent ? eventResults[latestMatchEvent.id] : undefined;
  const score = activeMatch ? stateLine(activeMatch, latestMatchEvent) : null;

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await stageRef.current?.requestFullscreen();
    } catch (error) {
      console.error('Fullscreen toggle error:', error);
    }
  };

  if (!activeMatch || !score) return null;

  const otherQuickWatchMatches = matches.filter((match) => match.id !== activeMatch.id && quickWatchList.includes(match.id));

  return (
    <div className="mx-auto max-w-[1440px] space-y-4 pb-12 text-slate-900 dark:text-zinc-100">
      <button onClick={() => setCurrentPage('home')} className="inline-flex items-center gap-2 rounded-lg text-sm font-semibold text-slate-500 transition hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-broadcast-orange dark:text-zinc-400 dark:hover:text-white">
        <ArrowLeft size={16} /> All matches
      </button>

      <section aria-label={`${activeMatch.title} stream`}>
        <div
          ref={stageRef}
          data-tour="stream-player"
          className={`relative flex h-[300px] w-full flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-[#07090d] p-4 text-white shadow-2xl sm:h-[420px] sm:rounded-[1.4rem] sm:p-7 xl:aspect-video xl:h-auto xl:min-h-[420px] ${isFullscreen ? '!fixed !inset-0 !z-50 !h-screen !max-h-none !w-screen !aspect-auto !min-h-0 !rounded-none !border-none p-5 sm:p-10' : ''}`}
        >
          {activeMatch.sport === 'f1' && (
            <div aria-hidden="true" className="absolute inset-0 z-0">
              <Suspense fallback={null}>
                <Hyperspeed
                  curve="winding" curvature={1} speed={1} boost={3} fov={90} boostFov={130}
                  lanes={3} roadWidth={10} medianWidth={2} density={40} trailLength={1}
                  lightSize={1} poles={20} dust={100} glow={0.6} reflections={0.5}
                  roadOpacity={0.1} steer={0.35}
                  tailColors={['#d856bf', '#6750a2', '#c247ac']}
                  headColors={['#03b3c3', '#0e5ea5', '#324555']}
                  poleColors={['#03b3c3']} interactive roadColor="#08080a" lineColor="#25252d"
                />
              </Suspense>
            </div>
          )}
          {activeMatch.sport === 'tennis' && (
            <div aria-hidden="true" className="absolute inset-0 z-0">
              <Suspense fallback={null}>
                <DotField
                  gradientFrom="#5227FF"
                  gradientTo="#FF9FFC"
                  dotRadius={1.5}
                  dotSpacing={14}
                  cursorRadius={240}
                  bulgeStrength={0.6}
                  glowRadius={160}
                  opacity={0.42}
                  maxDevicePixelRatio={1.5}
                />
              </Suspense>
            </div>
          )}
          {activeMatch.sport === 'cricket' && (
            <div aria-hidden="true" className="absolute inset-0 z-0 overflow-hidden bg-[#07090d]">
              <Suspense fallback={null}>
                <MagicRings
                  color="#66d89a"
                  colorTwo="#ff7a31"
                  motion="breathe"
                  ringCount={5}
                  speed={0.45}
                  lineThickness={1.4}
                  glow={0.55}
                  baseRadius={0.26}
                  radiusStep={0.105}
                  expansion={0.035}
                  opacity={0.58}
                  followMouse={false}
                  clickBurst={false}
                  intro
                  theme="dark"
                  maxDevicePixelRatio={1.5}
                />
              </Suspense>
            </div>
          )}
          <header className="relative z-10 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-white/55 sm:text-sm">{activeMatch.venue || activeMatch.tournament}</p>
              <p className="mt-1 truncate text-sm font-bold sm:text-base">{activeMatch.title}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-red-400/20 bg-red-400/[0.08] px-2.5 py-1.5 text-[9px] font-extrabold uppercase tracking-[.13em] text-red-200/90"><span className="h-1.5 w-1.5 rounded-full bg-red-400 shadow-[0_0_10px_rgba(248,113,113,.8)]" />Live</span>
              <button onClick={togglePlay} aria-label={isPlaying ? 'Pause event updates' : 'Resume event updates'} className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/[0.06] text-white/80 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-broadcast-orange">
                {isPlaying ? <Pause size={15} /> : <Play size={15} fill="currentColor" />}
              </button>
              <button onClick={toggleFullscreen} aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'} className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/[0.06] text-white/80 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-broadcast-orange">
                {isFullscreen ? <Minimize2 size={16} /> : <Expand size={16} />}
              </button>
            </div>
          </header>

          <div className={activeMatch.sport === 'f1' ? 'absolute inset-0 z-10 flex items-center justify-center px-4 text-center' : 'relative z-10 mx-auto w-full max-w-3xl text-center'} aria-live="polite">
            <div className={activeMatch.sport === 'f1' ? 'inline-block max-w-full rounded-2xl border border-white/[0.09] bg-black/[0.24] px-6 py-5 text-center shadow-[0_12px_42px_rgba(0,0,0,.16)] backdrop-blur-md sm:px-8 sm:py-6' : ''}>
              <p className="mb-3 text-[10px] font-bold uppercase tracking-[.2em] text-white/35">{sportName(activeMatch.sport)} · live state</p>
              <p className="text-[clamp(2rem,6vw,4.25rem)] font-black leading-none tracking-[-.055em]">{score.primary}</p>
              <p className="mt-3 text-sm font-medium text-white/55 sm:text-base">{score.secondary}</p>
            </div>
          </div>
          {activeMatch.sport !== 'f1' && (
            <>
              <div className="relative z-10 flex items-center justify-between gap-3 border-t border-white/10 pt-4 sm:pt-5">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[.16em] text-white/40">{activeMatch.tournament}</p>
                  <p className="mt-1 truncate text-xs text-white/55">{activeMatch.subtitle}</p>
                </div>
                {quickWatchList.includes(activeMatch.id) && <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-300/15 bg-emerald-300/[0.07] px-2.5 py-1.5 text-[10px] font-semibold text-emerald-100/75"><Check size={12} /> QuickWatch</span>}
              </div>
            </>
          )}

          <CatchUpCard />
          <NoviceCue />
          <AlertCard />
        </div>
      </section>

      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
        <article data-tour="stream-explainer" className="min-w-0 rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-white/10 dark:bg-[#111318]" aria-live="polite">
          {latestMatchEvent ? (
            <>
              <p className="text-[9px] font-extrabold uppercase tracking-[.15em] text-broadcast-orange">{latestResult?.narrative ? 'AI signal' : 'Latest update'}{latestResult?.significance ? ` · Hotness ${latestResult.significance.importance_score}` : ''}</p>
              <p className="mt-1 line-clamp-1 text-sm font-bold text-slate-900 dark:text-white">{latestResult?.narrative?.headline || latestMatchEvent.headline}</p>
              {latestResult?.narrative?.why_it_matters && <p className="mt-1 line-clamp-1 text-xs text-slate-500 dark:text-zinc-400">{latestResult.narrative.why_it_matters}</p>}
            </>
          ) : <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">Event context will appear as the match unfolds.</p>}
        </article>

        {otherQuickWatchMatches.length > 0 && (
          <nav aria-label="QuickWatch streams" className="flex flex-wrap items-center gap-2">
            {otherQuickWatchMatches.map((match) => (
              <button key={match.id} onClick={() => switchMatch(match.id)} className="inline-flex h-10 items-center gap-2 rounded-full border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:border-broadcast-orange/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-broadcast-orange dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />{sportName(match.sport)}
              </button>
            ))}
          </nav>
        )}
      </div>
    </div>
  );
}
