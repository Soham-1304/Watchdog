import { useEffect } from 'react';
import { useReplayStore } from './store/useReplayStore';
import { useClockEngine } from './engine/clock';
import { TopBar } from './ui/TopBar';
import { NowWatching } from './ui/NowWatching';
import { FeedStrip } from './ui/FeedStrip';
import { AlertCard } from './ui/AlertCard';
import { CatchUpCard } from './ui/CatchUpCard';
import { FilteredViewDrawer } from './ui/FilteredViewDrawer';
import { SettingsDrawer } from './ui/SettingsDrawer';
import { GuidedDemoTour } from './ui/GuidedDemoTour';

export default function App() {
  const isLoaded = useReplayStore((s) => s.isLoaded);
  const initialize = useReplayStore((s) => s.initialize);
  const togglePlay = useReplayStore((s) => s.togglePlay);
  const matches = useReplayStore((s) => s.matches);
  const switchMatch = useReplayStore((s) => s.switchMatch);
  const dismissAlert = useReplayStore((s) => s.dismissAlert);
  const setFilteredDrawerOpen = useReplayStore((s) => s.setFilteredDrawerOpen);
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
      // Ignore if typing in an input field
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'Escape') {
        dismissAlert();
        setFilteredDrawerOpen(false);
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
  }, [togglePlay, dismissAlert, setFilteredDrawerOpen, setSettingsDrawerOpen, matches, switchMatch]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-fancode-bg flex flex-col items-center justify-center text-white p-6">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-fancode-orange to-fancode-orangeLight flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-fancode-orange/30 animate-pulse mb-4">
          C
        </div>
        <h2 className="text-xl font-bold tracking-tight">Initializing Cutaway Replay Engine...</h2>
        <p className="text-xs text-fancode-muted mt-2">Loading multi-sport recorded streams</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-fancode-bg text-fancode-text flex flex-col justify-between selection:bg-fancode-orange selection:text-white">
      {/* Top Application Bar */}
      <TopBar />

      {/* Main Streaming Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Catch-Up Card (Appears if user switches back to previous match) */}
        <CatchUpCard />

        {/* Now Watching Stand-in Video Player */}
        <NowWatching />

        {/* Other Feeds Strip */}
        <FeedStrip />
      </main>

      {/* Slide-in Alert Card */}
      <AlertCard />

      {/* Filtered View Drawer (Proof of Restraint) */}
      <FilteredViewDrawer />

      {/* Settings Drawer */}
      <SettingsDrawer />

      {/* 3-Step Guided Demo Tour */}
      <GuidedDemoTour />

      {/* Footer & Data Attribution */}
      <footer className="border-t border-fancode-border/60 py-4 px-6 text-center text-xs text-fancode-subtle bg-fancode-surface/40 mt-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            <strong className="text-fancode-muted">Cutaway</strong> · Non-commercial prototype developed for Dream Sports / FanCode FDE Evaluation.
          </p>
          <p className="text-[11px]">
            Data Credits: Cricsheet (T20 WC) · FastF1 / OpenF1 (Abu Dhabi GP) · Jeff Sackmann (Grand Slam Tennis).
          </p>
        </div>
      </footer>
    </div>
  );
}
