import { useState } from 'react';
import {
  Flame,
  Volume2,
  VolumeX,
  Maximize2,
  Sparkles,
  Settings,
  Radio,
  Play,
  Pause,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { useReplayStore } from '../store/useReplayStore';
import { replayAdapter } from '../adapters/replayAdapter';
import { CricketState, F1State, TennisState } from '../types';
import { InPlayerHUD } from './InPlayerHUD';

export function NowWatching() {
  const activeMatchId = useReplayStore((s) => s.activeMatchId);
  const currentTime = useReplayStore((s) => s.currentTime);
  const matches = useReplayStore((s) => s.matches);
  const isPlaying = useReplayStore((s) => s.isPlaying);
  const togglePlay = useReplayStore((s) => s.togglePlay);
  const isInPlayerHUDOpen = useReplayStore((s) => s.isInPlayerHUDOpen);
  const setIsInPlayerHUDOpen = useReplayStore((s) => s.setIsInPlayerHUDOpen);
  const setSettingsDrawerOpen = useReplayStore((s) => s.setSettingsDrawerOpen);
  const settings = useReplayStore((s) => s.settings);
  const switchMatch = useReplayStore((s) => s.switchMatch);

  const [isMuted, setIsMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const activeMatch = matches.find((m) => m.id === activeMatchId);
  const otherMatches = matches.filter((m) => m.id !== activeMatchId);
  const latestEvent = replayAdapter.getLatestEventForMatch(activeMatchId, currentTime);

  // Get active sentinel alerts across concurrent streams for FanCode's native sparkle slot
  const concurrentAlerts = otherMatches.map((m) => {
    const ev = replayAdapter.getLatestEventForMatch(m.id, currentTime);
    return { match: m, event: ev };
  });

  if (!activeMatch) {
    return (
      <div className="h-[480px] broadcast-glass rounded-2xl flex items-center justify-center text-broadcast-muted">
        No active stream selected
      </div>
    );
  }

  const state = latestEvent?.state;

  return (
    <div className="space-y-4">
      {/* 16:9 Broadcast Video Container */}
      <div
        className={`relative w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-black border border-broadcast-border shadow-2xl transition-all ${
          isFullscreen ? 'fixed inset-0 z-50 rounded-none border-none' : 'aspect-video max-h-[580px]'
        }`}
      >
        {/* Background Sports Broadcast Simulation */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
          {/* Simulated court/pitch/track gradient with dynamic ambient arena lights */}
          <div
            className={`w-full h-full bg-gradient-to-tr ${
              activeMatch.sport === 'tennis'
                ? 'from-[#0d1f18] via-[#091512] to-[#122b22]'
                : activeMatch.sport === 'f1'
                ? 'from-[#1a0a0c] via-[#10080a] to-[#250e12]'
                : 'from-[#0e1624] via-[#090d16] to-[#14233a]'
            }`}
          >
            {/* Grid texture for field lines */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>

            {/* Simulated Live Action Visual Elements */}
            <div className="absolute inset-0 flex items-center justify-center">
              {activeMatch.sport === 'tennis' && (
                <div className="relative w-4/5 h-3/5 border-2 border-white/20 rounded-lg flex items-center justify-center">
                  <div className="absolute inset-x-0 h-0.5 bg-white/40"></div>
                  <div className="w-0.5 h-full bg-white/40"></div>
                  <div className="absolute w-2 h-2 rounded-full bg-lime-400 shadow-[0_0_15px_#a3e635] animate-ping"></div>
                </div>
              )}
              {activeMatch.sport === 'f1' && (
                <div className="relative w-4/5 h-3/5 rounded-full border-4 border-dashed border-red-500/20 flex items-center justify-center">
                  <div className="absolute top-0 w-3 h-3 rounded-full bg-red-500 shadow-[0_0_20px_#ef4444] animate-pulse"></div>
                  <div className="text-zinc-600 font-mono text-xs uppercase tracking-widest">
                    Telemetry Sim · GPS Lap 51
                  </div>
                </div>
              )}
              {activeMatch.sport === 'cricket' && (
                <div className="relative w-3/5 h-4/5 border border-white/10 rounded-full flex items-center justify-center">
                  <div className="w-16 h-36 border border-emerald-500/20 bg-emerald-950/20 rounded"></div>
                  <div className="absolute top-1/4 w-2 h-2 rounded-full bg-broadcast-orange shadow-[0_0_15px_#ff5200] animate-bounce"></div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Top Overlay Bar */}
        <div className="absolute top-0 inset-x-0 p-3 sm:p-5 flex items-center justify-between z-30 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
          {/* Match & Court Title (Matches FanCode Mobile Screenshot 3) */}
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-xs sm:text-sm font-black text-white tracking-wide flex items-center gap-1.5 drop-shadow-md">
              {activeMatch.sport === 'tennis'
                ? 'Court 1'
                : activeMatch.sport === 'f1'
                ? 'On-Board Cam 1'
                : 'Main Broadcast Feed'}
              <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
            </span>
            <span className="hidden sm:inline-block text-xs font-semibold text-zinc-300 drop-shadow">
              {activeMatch.title}
            </span>
          </div>

          {/* FanCode Watermark & Quick Actions */}
          <div className="flex items-center gap-2 sm:gap-3.5">
            {/* FanCode Live Watermark */}
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/40 backdrop-blur-md border border-white/10 text-[10px] sm:text-xs font-black tracking-widest text-white">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
              <span>FANCODE</span>
              <span className="text-red-500 font-bold">LIVE</span>
            </div>

            {/* ✦ In-Player AI Quick HUD Toggle (FanCode Screenshot 3 sparkle button) */}
            <button
              onClick={() => setIsInPlayerHUDOpen(!isInPlayerHUDOpen)}
              className={`p-1.5 sm:p-2 rounded-xl border backdrop-blur-md transition-all flex items-center gap-1.5 shadow-lg ${
                isInPlayerHUDOpen || settings.enabled
                  ? 'bg-broadcast-orange/25 border-broadcast-orange text-broadcast-orange shadow-broadcast-orange/20'
                  : 'bg-black/50 border-white/10 text-zinc-300 hover:text-white'
              }`}
              title="Cutaway AI Sentinel Controls (Stream HUD)"
            >
              <Sparkles className="w-4 h-4 fill-current" />
              <span className="text-[10px] font-black uppercase tracking-wider hidden md:inline">
                AI Sentinel
              </span>
              {settings.enabled && (
                <span className="w-1.5 h-1.5 rounded-full bg-broadcast-orange animate-pulse"></span>
              )}
            </button>

            {/* Stream Settings */}
            <button
              onClick={() => setSettingsDrawerOpen(true)}
              className="p-1.5 sm:p-2 rounded-xl bg-black/50 hover:bg-black/80 border border-white/10 text-zinc-300 hover:text-white backdrop-blur-md transition-all"
              title="Preferences & Telemetry"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 sm:p-2 rounded-xl bg-black/50 hover:bg-black/80 border border-white/10 text-zinc-300 hover:text-white backdrop-blur-md transition-all"
              title="Toggle Fullscreen"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dynamic Sport Broadcast Scoreboard Overlay */}
        <div className="absolute inset-x-3 sm:inset-x-5 bottom-12 sm:bottom-16 z-20 pointer-events-none">
          <div className="pointer-events-auto max-w-xl">
            {activeMatch.sport === 'tennis' && state && (
              <TennisBroadcastHUD state={state as TennisState} />
            )}
            {activeMatch.sport === 'f1' && state && (
              <F1BroadcastHUD state={state as F1State} />
            )}
            {activeMatch.sport === 'cricket' && state && (
              <CricketBroadcastHUD state={state as CricketState} />
            )}
          </div>
        </div>

        {/* Bottom Stream Player Controls Bar */}
        <div className="absolute bottom-0 inset-x-0 p-2 sm:p-3 flex items-center justify-between z-30 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              className="p-1.5 rounded-lg text-white hover:bg-white/10 transition-colors"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>

            {/* Mute/Unmute */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-1.5 rounded-lg text-white hover:bg-white/10 transition-colors"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-zinc-400" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Timecode */}
            <div className="flex items-center gap-1.5 text-[11px] font-mono-numbers text-zinc-300">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              <span className="font-bold text-white uppercase text-[10px] tracking-wider">LIVE</span>
              <span className="text-zinc-500">·</span>
              <span>
                {Math.floor(currentTime / 60)}:{String(Math.floor(currentTime % 60)).padStart(2, '0')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 text-xs text-zinc-300">
            <span className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] font-mono-numbers font-bold text-emerald-400">
              1080p · 60fps
            </span>
            <div className="hidden sm:flex items-center gap-1 text-[11px] text-zinc-400">
              <Radio className="w-3 h-3 text-broadcast-orange animate-pulse" />
              <span>Synced PTS</span>
            </div>
          </div>
        </div>

        {/* In-Player HUD Popover Overlay */}
        <InPlayerHUD />
      </div>

      {/* FanCode Native AI Card Slot (Upgraded Below-Player Experience - FanCode Screenshot 2) */}
      <div className="broadcast-glass rounded-2xl p-4 sm:p-5 border border-white/10 shadow-xl relative overflow-hidden">
        <div className="flex items-start justify-between gap-4 mb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-broadcast-orange/20 text-broadcast-orange border border-broadcast-orange/30">
              <Sparkles className="w-4 h-4 fill-current" />
            </div>
            <div>
              <span className="text-[11px] text-zinc-400 font-medium">
                Last Updated just now · Powered by Cutaway AI Sentinel
              </span>
              <h3 className="text-sm font-extrabold text-white">
                Live Multi-Court Intelligence & Cross-Stream Cues
              </h3>
            </div>
          </div>

          <button
            onClick={() => setIsInPlayerHUDOpen(!isInPlayerHUDOpen)}
            className="text-[11px] font-bold text-broadcast-orange hover:underline shrink-0"
          >
            Customize Cues →
          </button>
        </div>

        <p className="text-xs text-zinc-300 leading-relaxed mb-3">
          Cutaway monitors concurrent live events in the background without burning user bandwidth.
          When high-leverage moments trigger on other streams, alerts appear directly on your video
          canvas.
        </p>

        {/* Mini Sentinel Status Strip Across Concurrent Matches */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-white/5">
          {concurrentAlerts.map(({ match, event }) => (
            <div
              key={match.id}
              onClick={() => switchMatch(match.id)}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 cursor-pointer transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-2 truncate">
                <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/10 text-broadcast-muted">
                  {match.sport}
                </span>
                <span className="text-xs font-bold text-white group-hover:text-broadcast-orange truncate">
                  {match.title}
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0 ml-2">
                <span className="text-[10px] text-zinc-400">
                  {event ? event.headline.slice(0, 24) + '...' : 'Live'}
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-broadcast-orange transition-transform group-hover:translate-x-0.5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ================= Mini Broadcast Lower-Third HUD Overlays ================= */

function TennisBroadcastHUD({ state }: { state: TennisState }) {
  return (
    <div className="bg-black/75 backdrop-blur-xl rounded-xl p-3 border border-white/15 text-white shadow-2xl flex flex-col gap-2">
      <div className="flex items-center justify-between text-[11px] font-extrabold tracking-wider border-b border-white/10 pb-1.5">
        <span className="text-lime-400 uppercase">ROD LAVER ARENA · SET 5</span>
        {state.isBreakPoint && (
          <span className="px-2 py-0.5 rounded bg-red-600/80 text-white text-[10px] font-black animate-pulse flex items-center gap-1">
            <ShieldAlert className="w-3 h-3" /> BREAK POINT
          </span>
        )}
      </div>
      <div className="space-y-1">
        <div className="flex justify-between items-center text-xs font-bold">
          <div className="flex items-center gap-2">
            {state.server === 1 && <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse"></span>}
            <span>{state.player1.name}</span>
          </div>
          <div className="flex items-center gap-3 font-mono-numbers">
            {state.setScores.map((s, i) => (
              <span key={i} className="text-zinc-400">{s.split('-')[0]}</span>
            ))}
            <span className="text-broadcast-orange font-black text-sm bg-white/10 px-1.5 rounded">
              {state.gameScore.split('-')[0]}
            </span>
          </div>
        </div>
        <div className="flex justify-between items-center text-xs font-bold">
          <div className="flex items-center gap-2">
            {state.server === 2 && <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse"></span>}
            <span>{state.player2.name}</span>
          </div>
          <div className="flex items-center gap-3 font-mono-numbers">
            {state.setScores.map((s, i) => (
              <span key={i} className="text-zinc-400">{s.split('-')[1]}</span>
            ))}
            <span className="text-broadcast-orange font-black text-sm bg-white/10 px-1.5 rounded">
              {state.gameScore.split('-')[1]}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function F1BroadcastHUD({ state }: { state: F1State }) {
  const leader = state.standings[0];
  const second = state.standings[1];
  return (
    <div className="bg-black/75 backdrop-blur-xl rounded-xl p-3 border border-white/15 text-white shadow-2xl flex flex-col gap-2">
      <div className="flex items-center justify-between text-[11px] font-extrabold tracking-wider border-b border-white/10 pb-1.5">
        <span className="text-red-400 uppercase">YAS MARINA · LAP {state.lap}/{state.totalLaps}</span>
        {state.status === 'SAFETY_CAR' && (
          <span className="px-2 py-0.5 rounded bg-amber-500/80 text-black text-[10px] font-black animate-pulse flex items-center gap-1">
            <Flame className="w-3 h-3" /> SAFETY CAR
          </span>
        )}
      </div>
      <div className="flex justify-between items-center text-xs font-mono-numbers">
        <div>
          <span className="font-black text-broadcast-orange mr-1">P1 {leader?.code}</span>
          <span className="text-zinc-400 text-[11px]">{leader?.gap}</span>
        </div>
        <div>
          <span className="font-bold text-white mr-1">P2 {second?.code}</span>
          <span className="text-red-400 text-[11px]">{second?.gap}</span>
        </div>
      </div>
    </div>
  );
}

function CricketBroadcastHUD({ state }: { state: CricketState }) {
  const runsNeeded = state.target ? state.target - state.score : 0;
  const totalBalls = Math.floor(state.overs) * 6 + Math.round((state.overs % 1) * 10);
  const ballsRemaining = Math.max(0, 120 - totalBalls);
  return (
    <div className="bg-black/75 backdrop-blur-xl rounded-xl p-3 border border-white/15 text-white shadow-2xl flex flex-col gap-2">
      <div className="flex items-center justify-between text-[11px] font-extrabold tracking-wider border-b border-white/10 pb-1.5">
        <span className="text-broadcast-orange uppercase">T20 FINAL · 2ND INNINGS</span>
        <span className="text-zinc-300 font-mono-numbers">CRR: {state.currentRunRate.toFixed(1)}</span>
      </div>
      <div className="flex items-baseline justify-between">
        <div>
          <span className="text-lg font-black text-white mr-2">{state.battingTeam}</span>
          <span className="text-xl font-black text-broadcast-orange font-mono-numbers">
            {state.score}/{state.wickets}
          </span>
          <span className="text-xs text-zinc-400 ml-1.5 font-mono-numbers">({state.overs} ov)</span>
        </div>
        {runsNeeded > 0 && (
          <div className="text-right text-[11px] font-bold text-amber-300">
            Need {runsNeeded} off {ballsRemaining}b
          </div>
        )}
      </div>
    </div>
  );
}
