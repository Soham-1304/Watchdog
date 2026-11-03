import { create } from 'zustand';
import {
  MatchEvent,
  MatchMetadata,
  ScoredAlert,
  UserSettings,
  SuppressedEvent,
  CatchUpSummary,
} from '../types';
import { replayAdapter } from '../adapters/replayAdapter';
import { evaluateRulesGate } from '../engine/rulesGate';
import { evaluateAlertFilter } from '../engine/filters';
import { generateCatchUpSummary } from '../engine/catchup';

export interface ActiveAlertData extends ScoredAlert {
  event: MatchEvent;
  effectiveScore: number;
  isPinnedBoost: boolean;
  firedAtClockTime: number;
}

interface ReplayStoreState {
  // Initialization
  isLoaded: boolean;
  matches: MatchMetadata[];
  events: MatchEvent[];
  alerts: Record<string, ScoredAlert>;

  // Clock
  currentTime: number;
  isPlaying: boolean;
  speed: 1 | 5 | 10 | 20;
  maxTime: number;

  // Viewing
  activeMatchId: string;
  lastVisitedT: Record<string, number>;
  activeCatchUp: CatchUpSummary | null;

  // Alerts
  activeAlert: ActiveAlertData | null;
  alertQueue: ActiveAlertData[];
  firedEventIds: Set<string>;
  delayedAlertQueue: { alertData: ActiveAlertData; displayAtT: number }[];

  // User Settings
  settings: UserSettings;

  // Restraint & Filtered View
  suppressedEvents: SuppressedEvent[];
  totalEvaluatedCount: number;
  totalAlertsCount: number;

  // Modals & Panels
  currentPage: 'home' | 'match' | 'settings';
  quickWatchList: string[];
  settingsTab: 'profile' | 'quickwatch' | 'cutaway';
  isFilteredDrawerOpen: boolean;
  isSettingsDrawerOpen: boolean;
  isInPlayerHUDOpen: boolean;
  isGuidedDemoActive: boolean;
  demoStep: number;

  // Actions
  setCurrentPage: (page: 'home' | 'match' | 'settings') => void;
  toggleQuickWatch: (matchId: string) => void;
  setSettingsTab: (tab: 'profile' | 'quickwatch' | 'cutaway') => void;
  initialize: () => Promise<void>;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  setSpeed: (speed: 1 | 5 | 10 | 20) => void;
  seek: (t: number) => void;
  restart: () => void;
  tick: (deltaSeconds: number) => void;
  switchMatch: (matchId: string) => void;
  dismissAlert: () => void;
  dismissCatchUp: () => void;
  updateSettings: (partial: Partial<UserSettings>) => void;
  toggleAIEnabled: () => void;
  setIsInPlayerHUDOpen: (open: boolean) => void;
  setFilteredDrawerOpen: (open: boolean) => void;
  setSettingsDrawerOpen: (open: boolean) => void;
  startGuidedDemo: () => void;
  nextDemoStep: () => void;
  exitGuidedDemo: () => void;
}

