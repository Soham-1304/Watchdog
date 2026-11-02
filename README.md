# Cutaway · Multi-Match AI Companion

> **Built for FanCode · Dream Sports Forward Deployed Engineer (FDE) Evaluation**  
> An AI-powered companion layer for live multi-match streaming that watches concurrent broadcasts, alerts fans to decisive turning points with 1-line contextual explanations, enables 1-tap stream switching, and provides a catch-up brief upon return.

---

## 1. The Fan Problem

FanCode streams Formula 1, LaLiga, ATP Tennis, ISL, BWF Badminton, and ICC/IPL cricket concurrently. A fan watching Jannik Sinner in a 5th set Grand Slam tiebreak knows an F1 title decider or Cricket World Cup final is live simultaneously. 

Today, discovering a decisive swing in another match means leaving the player, scrolling feeds, and guessing what matters. Existing notifications fire blindly on every boundary, lap, or goal, creating severe notification fatigue with zero understanding of actual match significance.

---

## 2. The Solution: "Cutaway"

Cutaway acts as an intelligent sentinel running in parallel with the live stream:
1. **Two-Stage Significance Pipeline:** Filters out ~80%+ of routine events via a deterministic rules gate, then uses an LLM scorer to evaluate game-state significance (1–10 score + 1-line reason + novice rule explainer).
2. **"Restraint as a Feature" (Filtered View):** Fans can inspect suppressed events (`23 evaluated, 6 alerts, 74% suppressed`) as transparent proof of anti-bloat engineering.
3. **One-Tap Feed Switching & Catch-Up Card:** Jumps directly to decisive moments in other feeds, and delivers a 2-sentence *"Since you left"* summary when returning to the primary stream.
4. **Anti-Spoiler Presentation Delay:** Configurable buffer (0–60s) ensuring alerts never fire ahead of the broadcast's video latency.

---

## 3. Architecture

```
┌──────────────────────┐
│  Source Adapter      │  (ReplayAdapter today / FanCodeLiveAdapter in prod)
└──────────┬───────────┘
           │ Normalized MatchEvent { id, match_id, sport, t, type, headline, state }
           ▼
┌──────────────────────┐
│  Stage 1: Rules Gate │  (Deterministic, O(1) filter for candidate moments *)
└──────────┬───────────┘
           │ Candidates Only
           ▼
┌──────────────────────┐
│  Stage 2: LLM Scorer │  (Evaluates game state, returns score 1-10 + "why" line)
└──────────┬───────────┘
           │ ScoredAlert { importance, alert, why, novice_note }
           ▼
┌──────────────────────┐
│  Viewer Filters      │  (Pins +2 boost, threshold >= 7, same-match exclusion, delay buffer)
└──────────┬───────────┘
           │ Qualified Alerts
           ▼
┌──────────────────────┐
│  FanCode UI Layer    │  (NowWatching player, FeedStrip glow, AlertCard, CatchUpCard)
└──────────────────────┘
```

Everything downstream of the adapter is 100% source-agnostic.

---

## 4. Production Integration with FanCode (`fancodeAdapter.stub.ts`)

As a Forward Deployed Engineer (FDE), Cutaway was designed for FanCode's real backend:
- FanCode's live event bus (WebSocket/SSE) already emits real-time data for cricket, football, and racing.
- In production, **zero changes** are required in the scoring pipeline or UI layer.
- The developer simply swaps `ReplayAdapter` for `FanCodeLiveAdapter` (see [`src/adapters/fancodeAdapter.stub.ts`](file:///Users/sohamkarandikar/Documents/FanCode_Task/src/adapters/fancodeAdapter.stub.ts)), which normalizes incoming telemetry into the standard `MatchEvent` schema.

---

## 5. Live Replay Datasets (Interleaved Drama)

The prototype runs on real historical moments time-compressed and synchronized on a shared replay clock:
1. **Tennis:** Jannik Sinner vs Daniil Medvedev — 2024 Australian Open Final (Deciding 5th Set, Break of Serve, Championship Point).
2. **Formula 1:** Abu Dhabi Grand Prix 2021 — Laps 53–58 (Latifi crash, Safety Car strategy, Turn 5 final lap title overtake).
3. **Cricket:** India vs South Africa — ICC Men's T20 World Cup 2024 Final (Overs 15–20, Klaasen wicket, Bumrah death bowling, Suryakumar Yadav boundary catch).

*Pacing Guarantee:* Events are offset so high-drama moments never collide, and an early decoy event (boundary scoring 4/10) demonstrates the filter in action.

---

## 6. How to Run Locally

### Prerequisites
- Node.js 18+ (tested on Node v23)
- npm 9+

### Quick Start
```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev

# 3. Open in browser
http://localhost:5173
```

To launch directly into the 3-step evaluator tour, visit:
```
http://localhost:5173/?demo=1
```

### Keyboard Shortcuts
- `Space`: Play / Pause replay clock
- `1`: Switch to Tennis feed
- `2`: Switch to Formula 1 feed
- `3`: Switch to Cricket feed
- `Esc`: Dismiss active alert / close drawer

---

## 7. Guided Demo Walkthrough (3 Minutes)

1. **The Problem (0:00 - 0:20):** *"I'm watching Sinner on FanCode. An F1 title decider and T20 World Cup final are live in the background. If I leave to check, I break my viewing immersion. If I don't, I find out 10 minutes too late."*
2. **The Sentinel (0:20 - 0:45):** Start the replay. Point to the "Other Feeds" strip monitoring background matches.
3. **The First Alert (0:45 - 1:15):** At ~0:15 replay time, Latifi crashes in F1. The card slides in with `9/10 PIVOTAL`, the 1-line reason, and the Novice Rule explainer. Tap **"Switch to Stream"** in one tap.
4. **The Catch-Up (1:15 - 1:45):** Switch back to Tennis. The **Catch-Up Card** appears: *"Since you left (1m 15s ago), Sinner broke Medvedev's serve in Game 6..."*
5. **Proof of Restraint (1:45 - 2:20):** Click **"Suppressed: 23 ev / 6 al"** in the top bar. Show the evaluator the decoy boundary event (scored 4/10) that was held back to prevent spam.
6. **The FDE Production Story (2:20 - 3:00):** Show `fancodeAdapter.stub.ts`. Highlight that only the adapter changes when deploying to FanCode's live WebSocket.

---

## 8. Data Credits & License

- **Cricket Data:** Ball-by-ball match dataset from [Cricsheet](https://cricsheet.org/) (Creative Commons Attribution-ShareAlike 4.0 International).
- **Formula 1 Data:** Telemetry and lap timing structured from [FastF1](https://github.com/theOehrly/Fast-F1) / [OpenF1](https://openf1.org/).
- **Tennis Data:** Point-by-point Grand Slam final records from [Jeff Sackmann / Tennis Abstract](https://github.com/JeffSackmann).

*Non-commercial educational prototype developed exclusively for the Dream Sports Forward Deployed Engineer Intern evaluation.*
