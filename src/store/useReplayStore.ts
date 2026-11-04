import { create } from 'zustand';
import {
  MatchEvent,
  MatchMetadata,
  ScoredAlert,
  UserSettings,
  SuppressedEvent,
  CatchUpSummary,
  EventPipelineResult,
} from '../types';
import { replayAdapter } from '../adapters/replayAdapter';
import { evaluateAlertFilter } from '../engine/filters';
import { generateCatchUpSummary } from '../engine/catchup';
import { processReplayEvent, toScoredAlert } from '../engine/eventPipeline';
import { evaluateReplayEvent } from '../ai/scorer';

export interface ActiveAlertData extends ScoredAlert {
  event: MatchEvent;
  effectiveScore: number;
  isPinnedBoost: boolean;
  firedAtClockTime: number;
  source?: 'live_agent_mesh' | 'fixture_mock' | 'deterministic_fallback';
}

interface ReplayStoreState {
  // Initialization
  isLoaded: boolean;
  matches: MatchMetadata[];
  events: MatchEvent[];
  alerts: Record<string, ScoredAlert>;
  eventResults: Record<string, EventPipelineResult>;

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
  theme: 'dark' | 'light';
  currentPage: 'home' | 'match' | 'settings';
  quickWatchList: string[];
  settingsTab: 'profile' | 'quickwatch' | 'cutaway';
  isFilteredDrawerOpen: boolean;
  isSettingsDrawerOpen: boolean;
  isInPlayerHUDOpen: boolean;
  isGuidedDemoActive: boolean;
  demoStep: number;

  // Actions
  toggleTheme: () => void;
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
  stepNext: () => void;
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

const PREFERENCES_STORAGE_KEY = 'fancode-cutaway-preferences-v1';

type SavedPreferences = {
  theme?: 'dark' | 'light';
  quickWatchList?: string[];
  settings?: Partial<UserSettings>;
};

const readSavedPreferences = (): SavedPreferences => {
  if (typeof window === 'undefined') return {};
  try {
    const parsed = JSON.parse(window.localStorage.getItem(PREFERENCES_STORAGE_KEY) || '{}') as SavedPreferences;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

const savePreferences = (preferences: SavedPreferences) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(preferences));
  } catch {
    // The app remains usable when browser storage is unavailable.
  }
};

const savedPreferences = readSavedPreferences();
const defaultSettings: UserSettings = {
  enabled: true,
  significanceAgentEnabled: true,
  narrativeAgentEnabled: true,
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
};