export const useReplayStore = create<ReplayStoreState>((set, get) => ({
  isLoaded: false,
  matches: [],
  events: [],
  alerts: {},

  currentTime: 0,
  isPlaying: true,
  speed: 1,
  maxTime: 360,

  activeMatchId: 'match-tennis-ao24',
  lastVisitedT: {},
  activeCatchUp: null,

  activeAlert: null,
  alertQueue: [],
  firedEventIds: new Set<string>(),
  delayedAlertQueue: [],

  settings: {
    enabled: true,
    contentDepth: 'tactical',
    audienceMode: 'novice',
    alertStyle: 'card',
    pins: {
      sports: ['tennis', 'f1', 'cricket'],
      players: ['Sinner', 'Verstappen', 'Kohli'],
    },
    threshold: 7,
    delaySeconds: 0,
    novice: true,
    liveAI: false,
  },

  suppressedEvents: [],
  totalEvaluatedCount: 0,
  totalAlertsCount: 0,

  currentPage: 'home',
  quickWatchList: ['match-cricket-t20wc24', 'match-f1-abudhabi21', 'match-tennis-ao24'],
  settingsTab: 'cutaway',
  isFilteredDrawerOpen: false,
  isSettingsDrawerOpen: false,
  isInPlayerHUDOpen: false,
  isGuidedDemoActive: false,
  demoStep: 0,

  setCurrentPage: (page) => set({ currentPage: page }),
  toggleQuickWatch: (matchId) => {
    const current = get().quickWatchList;
    const next = current.includes(matchId)
      ? current.filter((id) => id !== matchId)
      : [...current, matchId];
    set({ quickWatchList: next });
  },
  setSettingsTab: (tab) => set({ settingsTab: tab }),

  initialize: async () => {
    if (get().isLoaded) return;
    await replayAdapter.load();
    const matches = replayAdapter.getMatches();
    const events = replayAdapter.getAllEvents();
    const alerts = replayAdapter.getAllAlerts();
    const maxTime = replayAdapter.getMaxReplayTime();

    set({
      isLoaded: true,
      isPlaying: true,
      matches,
      events,
      alerts,
      maxTime,
      activeMatchId: matches[0]?.id || 'match-tennis-ao24',
      lastVisitedT: {
        [matches[0]?.id || 'match-tennis-ao24']: 0,
      },
    });
  },

  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  togglePlay: () => set((s) => ({ isPlaying: !s.isPlaying })),

  setSpeed: (speed) => set({ speed }),

  seek: (t) => {
    set({
      currentTime: Math.max(0, Math.min(t, get().maxTime)),
      activeAlert: null,
      alertQueue: [],
      delayedAlertQueue: [],
    });
  },

  restart: () => {
    const { matches } = get();
    const defaultMatchId = matches[0]?.id || 'match-tennis-ao24';
    set({
      currentTime: 0,
      isPlaying: true,
      activeAlert: null,
      alertQueue: [],
      delayedAlertQueue: [],
      firedEventIds: new Set<string>(),
      suppressedEvents: [],
      totalEvaluatedCount: 0,
      totalAlertsCount: 0,
      activeCatchUp: null,
      lastVisitedT: { [defaultMatchId]: 0 },
    });
  },

  tick: (deltaSeconds) => {
    const state = get();
    if (!state.isPlaying || !state.isLoaded) return;

    const prevT = state.currentTime;
    const nextT = Math.min(state.maxTime, prevT + deltaSeconds * state.speed);

    // Stop at end
    if (nextT >= state.maxTime) {
      set({ currentTime: state.maxTime, isPlaying: false });
      return;
    }

    // Identify events falling strictly in (prevT, nextT]
    const currentEvents = state.events.filter((e) => e.t > prevT && e.t <= nextT);

    const newFiredIds = new Set(state.firedEventIds);
    const newSuppressed = [...state.suppressedEvents];
    let newTotalEvaluated = state.totalEvaluatedCount;
    let newTotalAlerts = state.totalAlertsCount;
    const newAlertsQueue = [...state.alertQueue];
    const newDelayedQueue = [...state.delayedAlertQueue];

    for (const event of currentEvents) {
      if (newFiredIds.has(event.id)) continue;
      newFiredIds.add(event.id);
      newTotalEvaluated++;

      // 1. Rules Gate
      const gate = evaluateRulesGate(event);
      if (!gate.isCandidate) {
        newSuppressed.unshift({
          event,
          reason: 'rules_gate',
          details: gate.reason,
        });
        continue;
      }

      // 2. Alert Scorer lookup
      const alert = state.alerts[event.id];
      if (!alert) {
        newSuppressed.unshift({
          event,
          score: 1,
          reason: 'rules_gate',
          details: 'Event lacks AI significance',
        });
        continue;
      }

      // Check if AI Sentinel is toggled OFF in-player
      if (!state.settings.enabled) {
        newSuppressed.unshift({
          event,
          score: alert.importance,
          reason: 'below_threshold',
          details: 'AI cues toggled OFF in stream player HUD (like CC disabled)',
        });
        continue;
      }

      // Check if this match is in the user's QuickWatch list
      if (state.quickWatchList.length > 0 && !state.quickWatchList.includes(event.match_id)) {
        newSuppressed.unshift({
          event,
          score: alert.importance,
          reason: 'below_threshold',
          details: 'Match not in user QuickWatch sentinel list',
        });
        continue;
      }

      // 3. Filters & Threshold
      const filterResult = evaluateAlertFilter(
        event,
        alert,
        state.activeMatchId,
        state.settings
      );

      if (!filterResult.shouldAlert) {
        newSuppressed.unshift({
          event,
          score: filterResult.effectiveScore,
          reason: filterResult.reason || 'below_threshold',
          details: filterResult.details,
        });
        continue;
      }

      // Qualified alert
      newTotalAlerts++;
      const alertData: ActiveAlertData = {
        ...alert,
        event,
        effectiveScore: filterResult.effectiveScore,
        isPinnedBoost: filterResult.isPinnedBoost,
        firedAtClockTime: nextT,
      };

      if (state.settings.delaySeconds > 0) {
        newDelayedQueue.push({
          alertData,
          displayAtT: nextT + state.settings.delaySeconds,
        });
      } else {
        newAlertsQueue.push(alertData);
      }
    }

    // Check if any delayed alerts have passed their presentation time
    const readyFromDelay: ActiveAlertData[] = [];
    const remainingDelayed: typeof state.delayedAlertQueue = [];
    for (const item of newDelayedQueue) {
      if (item.displayAtT <= nextT) {
        readyFromDelay.push(item.alertData);
      } else {
        remainingDelayed.push(item);
      }
    }

    const combinedQueue = [...newAlertsQueue, ...readyFromDelay];

    // Manage active alert display
    let nextActiveAlert = state.activeAlert;
    if (nextActiveAlert) {
      // Auto-dismiss alert after 7 seconds of replay time (FanCode native timing)
      if (nextT - nextActiveAlert.firedAtClockTime >= 7) {
        nextActiveAlert = null;
      }
    }

    if (!nextActiveAlert && combinedQueue.length > 0) {
      nextActiveAlert = combinedQueue.shift() || null;
      if (nextActiveAlert) {
        nextActiveAlert.firedAtClockTime = nextT;
      }
    }

    set({
      currentTime: nextT,
      firedEventIds: newFiredIds,
      suppressedEvents: newSuppressed.slice(0, 100), // maintain recent 100
      totalEvaluatedCount: newTotalEvaluated,
      totalAlertsCount: newTotalAlerts,
      alertQueue: combinedQueue,
      delayedAlertQueue: remainingDelayed,
      activeAlert: nextActiveAlert,
    });
  },

  switchMatch: (matchId: string) => {
    const state = get();
    if (state.activeMatchId === matchId) return;

    const previousMatchId = state.activeMatchId;
    const currentClockTime = state.currentTime;

    // Check if user previously visited target match
    const lastVisited = state.lastVisitedT[matchId];
    let catchUp: CatchUpSummary | null = null;

    if (lastVisited !== undefined && currentClockTime > lastVisited + 10) {
      // User was away from target match for >10 seconds
      const targetMatch = state.matches.find((m) => m.id === matchId);
      const missedEvents = replayAdapter.getEventsBetween(matchId, lastVisited, currentClockTime);
      const latestEvent = replayAdapter.getLatestEventForMatch(matchId, currentClockTime);

      if (targetMatch && latestEvent) {
        catchUp = generateCatchUpSummary(
          matchId,
          targetMatch.sport,
          lastVisited,
          currentClockTime,
          missedEvents,
          latestEvent.state
        );
      }
    }

    // Dismiss active alert if it was for the match we just switched to
    const activeAlert = state.activeAlert?.event.match_id === matchId ? null : state.activeAlert;

    set({
      activeMatchId: matchId,
      activeAlert,
      activeCatchUp: catchUp,
      lastVisitedT: {
        ...state.lastVisitedT,
        [previousMatchId]: currentClockTime,
        [matchId]: currentClockTime,
      },
    });
  },

  dismissAlert: () => set({ activeAlert: null }),
  dismissCatchUp: () => set({ activeCatchUp: null }),

  updateSettings: (partial) => {
    set((s) => ({
      settings: { ...s.settings, ...partial },
    }));
  },

  toggleAIEnabled: () => {
    set((s) => ({
      settings: { ...s.settings, enabled: !s.settings.enabled },
    }));
  },

  setIsInPlayerHUDOpen: (open) => set({ isInPlayerHUDOpen: open }),

  setFilteredDrawerOpen: (open) => set({ isFilteredDrawerOpen: open }),
  setSettingsDrawerOpen: (open) => set({ isSettingsDrawerOpen: open }),

  startGuidedDemo: () => {
    const { matches } = get();
    const tennisMatch = matches.find((m) => m.sport === 'tennis') || matches[0];
    set({
      currentTime: 0,
      isPlaying: true,
      speed: 10, // 10x replay speed for demo
      activeMatchId: tennisMatch?.id || 'match-tennis-ao24',
      activeAlert: null,
      alertQueue: [],
      delayedAlertQueue: [],
      firedEventIds: new Set<string>(),
      suppressedEvents: [],
      totalEvaluatedCount: 0,
      totalAlertsCount: 0,
      activeCatchUp: null,
      settings: {
        enabled: true,
        contentDepth: 'tactical',
        audienceMode: 'novice',
        alertStyle: 'card',
        pins: {
          sports: ['tennis'],
          players: ['Sinner'],
        },
        threshold: 7,
        delaySeconds: 0,
        novice: true, // enable novice explainer for demo
        liveAI: false,
      },
      isGuidedDemoActive: true,
      demoStep: 1,
    });
  },

  nextDemoStep: () => {
    const current = get().demoStep;
    if (current >= 3) {
      set({ isGuidedDemoActive: false, demoStep: 0 });
    } else {
      set({ demoStep: current + 1 });
    }
  },

  exitGuidedDemo: () => {
    set({ isGuidedDemoActive: false, demoStep: 0 });
  },
}));
