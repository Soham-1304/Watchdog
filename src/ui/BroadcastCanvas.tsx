import { useState } from 'react';
import { useReplayStore } from '../store/useReplayStore';
import { CricketState, F1State, TennisState } from '../types';
import { replayAdapter } from '../adapters/replayAdapter';

// Embeddable YouTube sports footage strictly matching each active match fixture
const STREAM_VIDEO_IDS: Record<string, string> = {
  'match-tennis-ao24': 'frRVq6FI_5c', // Australian Open 2024 Men's Final (Jannik Sinner vs Daniil Medvedev)
  'match-f1-abudhabi21': 'S_jdcUVtaTU', // 2021 Abu Dhabi Grand Prix (Max Verstappen vs Lewis Hamilton)
  'match-cricket-t20wc24': '3yiWqnKl7lQ', // ICC T20 World Cup 2024 Final (India vs South Africa)
};

// Sport-level fallbacks ensuring 100% video-to-sport fidelity
const SPORT_FALLBACK_VIDEOS: Record<string, string> = {
  tennis: 'frRVq6FI_5c',
  f1: 'S_jdcUVtaTU',
  cricket: '3yiWqnKl7lQ',
};

export function BroadcastCanvas() {
  const activeMatchId = useReplayStore((s) => s.activeMatchId);
  const currentTime = useReplayStore((s) => s.currentTime);
  const matches = useReplayStore((s) => s.matches);

  const activeMatch = matches.find((m) => m.id === activeMatchId);
  const latestEvent = replayAdapter.getLatestEventForMatch(activeMatchId, currentTime);
  const [videoLoaded, setVideoLoaded] = useState(true);

  if (!activeMatch) return null;

  const sport = activeMatch.sport;
  const videoId = STREAM_VIDEO_IDS[activeMatchId] || SPORT_FALLBACK_VIDEOS[sport] || 'frRVq6FI_5c';

  return (
    <div className="relative w-full h-full select-none overflow-hidden bg-black">
      {/* 1. Real Embedded Broadcast Stream */}
      {videoLoaded && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
          <iframe
            key={videoId}
            src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoId}&playsinline=1&rel=0&modestbranding=1&enablejsapi=1`}
            title={activeMatch.title}
            className="w-full h-full object-cover scale-[1.08] filter brightness-[0.92] contrast-[1.05]"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            onError={() => setVideoLoaded(false)}
          />
          {/* Subtle broadcast vignette overlay for crisp readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/50 pointer-events-none" />
        </div>
      )}

      {/* 2. Official TV Broadcast Scorebug Overlay */}
      <div className="relative w-full h-full pointer-events-none">
        {sport === 'f1' && (
          <F1BroadcastOverlay state={latestEvent?.state as F1State} />
        )}
        {sport === 'tennis' && (
          <TennisBroadcastOverlay state={latestEvent?.state as TennisState} />
        )}
        {sport === 'cricket' && (
          <CricketBroadcastOverlay state={latestEvent?.state as CricketState} />
        )}
      </div>
    </div>
  );
}

/* =========================================================================
   1. FORMULA 1 BROADCAST OVERLAY (AWS Leaderboard & Speed Telemetry)
   ========================================================================= */
function F1BroadcastOverlay({ state }: { state?: F1State }) {
  const isSafetyCar = state?.status === 'SAFETY_CAR';

  return (
    <div className="absolute inset-0 p-3 sm:p-5 flex flex-col justify-between pointer-events-none">
      {/* Left AWS Timing Tower */}
      <div className="mt-12 sm:mt-14 w-40 sm:w-48 bg-black/85 backdrop-blur-md rounded-lg border border-white/15 overflow-hidden shadow-2xl text-[10px] sm:text-[11px] font-mono-numbers">
        <div className="bg-[#e10600] px-2.5 py-1 flex items-center justify-between text-white font-black tracking-wider uppercase text-[10px]">
          <span>YAS MARINA</span>
          <span>L {state?.lap || 51}/{state?.totalLaps || 53}</span>
        </div>

        {isSafetyCar && (
          <div className="bg-amber-400 text-black font-black text-[9px] sm:text-[10px] px-2 py-0.5 text-center animate-pulse tracking-wide">
            ⚠ SAFETY CAR DEPLOYED
          </div>
        )}

        <div className="divide-y divide-white/10 bg-black/60">
          {(state?.standings || [
            { pos: 1, code: 'VER', gap: 'LEADER', tyre: 'SOFT' },
            { pos: 2, code: 'HAM', gap: '+1.244s', tyre: 'HARD' },
            { pos: 3, code: 'SAI', gap: '+14.82s', tyre: 'HARD' },
          ]).slice(0, 3).map((d) => (
            <div key={d.code} className="px-2 sm:px-2.5 py-1 flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold">
                <span className="text-zinc-500 w-3 text-right">{d.pos}</span>
                <span className={d.pos === 1 ? 'text-amber-400' : 'text-white'}>{d.code}</span>
              </div>
              <span className="text-zinc-400 text-[10px]">{d.gap}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Speed & Gear Telemetry */}
      <div className="self-end mb-10 flex items-center gap-3 bg-black/75 backdrop-blur-md border border-white/15 px-3 py-1.5 rounded-lg shadow-xl font-mono-numbers">
        <div className="text-right">
          <div className="text-[9px] text-zinc-400 uppercase tracking-widest font-bold">SPEED</div>
          <div className="text-base sm:text-lg font-black text-white">314 <span className="text-[10px] text-zinc-400 font-normal">KM/H</span></div>
        </div>
        <div className="h-6 w-px bg-white/20"></div>
        <div className="text-center">
          <div className="text-[9px] text-zinc-400 uppercase tracking-widest font-bold">GEAR</div>
          <div className="text-base sm:text-lg font-black text-red-500">7</div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   2. TENNIS BROADCAST OVERLAY (Official ATP Tour Scorebug)
   ========================================================================= */
function TennisBroadcastOverlay({ state }: { state?: TennisState }) {
  const isBreakPoint = state?.isBreakPoint;

  return (
    <div className="absolute inset-0 p-3 sm:p-5 flex flex-col justify-between pointer-events-none">
      {/* ATP Official Scorebug (Bottom-Left) */}
      <div className="mt-auto mb-10 self-start bg-black/85 backdrop-blur-md rounded-lg border border-white/20 shadow-2xl overflow-hidden font-mono-numbers text-xs">
        {/* Header */}
        <div className="bg-[#002B49] px-2.5 py-0.5 flex items-center justify-between text-white text-[9px] sm:text-[10px] font-black tracking-wider uppercase border-b border-white/10">
          <span>AUSTRALIAN OPEN 2024</span>
          <span className="text-amber-400">ROD LAVER ARENA · SET 5</span>
        </div>

        {/* Players & Sets */}
        <div className="p-2 space-y-1 min-w-[210px] sm:min-w-[240px]">
          {/* Player 1 */}
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-1.5 font-bold">
              <span className={`w-1.5 h-1.5 rounded-full ${state?.server === 1 ? 'bg-amber-400' : 'bg-transparent'}`}></span>
              <span className="text-xs">SINNER</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-zinc-400">6</span>
              <span className="text-zinc-400">4</span>
              <span className="text-white font-black bg-white/15 px-1.5 py-0.5 rounded">
                {state?.gameScore?.split('-')[0] || '40'}
              </span>
            </div>
          </div>

          {/* Player 2 */}
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-1.5 font-bold">
              <span className={`w-1.5 h-1.5 rounded-full ${state?.server === 2 ? 'bg-amber-400' : 'bg-transparent'}`}></span>
              <span className="text-xs">MEDVEDEV</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-zinc-400">3</span>
              <span className="text-zinc-400">6</span>
              <span className="text-white font-black bg-white/15 px-1.5 py-0.5 rounded">
                {state?.gameScore?.split('-')[1] || '30'}
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Break Point Indicator */}
        {isBreakPoint && (
          <div className="bg-lime-500 text-black font-black text-[10px] py-0.5 px-2 text-center tracking-wider uppercase animate-pulse">
            ★ BREAK POINT OPPORTUNITY
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================================
   3. CRICKET BROADCAST OVERLAY (Official Match Scorebug)
   ========================================================================= */
function CricketBroadcastOverlay({ state }: { state?: CricketState }) {
  const runsNeeded = state?.target ? state.target - (state.score || 0) : 0;
  const totalBalls = Math.floor(state?.overs || 18.2) * 6 + Math.round(((state?.overs || 18.2) % 1) * 10);
  const ballsRemaining = Math.max(0, 120 - totalBalls);

  return (
    <div className="absolute inset-0 p-3 sm:p-5 flex flex-col justify-end pointer-events-none">
      {/* Broadcast Score Strip */}
      <div className="mb-10 self-start bg-black/85 backdrop-blur-md rounded-lg border border-white/20 shadow-2xl p-2 sm:p-2.5 font-mono-numbers text-xs min-w-[260px] sm:min-w-[300px]">
        <div className="flex items-center justify-between text-[10px] text-zinc-400 uppercase font-black tracking-wider border-b border-white/10 pb-1 mb-1.5">
          <span className="text-broadcast-orange">ICC T20 WC 2024 FINAL</span>
          <span>CRR: {state?.currentRunRate?.toFixed(1) || '8.8'}</span>
        </div>

        <div className="flex items-baseline justify-between text-white">
          <div>
            <span className="text-sm font-black mr-2">{state?.battingTeam || 'SA'}</span>
            <span className="text-base sm:text-lg font-black text-broadcast-orange">
              {state?.score || 151}/{state?.wickets || 4}
            </span>
            <span className="text-zinc-400 text-xs ml-1.5">({state?.overs || 15.1} ov)</span>
          </div>

          {runsNeeded > 0 && (
            <div className="text-right text-[11px] font-bold text-amber-300">
              Need {runsNeeded} off {ballsRemaining}b
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