export const useReplayStore = create<ReplayStoreState>((set, get) => ({
  isLoaded: false,
  matches: [],
  events: [],
  alerts: {},
  eventResults: {},

  currentTime: 0,
  isPlaying: false,
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
    ...defaultSettings,
    ...savedPreferences.settings,
    pins: { ...defaultSettings.pins, ...savedPreferences.settings?.pins },
  },

  suppressedEvents: [],
  totalEvaluatedCount: 0,
  totalAlertsCount: 0,

  theme: savedPreferences.theme === 'light' ? 'light' : 'dark',
  currentPage: 'home',
  quickWatchList: Array.isArray(savedPreferences.quickWatchList)
    ? savedPreferences.quickWatchList
    : ['match-cricket-t20wc24', 'match-f1-abudhabi21', 'match-tennis-ao24'],
  settingsTab: 'cutaway',
  isFilteredDrawerOpen: false,
  isSettingsDrawerOpen: false,
  isInPlayerHUDOpen: false,
  isGuidedDemoActive: false,
  demoStep: 0,

  toggleTheme: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark';
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', next === 'dark');
    }
    set({ theme: next });
    savePreferences({ settings: get().settings, quickWatchList: get().quickWatchList, theme: next });
  },
  setCurrentPage: (page) => set({ currentPage: page }),
  toggleQuickWatch: (matchId) => {
    const current = get().quickWatchList;
    const next = current.includes(matchId)
      ? current.filter((id) => id !== matchId)
      : [...current, matchId];
    set({ quickWatchList: next });
    savePreferences({ settings: get().settings, quickWatchList: next, theme: get().theme });
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
      isPlaying: false,
      matches,
      events,
      alerts,
      eventResults: {},
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
      isPlaying: false,
      activeAlert: null,
      alertQueue: [],
      delayedAlertQueue: [],
      firedEventIds: new Set<string>(),
      eventResults: {},
      suppressedEvents: [],
      totalEvaluatedCount: 0,
      totalAlertsCount: 0,
      activeCatchUp: null,
      lastVisitedT: { [defaultMatchId]: 0 },
    });
  },

  stepNext: () => {
    const state = get();
    if (!state.isLoaded) return;
    const nextEvent = state.events.find((event) => !state.firedEventIds.has(event.id));
    if (!nextEvent) return;

    // Reuse the same deterministic/AI pipeline as timed playback, but move
    // exactly to one script event and immediately stop the clock again.
    set({ isPlaying: true });
    get().tick(Math.max(0.001, nextEvent.t - state.currentTime));
    set({ isPlaying: false, currentTime: nextEvent.t });
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
    const newEventResults = { ...state.eventResults };
    let newTotalEvaluated = state.totalEvaluatedCount;
    let newTotalAlerts = state.totalAlertsCount;
    const newAlertsQueue = [...state.alertQueue];
    const newDelayedQueue = [...state.delayedAlertQueue];
    const pendingEvaluations: {
      event: MatchEvent;
      precedingEvents: MatchEvent[];
      activeMatchId: string;
      quickWatchList: string[];
      settings: UserSettings;
    }[] = [];

    for (const event of currentEvents) {
      if (newFiredIds.has(event.id)) continue;
      newFiredIds.add(event.id);
      newTotalEvaluated++;

      const precedingEvents = state.events
        .filter((candidate) => candidate.match_id === event.match_id && candidate.t < event.t)
        .slice(-3);
      const pipelineResult = processReplayEvent(event, precedingEvents, {
        threshold: state.settings.threshold,
        significanceEnabled: state.settings.significanceAgentEnabled,
        narrativeEnabled: state.settings.narrativeAgentEnabled,
        noviceEnabled: state.settings.novice && state.settings.audienceMode === 'novice',
      });
      newEventResults[event.id] = pipelineResult;
      pendingEvaluations.push({
        event,
        precedingEvents,
        activeMatchId: state.activeMatchId,
        quickWatchList: [...state.quickWatchList],
        settings: state.settings,
      });

      const alert = toScoredAlert(pipelineResult);
      if (!alert) {
        newSuppressed.unshift({
          event,
          score: pipelineResult.significance?.importance_score,
          reason: 'below_threshold',
          details: !pipelineResult.significance
            ? 'Significance scoring is paused in Settings'
            : !state.settings.narrativeAgentEnabled
              ? 'Narrative alerts are paused in Settings'
              : `Routine event below the ${state.settings.threshold} hotness threshold`,
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
        source: pipelineResult.source,
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
      eventResults: newEventResults,
    });

    for (const pending of pendingEvaluations) {
      void evaluateReplayEvent(pending.event, pending.precedingEvents, {
        threshold: pending.settings.threshold,
        significanceEnabled: pending.settings.significanceAgentEnabled,
        narrativeEnabled: pending.settings.narrativeAgentEnabled,
        noviceEnabled: pending.settings.novice && pending.settings.audienceMode === 'novice',
      }).then((remoteResult) => {
        if (!remoteResult) return;
        const current = get();
        if (!current.firedEventIds.has(pending.event.id)) return;

        const remotePipeline: EventPipelineResult = remoteResult;
        const eventResults = { ...current.eventResults, [pending.event.id]: remotePipeline };
        const remoteAlert: ScoredAlert | null = remoteResult.alert
          ? {
              event_id: remoteResult.alert.event_id,
              importance: remoteResult.alert.importance,
              alert: remoteResult.alert.alert,
              why: remoteResult.alert.why,
              novice_note: remoteResult.alert.novice_note,
              tags: remoteResult.alert.tags,
            }
          : toScoredAlert(remotePipeline);

        const hadAlert = current.activeAlert?.event.id === pending.event.id ||
          current.alertQueue.some((item) => item.event.id === pending.event.id) ||
          current.delayedAlertQueue.some((item) => item.alertData.event.id === pending.event.id);
        let activeAlert = current.activeAlert;
        let alertQueue = current.alertQueue.filter((item) => item.event.id !== pending.event.id);
        let delayedAlertQueue = current.delayedAlertQueue.filter((item) => item.alertData.event.id !== pending.event.id);
        let totalAlertsCount = current.totalAlertsCount;
        const filterResult = remoteAlert
          ? evaluateAlertFilter(pending.event, remoteAlert, pending.activeMatchId, pending.settings)
          : null;
        const canDeliver = Boolean(
          remoteAlert &&
          pending.settings.enabled &&
          (pending.quickWatchList.length === 0 || pending.quickWatchList.includes(pending.event.match_id)) &&
          filterResult?.shouldAlert &&
          current.currentTime <= pending.event.t + 7,
        );

        if (activeAlert?.event.id === pending.event.id) activeAlert = null;
        if (canDeliver && remoteAlert && filterResult) {
          const alertData: ActiveAlertData = {
            ...remoteAlert,
            event: pending.event,
            effectiveScore: filterResult.effectiveScore,
            isPinnedBoost: filterResult.isPinnedBoost,
            firedAtClockTime: pending.event.t,
            source: remoteResult.source,
          };

          if (pending.settings.delaySeconds > 0) {
            delayedAlertQueue = [...delayedAlertQueue, {
              alertData,
              displayAtT: pending.event.t + pending.settings.delaySeconds,
            }];
          } else if (current.activeAlert && current.activeAlert.event.id !== pending.event.id) {
            alertQueue = [...alertQueue, alertData].sort((a, b) => a.firedAtClockTime - b.firedAtClockTime);
          } else {
            activeAlert = alertData;
          }
          if (!hadAlert) totalAlertsCount++;
        } else if (hadAlert) {
          totalAlertsCount = Math.max(0, totalAlertsCount - 1);
        }

        const suppressedEvents = current.suppressedEvents.filter((item) => item.event.id !== pending.event.id);
        if (!canDeliver) {
          suppressedEvents.unshift({
            event: pending.event,
            score: remotePipeline.significance?.importance_score,
            reason: filterResult?.reason || 'below_threshold',
            details: remoteResult.suppression_reason || filterResult?.details || 'AI pipeline did not qualify this event',
          });
        }

        set({
          eventResults,
          activeAlert,
          alertQueue,
          delayedAlertQueue,
          totalAlertsCount,
          suppressedEvents: suppressedEvents.slice(0, 100),
        });
      });
    }
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
    const settings = { ...get().settings, ...partial };
    set({ settings });
    savePreferences({ settings, quickWatchList: get().quickWatchList, theme: get().theme });
  },

  toggleAIEnabled: () => {
    const settings = { ...get().settings, enabled: !get().settings.enabled };
    set({ settings });
    savePreferences({ settings, quickWatchList: get().quickWatchList, theme: get().theme });
  },

  setIsInPlayerHUDOpen: (open) => set({ isInPlayerHUDOpen: open }),

  setFilteredDrawerOpen: (open) => set({ isFilteredDrawerOpen: open }),
  setSettingsDrawerOpen: (open) => set({ isSettingsDrawerOpen: open }),

  startGuidedDemo: () => {
    const { matches } = get();
    const tennisMatch = matches.find((m) => m.sport === 'tennis') || matches[0];
    set({
      currentTime: 0,
      isPlaying: false,
      speed: 1,
      currentPage: 'home',
      activeMatchId: tennisMatch?.id || 'match-tennis-ao24',
      activeAlert: null,
      alertQueue: [],
      delayedAlertQueue: [],
      firedEventIds: new Set<string>(),
      eventResults: {},
      suppressedEvents: [],
      totalEvaluatedCount: 0,
      totalAlertsCount: 0,
      activeCatchUp: null,
      settings: {
        enabled: true,
        significanceAgentEnabled: true,
        narrativeAgentEnabled: true,
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
      },
      isGuidedDemoActive: true,
      demoStep: 1,
    });
  },

  nextDemoStep: () => {
    const current = get().demoStep;
    if (current === 3) {
      set({ currentPage: 'match', isPlaying: false, demoStep: 4 });
    } else if (current === 4) {
      set({ demoStep: 5 });
    } else if (current >= 5) {
      set({ isGuidedDemoActive: false, demoStep: 0, isPlaying: true });
    } else {
      set({ isGuidedDemoActive: true, demoStep: current + 1 });
    }
  },

  exitGuidedDemo: () => {
    if (!get().isGuidedDemoActive) return;
    set({ isGuidedDemoActive: false, demoStep: 0, isPlaying: get().currentPage === 'match' });
  },
}));
