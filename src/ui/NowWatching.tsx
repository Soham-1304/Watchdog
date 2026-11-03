import { useState, useRef, useEffect } from 'react';
import {
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Sparkles,
  Settings,
  Play,
  Pause,
  ChevronRight,
  Share2,
  Bookmark,
  BookmarkCheck,
  Info,
} from 'lucide-react';
import { useReplayStore } from '../store/useReplayStore';
import { replayAdapter } from '../adapters/replayAdapter';
import { InPlayerHUD } from './InPlayerHUD';
import { CatchUpCard } from './CatchUpCard';
import { BroadcastCanvas } from './BroadcastCanvas';

export function NowWatching() {
  const activeMatchId = useReplayStore((s) => s.activeMatchId);
  const currentTime = useReplayStore((s) => s.currentTime);
  const maxTime = useReplayStore((s) => s.maxTime);
  const seek = useReplayStore((s) => s.seek);
  const matches = useReplayStore((s) => s.matches);
  const isPlaying = useReplayStore((s) => s.isPlaying);
  const togglePlay = useReplayStore((s) => s.togglePlay);
  const isInPlayerHUDOpen = useReplayStore((s) => s.isInPlayerHUDOpen);
  const setIsInPlayerHUDOpen = useReplayStore((s) => s.setIsInPlayerHUDOpen);
  const setCurrentPage = useReplayStore((s) => s.setCurrentPage);
  const switchMatch = useReplayStore((s) => s.switchMatch);
  const quickWatchList = useReplayStore((s) => s.quickWatchList);
  const toggleQuickWatch = useReplayStore((s) => s.toggleQuickWatch);

  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isChromeVisible, setIsChromeVisible] = useState(true);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-hide controls when cursor stops moving
  const handleUserActivity = () => {
    setIsChromeVisible(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      if (!useReplayStore.getState().isInPlayerHUDOpen) {
        setIsChromeVisible(false);
      }
    }, 2800);
  };

  const handleMouseLeave = () => {
    if (!useReplayStore.getState().isInPlayerHUDOpen) {
      setIsChromeVisible(false);
    }
  };

  useEffect(() => {
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  // Monitor native browser fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleNativeFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        if (playerContainerRef.current?.requestFullscreen) {
          await playerContainerRef.current.requestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
      }
    } catch (err) {
      console.error('Fullscreen toggle error:', err);
    }
  };

  const activeMatch = matches.find((m) => m.id === activeMatchId);
  const otherMatches = matches.filter((m) => m.id !== activeMatchId);

  const isCurrentInQuickWatch = activeMatch && quickWatchList.includes(activeMatch.id);
  const latestEvent = replayAdapter.getLatestEventForMatch(activeMatchId, currentTime);
  const latestAlert = latestEvent ? replayAdapter.getAlert(latestEvent.id) : null;

  if (!activeMatch) {
    return (
      <div className="h-[480px] bg-white dark:bg-[#111317] border border-slate-200 dark:border-white/10 rounded-3xl flex items-center justify-center text-slate-500 dark:text-zinc-400">
        No active stream selected
      </div>
    );
  }

  const mins = Math.floor(currentTime / 60);
  const secs = String(Math.floor(currentTime % 60)).padStart(2, '0');
  const maxMins = Math.floor((maxTime || 360) / 60);
  const maxSecs = String(Math.floor((maxTime || 360) % 60)).padStart(2, '0');

  const getContextualHeadline = () => {
    if (activeMatch.sport === 'tennis') {
      return "Live from Rod Laver Arena — Set 5 Men's Final Decider";
    }
    if (activeMatch.sport === 'f1') {
      return 'Live from Yas Marina — Final Laps World Championship Decider';
    }
    return 'Live from Kensington Oval — ICC T20 World Cup 2024 Final';
  };

  const getContextualDescription = () => {
    if (latestAlert?.why) return latestAlert.why;
    if (latestEvent?.headline) return latestEvent.headline;
    if (activeMatch.sport === 'tennis') {
      return 'Jannik Sinner and Daniil Medvedev battling in the deciding 5th set of the Australian Open final.';
    }
    if (activeMatch.sport === 'f1') {
      return 'Max Verstappen hunting down Lewis Hamilton on fresh soft compound tyres following late safety car period.';
    }
    return 'India and South Africa in a nail-biting death overs finish under floodlights.';
  };

  return (
    <div className="space-y-6 animate-ticker-slide select-none">
      {/* "Since You Left" Catch-Up Brief (Appears when returning to a stream) */}
      <CatchUpCard />

      {/* 16:9 Broadcast Video Container (Kibo-UI Inspired) */}
      <div
        ref={playerContainerRef}
        onMouseMove={handleUserActivity}
        onMouseEnter={handleUserActivity}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleUserActivity}
        className={`relative w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-black border border-slate-800 dark:border-white/10 shadow-2xl transition-all group ${
          isFullscreen ? 'fixed inset-0 z-50 rounded-none border-none max-h-none h-screen' : 'aspect-video max-h-[580px]'
        } ${!isChromeVisible && !isInPlayerHUDOpen ? 'cursor-none' : ''}`}
      >
        {/* Dynamic Motion Broadcast Canvas (Zero double scoreboards) */}
        <BroadcastCanvas />

        {/* Top Overlay Bar - Fades out on inactivity */}
        <div
          className={`absolute top-0 inset-x-0 p-3 sm:p-5 flex items-center justify-between z-30 bg-gradient-to-b from-black/85 via-black/30 to-transparent transition-all duration-300 ${
            isChromeVisible || isInPlayerHUDOpen
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 -translate-y-2 pointer-events-none'
          }`}
        >
          {/* Match & Court Title */}
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-bold text-white tracking-wide flex items-center gap-1 drop-shadow">
              {activeMatch.sport === 'tennis'
                ? 'Rod Laver Arena'
                : activeMatch.sport === 'f1'
                ? 'Yas Marina Circuit'
                : 'Kensington Oval'}
              <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
            </span>
            <span className="hidden sm:inline-block text-xs text-zinc-300 drop-shadow truncate max-w-[280px]">
              {activeMatch.title}
            </span>
          </div>

          {/* Clean In-Player Controls */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Clean Live Simulation Badge */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-[10px] sm:text-xs font-bold tracking-wider text-white">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
              <span className="font-extrabold text-red-500 uppercase">LIVE</span>
              <span className="text-zinc-600">·</span>
              <span className="text-zinc-400 font-semibold text-[10px]">SIMULATION</span>
            </div>

            {/* In-Player ✦ AI Cues Sparkle Button */}
            <button
              onClick={() => setIsInPlayerHUDOpen(!isInPlayerHUDOpen)}
              className={`p-2 rounded-xl text-xs font-bold transition-all border shadow-lg ${
                isInPlayerHUDOpen
                  ? 'bg-broadcast-orange text-white border-broadcast-orange ring-2 ring-broadcast-orange/40'
                  : 'bg-black/60 hover:bg-black/80 text-zinc-200 border-white/20'
              }`}
              title="Toggle Live Cues Toolbar"
            >
              <Sparkles className="w-4 h-4 text-amber-300 fill-current" />
            </button>

            {/* Settings Gear */}
            <button
              onClick={() => setCurrentPage('settings')}
              className="p-2 rounded-xl bg-black/60 hover:bg-black/80 text-zinc-300 hover:text-white border border-white/20 transition-colors shadow-lg"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleNativeFullscreen}
              className="p-2 rounded-xl bg-black/60 hover:bg-black/80 text-zinc-300 hover:text-white border border-white/20 transition-colors shadow-lg"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Kibo-UI Style Bottom Control Bar - Fades out on inactivity */}
        <div
          className={`absolute bottom-0 inset-x-0 p-3 sm:p-4 flex items-center justify-between z-30 bg-gradient-to-t from-black/90 via-black/40 to-transparent transition-all duration-300 ${
            isChromeVisible || isInPlayerHUDOpen
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-2 pointer-events-none'
          }`}
        >
          {/* Play/Pause */}
          <button
            onClick={togglePlay}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-transform active:scale-95 shrink-0"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
          </button>

          {/* Time Range Scrub Bar */}
          <div className="flex-1 mx-3 sm:mx-4 flex items-center">
            <input
              type="range"
              min={0}
              max={maxTime || 360}
              value={currentTime}
              onChange={(e) => seek(Number(e.target.value))}
              className="w-full accent-broadcast-orange bg-white/20 h-1.5 rounded-full cursor-pointer hover:h-2 transition-all"
            />
          </div>

          {/* Time Display */}
          <div className="flex items-center gap-2 text-xs font-mono-numbers text-zinc-300 shrink-0">
            <span className="font-bold text-white">{mins}:{secs}</span>
            <span className="text-zinc-500">/</span>
            <span className="text-zinc-400">{maxMins}:{maxSecs}</span>
          </div>

          {/* Mute Button */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="ml-3 p-1.5 rounded-lg text-white hover:bg-white/10 transition-colors shrink-0"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-zinc-400" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>

        {/* In-Player Bottom Sheet Cues Toolbar (Slides UP smoothly from bottom) */}
        <InPlayerHUD />
      </div>

      {/* Below-Player Content (FanCode Native Design - Light & Dark Aware) */}
      <div className="space-y-4 pt-1">
        {/* Match Title & Actions Bar */}
        <div className="flex items-center justify-between gap-4 pb-3 border-b border-slate-200 dark:border-white/10">
          <div>
            <h1 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
              <span>{activeMatch.title}</span>
              <ChevronRight className="w-5 h-5 text-slate-400 dark:text-zinc-500" />
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 mt-0.5">
              {activeMatch.tournament} · {activeMatch.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* QuickWatch Bookmark Button */}
            <button
              onClick={() => toggleQuickWatch(activeMatch.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all border shadow-sm ${
                isCurrentInQuickWatch
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                  : 'bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-white/10'
              }`}
            >
              {isCurrentInQuickWatch ? (
                <>
                  <BookmarkCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>In QuickWatch</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>QuickWatch</span>
                </>
              )}
            </button>

            {/* Share */}
            <button
              className="p-2 rounded-xl bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              title="Share match"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* FanCode Live Match Brief Card */}
        <div className="bg-white dark:bg-[#0e111a] rounded-2xl p-5 border border-slate-200 dark:border-white/10 shadow-lg dark:shadow-xl space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-600 dark:text-zinc-400">
              <Sparkles className="w-4 h-4 text-broadcast-orange fill-current" />
              <span className="font-bold text-slate-900 dark:text-zinc-200">Live Companion Brief · Synced</span>
            </div>
            <button
              onClick={() => setCurrentPage('settings')}
              className="text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-300 p-1"
              title="Alert Preferences"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>

          <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white tracking-tight">
            {getContextualHeadline()}
          </h3>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-300 leading-relaxed font-medium">
            {getContextualDescription()}
          </p>

          {/* Concurrent QuickWatch Matches Bar */}
          <div className="pt-3 border-t border-slate-100 dark:border-white/10 flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs font-bold text-slate-500 dark:text-zinc-400">QuickWatch Streams:</span>
            <div className="flex items-center gap-2">
              {otherMatches.map((m) => (
                <button
                  key={m.id}
                  onClick={() => switchMatch(m.id)}
                  className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-800 dark:text-white flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-broadcast-orange"></span>
                  <span className="uppercase text-[9px] text-slate-400 dark:text-zinc-400">{m.sport}</span>
                  <span className="truncate max-w-[140px]">{m.title.split(' - ')[0]}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* More Live Matches */}
        <div className="space-y-3 pt-2">
          <h2 className="text-sm font-black text-slate-900 dark:text-white tracking-wide">More Live Matches</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {otherMatches.map((m) => (
              <div
                key={m.id}
                onClick={() => switchMatch(m.id)}
                className="group p-3.5 rounded-2xl bg-white dark:bg-[#0e111a] hover:bg-slate-50 dark:hover:bg-[#141824] border border-slate-200 dark:border-white/10 hover:border-broadcast-orange/40 dark:hover:border-broadcast-orange/40 cursor-pointer transition-all flex items-center justify-between shadow-sm"
              >
                <div className="flex items-center gap-3 truncate">
                  <div className="w-12 h-10 rounded-xl bg-slate-100 dark:bg-black flex items-center justify-center shrink-0 border border-slate-200 dark:border-white/10">
                    <span className="text-[10px] font-black uppercase text-broadcast-orange">
                      {m.sport}
                    </span>
                  </div>
                  <div className="truncate">
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-broadcast-orange truncate">
                      {m.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">{m.tournament}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-xs font-bold text-broadcast-orange group-hover:translate-x-0.5 transition-transform shrink-0 ml-2">
                  <span>Watch</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
