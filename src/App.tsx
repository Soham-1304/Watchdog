import { useEffect } from 'react';
import { useReplayStore } from './store/useReplayStore';
import { useClockEngine } from './engine/clock';
import { TopBar } from './ui/TopBar';
import { NowWatching } from './ui/NowWatching';
import { MultiMatchHub } from './ui/MultiMatchHub';
import { AlertCard } from './ui/AlertCard';
import { ReplayControlsPill } from './ui/ReplayControlsPill';
import { SettingsDrawer } from './ui/SettingsDrawer';
import { GuidedDemoTour } from './ui/GuidedDemoTour';

export default function App() {
  const isLoaded = useReplayStore((s) => s.isLoaded);
  const initialize = useReplayStore((s) => s.initialize);
  const activePage = useReplayStore((s) => s.activePage);
  const togglePlay = useReplayStore((s) => s.togglePlay);
  const matches = useReplayStore((s) => s.matches);
  const switchMatch = useReplayStore((s) => s.switchMatch);
  const dismissAlert = useReplayStore((s) => s.dismissAlert);
  const setSettingsDrawerOpen = useReplayStore((s) => s.setSettingsDrawerOpen);
  const startGuidedDemo = useReplayStore((s) => s.startGuidedDemo);

  // Run the replay clock animation loop
  useClockEngine();

  // Initialize store and check for ?demo=1
  useEffect(() => {
    initialize().then(() => {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('demo') === '1') {
        startGuidedDemo();
      }
    });
  }, [initialize, startGuidedDemo]);

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'Escape') {
        dismissAlert();
        setSettingsDrawerOpen(false);
      } else if (e.key === '1' && matches[0]) {
        switchMatch(matches[0].id);
      } else if (e.key === '2' && matches[1]) {
        switchMatch(matches[1].id);
      } else if (e.key === '3' && matches[2]) {
        switchMatch(matches[2].id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, dismissAlert, setSettingsDrawerOpen, matches, switchMatch]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#090A0C] flex flex-col items-center justify-center text-white p-6">
        <div className="w-12 h-12 rounded-2xl bg-broadcast-orange flex items-center justify-center text-white font-black text-2xl shadow-2xl shadow-broadcast-orange/40 animate-pulse mb-3">
          F
        </div>
        <h2 className="text-lg font-bold tracking-tight">Loading FanCode Cutaway...</h2>
        <p className="text-xs text-zinc-500 mt-1 font-medium">Synchronizing live match feeds</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090A0C] text-[#F4F4F6] flex flex-col justify-between selection:bg-broadcast-orange selection:text-white pb-20">
      {/* FanCode Header & View Navigation */}
      <TopBar />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 lg:p-6">
        {activePage === 'stream' ? (
          /* PAGE 1: Authentic Live Match Streaming View */
          <NowWatching />
        ) : (
          /* PAGE 2: Multi-Match Overview, Catch-Up & Transparency Hub */
          <MultiMatchHub />
        )}
      </main>

      {/* Floating 7-Second Pivotal Moment Alert Card */}
      <AlertCard />

      {/* Sleek Floating Simulation Replay Controller Pill */}
      <ReplayControlsPill />

      {/* Settings Drawer */}
      <SettingsDrawer />

      {/* 3-Step Guided Tour */}
      <GuidedDemoTour />

      {/* Subtle Broadcast Attribution Footer */}
      <footer className="border-t border-white/5 py-4 px-6 text-center text-xs text-zinc-500 mt-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px]">
          <p>
            <span className="text-zinc-400 font-bold">Cutaway for FanCode</span> · Real-time multi-match live sports companion layer.
          </p>
          <p className="font-mono-numbers text-zinc-600">
            Telemetry: Cricsheet (T20 WC) · FastF1 (Abu Dhabi GP) · Jeff Sackmann (Grand Slam Tennis)
          </p>
        </div>
      </footer>
    </div>
  );
}
