import { useEffect } from 'react';
import { useReplayStore } from './store/useReplayStore';
import { useClockEngine } from './engine/clock';
import { TopBar } from './ui/TopBar';
import { HomePage } from './ui/HomePage';
import { NowWatching } from './ui/NowWatching';
import { SettingsPage } from './ui/SettingsPage';
import { SettingsDrawer } from './ui/SettingsDrawer';
import { GuidedDemoTour } from './ui/GuidedDemoTour';

export default function App() {
  const isLoaded = useReplayStore((s) => s.isLoaded);
  const initialize = useReplayStore((s) => s.initialize);
  const currentPage = useReplayStore((s) => s.currentPage);
  const theme = useReplayStore((s) => s.theme);
  const togglePlay = useReplayStore((s) => s.togglePlay);
  const play = useReplayStore((s) => s.play);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);
  const matches = useReplayStore((s) => s.matches);
  const switchMatch = useReplayStore((s) => s.switchMatch);
  const dismissAlert = useReplayStore((s) => s.dismissAlert);
  const setSettingsDrawerOpen = useReplayStore((s) => s.setSettingsDrawerOpen);
  const setCurrentPage = useReplayStore((s) => s.setCurrentPage);
  const startGuidedDemo = useReplayStore((s) => s.startGuidedDemo);
  const exitGuidedDemo = useReplayStore((s) => s.exitGuidedDemo);

  // Run the replay clock animation loop
  useClockEngine();

  // Initialize store and check for ?demo=1
  useEffect(() => {
    initialize().then(() => {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('demo') !== '0') {
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

      if (e.code === 'Space' && currentPage === 'match' && !(e.target instanceof HTMLElement && e.target.closest('button, a'))) {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'Escape') {
        dismissAlert();
        setSettingsDrawerOpen(false);
        exitGuidedDemo();
      } else if (e.key === '1' && matches[0]) {
        exitGuidedDemo();
        switchMatch(matches[0].id);
        setCurrentPage('match');
        play();
      } else if (e.key === '2' && matches[1]) {
        exitGuidedDemo();
        switchMatch(matches[1].id);
        setCurrentPage('match');
        play();
      } else if (e.key === '3' && matches[2]) {
        exitGuidedDemo();
        switchMatch(matches[2].id);
        setCurrentPage('match');
        play();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, play, currentPage, dismissAlert, setSettingsDrawerOpen, exitGuidedDemo, matches, switchMatch, setCurrentPage]);

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
    <div className="min-h-screen bg-slate-50 dark:bg-[#090A0C] text-slate-900 dark:text-[#F4F4F6] flex flex-col justify-between selection:bg-broadcast-orange selection:text-white pb-20 transition-colors duration-200">
      {/* Authentic FanCode Top Navigation Bar */}
      <TopBar />

      {/* Main Page Content */}
      <main className={`mx-auto w-full flex-1 ${currentPage === 'home' ? 'max-w-[2400px] px-4 py-4 sm:px-7 sm:py-6 xl:px-10 xl:py-7' : 'max-w-7xl p-3 sm:p-5 lg:p-6'}`}>
        {currentPage === 'home' && <HomePage />}
        {currentPage === 'match' && <NowWatching />}
        {currentPage === 'settings' && <SettingsPage />}
      </main>

      {/* FanCode Account, QuickWatch & Cutaway AI Settings Modal */}
      <SettingsDrawer />

      {/* 3-Step Guided Tour */}
      <GuidedDemoTour />

      {/* Subtle Broadcast Attribution Footer */}
      <footer className="border-t border-white/5 py-4 px-6 text-center text-xs text-zinc-500 mt-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px]">
          <p>
            <span className="text-zinc-400 font-bold">FanCode Cutaway</span> · Intelligent live sports companion layer.
          </p>
          <p className="font-mono-numbers text-zinc-600">
            Real Telemetry: Cricsheet (T20 WC) · FastF1 (Abu Dhabi GP) · Jeff Sackmann (Grand Slam Tennis)
          </p>
        </div>
      </footer>
    </div>
  );
}
