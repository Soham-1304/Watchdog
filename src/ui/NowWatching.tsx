import { useState } from 'react';
import {
  Volume2,
  VolumeX,
  Maximize2,
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
  const matches = useReplayStore((s) => s.matches);
  const isPlaying = useReplayStore((s) => s.isPlaying);
  const togglePlay = useReplayStore((s) => s.togglePlay);
  const isInPlayerHUDOpen = useReplayStore((s) => s.isInPlayerHUDOpen);
  const setIsInPlayerHUDOpen = useReplayStore((s) => s.setIsInPlayerHUDOpen);
  const setSettingsDrawerOpen = useReplayStore((s) => s.setSettingsDrawerOpen);
  const setSettingsTab = useReplayStore((s) => s.setSettingsTab);
  const switchMatch = useReplayStore((s) => s.switchMatch);
  const quickWatchList = useReplayStore((s) => s.quickWatchList);
  const toggleQuickWatch = useReplayStore((s) => s.toggleQuickWatch);

  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const activeMatch = matches.find((m) => m.id === activeMatchId);
  const otherMatches = matches.filter((m) => m.id !== activeMatchId);

  const isCurrentInQuickWatch = activeMatch && quickWatchList.includes(activeMatch.id);
  const latestEvent = replayAdapter.getLatestEventForMatch(activeMatchId, currentTime);
  const latestAlert = latestEvent ? replayAdapter.getAlert(latestEvent.id) : null;

  if (!activeMatch) {
    return (
      <div className="h-[480px] bg-[#111317] rounded-3xl flex items-center justify-center text-zinc-500">
        No active stream selected
      </div>
    );
  }

  // Dynamic contextual brief for the FanCode AI Card (screenshot 2)
  const getContextualHeadline = () => {
    if (activeMatch.sport === 'tennis') {
      return 'Live from Paris, France — High Stakes 3rd Set Decider';
    }
    if (activeMatch.sport === 'f1') {
      return 'Live from Yas Marina — Final Laps Championship Battle';
    }
    return 'Live from Kensington Oval — Thrilling T20 Finish';
  };

  const getContextualDescription = () => {
    if (latestAlert?.why) return latestAlert.why;
    if (latestEvent?.headline) return latestEvent.headline;
    if (activeMatch.sport === 'tennis') {
      return 'Medvedev and Sinner battling in the deciding set. Tune in for unforgettable championship tennis.';
    }
    if (activeMatch.sport === 'f1') {
      return 'Verstappen hunting down Hamilton on fresh soft compound tyres following late safety car period.';
    }
    return 'West Indies A and England Lions in a high-intensity death overs chase under floodlights.';
  };

  return (
    <div className="space-y-4 animate-ticker-slide">
      {/* "Since You Left" Catch-Up Brief (Appears when returning to a stream) */}
      <CatchUpCard />

      {/* 16:9 Broadcast Video Container */}
      <div
        className={`relative w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-black border border-white/10 shadow-2xl transition-all group ${
          isFullscreen ? 'fixed inset-0 z-50 rounded-none border-none' : 'aspect-video max-h-[580px]'
        }`}
      >
        {/* Real Live Broadcast Stream (F1 Onboard, Tennis Court, Cricket Stream) */}
        <BroadcastCanvas />

        {/* Top Overlay Bar (Matches FanCode Screenshot 3) */}
        <div className="absolute top-0 inset-x-0 p-3 sm:p-5 flex items-center justify-between z-30 bg-gradient-to-b from-black/80 via-black/30 to-transparent">
          {/* Match & Court Title */}
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-bold text-white tracking-wide flex items-center gap-1 drop-shadow">
              {activeMatch.sport === 'tennis'
                ? 'Court 1'
                : activeMatch.sport === 'f1'
                ? 'On-Board Cam 1'
                : 'Main Broadcast Feed'}
              <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
            </span>
            <span className="hidden sm:inline-block text-xs text-zinc-300 drop-shadow truncate max-w-[280px]">
              {activeMatch.title}
            </span>
          </div>

          {/* FanCode Watermark & Quick Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* FanCode Live Watermark (Matches Screenshot 2 & 3) */}
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/40 backdrop-blur-md border border-white/10 text-[10px] sm:text-xs font-black tracking-widest text-white">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
              <span>FANCODE</span>
              <span className="text-red-500 font-bold">LIVE</span>
            </div>

            {/* In-Player ✦ AI Sparkle Button (Matches Screenshot 3) */}
            <button
              onClick={() => setIsInPlayerHUDOpen(!isInPlayerHUDOpen)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all border shadow-lg ${
                isInPlayerHUDOpen
                  ? 'bg-broadcast-orange text-white border-broadcast-orange'
                  : 'bg-black/60 hover:bg-black/80 text-zinc-200 border-white/20'
              }`}
              title="Toggle Live AI Cues"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-current" />
              <span className="hidden sm:inline">AI Cues</span>
            </button>

            {/* Settings Gear */}
            <button
              onClick={() => {
                setSettingsTab('cutaway');
                setSettingsDrawerOpen(true);
              }}
              className="p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-zinc-300 hover:text-white border border-white/20 transition-colors shadow-lg"
              title="Preferences & Settings"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-zinc-300 hover:text-white border border-white/20 transition-colors shadow-lg"
              title="Fullscreen"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Bottom Playback Overlay Strip */}
        <div className="absolute bottom-0 inset-x-0 p-3 sm:p-4 flex items-center justify-between z-30 bg-gradient-to-t from-black/85 via-black/30 to-transparent">
          <div className="flex items-center gap-3">
            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              className="text-white hover:text-broadcast-orange transition-colors p-1"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
            </button>

            {/* Mute/Unmute */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="text-white hover:text-zinc-300 transition-colors p-1"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-zinc-400" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Timecode */}
            <div className="flex items-center gap-1.5 text-xs font-mono-numbers text-zinc-300">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              <span className="font-bold text-white uppercase text-[10px] tracking-wider">LIVE</span>
              <span className="text-zinc-600">·</span>
              <span>
                {Math.floor(currentTime / 60)}:{String(Math.floor(currentTime % 60)).padStart(2, '0')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-zinc-300">
            <span className="px-2 py-0.5 rounded bg-white/10 text-[10px] font-mono-numbers font-bold text-emerald-400">
              1080p60
            </span>
          </div>
        </div>

        {/* In-Player HUD Popover Overlay */}
        <InPlayerHUD />
      </div>

      {/* Below-Player Content (Matches FanCode Screenshot 2) */}
      <div className="space-y-4 pt-1">
        {/* Match Title & Actions Bar */}
        <div className="flex items-center justify-between gap-4 pb-2 border-b border-white/10">
          <div>
            <h1 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-1.5">
              <span>{activeMatch.sport === 'tennis' ? 'Court 1' : activeMatch.title}</span>
              <ChevronRight className="w-4 h-4 text-zinc-400" />
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">{activeMatch.tournament}</p>
          </div>

          <div className="flex items-center gap-2">
            {/* QuickWatch Bookmark Button */}
            <button
              onClick={() => toggleQuickWatch(activeMatch.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                isCurrentInQuickWatch
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : 'bg-white/5 hover:bg-white/10 text-zinc-300 border-white/10'
              }`}
            >
              {isCurrentInQuickWatch ? (
                <>
                  <BookmarkCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>In QuickWatch</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>+ QuickWatch</span>
                </>
              )}
            </button>

            {/* Share */}
            <button
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-white transition-colors"
              title="Share match"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* FanCode Native AI Card (Authentic FanCode Screenshot 2) */}
        <div className="bg-[#0e1526]/80 backdrop-blur-md rounded-2xl p-4 border border-white/10 shadow-xl space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-zinc-400">
              <Sparkles className="w-4 h-4 text-broadcast-orange fill-current" />
              <span className="font-bold text-zinc-300">Last Updated 0 minute ago</span>
            </div>
            <button
              onClick={() => {
                setSettingsTab('cutaway');
                setSettingsDrawerOpen(true);
              }}
              className="text-zinc-500 hover:text-zinc-300 p-1"
              title="Alert Preferences"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>

          <h3 className="text-sm font-bold text-white tracking-tight">
            {getContextualHeadline()}
          </h3>

          <p className="text-xs text-zinc-300 leading-relaxed">
            {getContextualDescription()}
          </p>

          {/* Concurrent QuickWatch Matches Bar */}
          <div className="pt-2 border-t border-white/10 flex items-center justify-between flex-wrap gap-2">
            <span className="text-[11px] font-bold text-zinc-400">Concurrent QuickWatch Feeds:</span>
            <div className="flex items-center gap-2">
              {otherMatches.map((m) => (
                <button
                  key={m.id}
                  onClick={() => switchMatch(m.id)}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-[11px] font-bold text-white flex items-center gap-1.5 transition-all"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-broadcast-orange"></span>
                  <span className="uppercase text-[9px] text-zinc-400">{m.sport}</span>
                  <span className="truncate max-w-[120px]">{m.title.split(' - ')[0]}</span>
                  <ChevronRight className="w-3 h-3 text-zinc-400" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* More Live Matches (Matches Screenshot 2) */}
        <div className="space-y-3 pt-2">
          <h2 className="text-sm font-extrabold text-white tracking-wide">More Live Matches</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {otherMatches.map((m) => (
              <div
                key={m.id}
                onClick={() => switchMatch(m.id)}
                className="group p-3 rounded-2xl bg-[#111317] hover:bg-[#151922] border border-white/10 hover:border-white/20 cursor-pointer transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-3 truncate">
                  <div className="w-14 h-10 rounded-lg bg-black flex items-center justify-center shrink-0 border border-white/10">
                    <span className="text-[9px] font-black uppercase text-broadcast-orange">
                      {m.sport}
                    </span>
                  </div>
                  <div className="truncate">
                    <h3 className="text-xs font-bold text-white group-hover:text-broadcast-orange truncate">
                      {m.title}
                    </h3>
                    <p className="text-[10px] text-zinc-400 mt-0.5">{m.tournament}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-bold text-broadcast-orange group-hover:translate-x-0.5 transition-transform shrink-0 ml-2">
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
