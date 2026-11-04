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
1. **Event-Triggered Agent Pipeline:** Scores each event against the current state and up to three earlier events from the same match. The broadcast narrator runs only above the selected significance threshold; the novice explainer runs only for script-tagged jargon. FactGuard checks generated narrative before delivery.
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
│  Event Sequencer     │  (Separate sport scripts, one shared ordered timeline)
└──────────┬───────────┘
           │ One event + current state + up to 3 prior events
           ▼
┌────────────────────────┐
│ Significance Agent     │  (Scores each event 1-10)
└──────────┬─────────────┘
           │ Qualifying event / jargon tag
           ▼
┌────────────────────────┐
│ Narrative + Novice     │  (Narrative by threshold; explainer by jargon)
└──────────┬─────────────┘
           │ FactGuard checked result
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

## 4. Production Integration Path

This prototype currently uses local replay fixtures. Its normalized `MatchEvent` contract gives a future live-data adapter a clear integration point, but a FanCode event-bus adapter, stream synchronization, credentials, and production validation are not included. Those would need to be supplied and tested with FanCode's telemetry and player infrastructure.

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
- Python 3.10+

### Quick Start
```bash
# 1. Install dependencies
npm install

# 2. Install the AI service dependencies
python -m pip install -r backend/requirements.txt

# 3. Optional: copy .env.example to .env and set GEMINI_API_KEY for live model calls.
# The key is read by the Python service and is never sent to the browser.

# 4. Start the AI service in one terminal
python -m uvicorn backend.main:app --reload --port 8000

# 5. Start the frontend in another terminal
npm run dev

# 6. Open in browser
http://localhost:5173
```

When the AI service or Gemini key is unavailable, the event pipeline returns deterministic fixture-backed results.

## 7. Deployment Preparation

The frontend is configured for Vercel (`vercel.json`); the FastAPI service has a Render Blueprint (`render.yaml`). Deploy them as separate services:

1. Create the Render service from this repository's `render.yaml`. Set `FRONTEND_ORIGINS` to the exact Vercel site origin (comma-separated if there are preview origins) and optionally set the server-side `GEMINI_API_KEY`.
2. Deploy the repository to Vercel. Set the build-time variable `VITE_CUTAWAY_API_URL` to the Render service origin, without a trailing slash, then redeploy the frontend.
3. Check `https://<render-service>/api/v1/health`, then open the Vercel URL and advance events to confirm API calls or deterministic fallback.

The frontend continues to use deterministic local outputs if the separate API is unreachable. Never put `GEMINI_API_KEY` in a `VITE_` variable.

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

## 8. Guided Demo Walkthrough (3 Minutes)

1. **The Problem (0:00 - 0:20):** *"I'm watching Sinner on FanCode. An F1 title decider and T20 World Cup final are live in the background. If I leave to check, I break my viewing immersion. If I don't, I find out 10 minutes too late."*
2. **The Sentinel (0:20 - 0:45):** Start the replay. Point to the "Other Feeds" strip monitoring background matches.
3. **The First Alert (0:45 - 1:15):** At ~0:15 replay time, Latifi crashes in F1. The card slides in with `9/10 PIVOTAL`, the 1-line reason, and the Novice Rule explainer. Tap **"Switch to Stream"** in one tap.
4. **The Catch-Up (1:15 - 1:45):** Switch back to Tennis. The **Catch-Up Card** appears: *"Since you left (1m 15s ago), Sinner broke Medvedev's serve in Game 6..."*
5. **Proof of Restraint (1:45 - 2:20):** Click **"Suppressed: 23 ev / 6 al"** in the top bar. Show the evaluator the decoy boundary event (scored 4/10) that was held back to prevent spam.
6. **The FDE Production Story (2:20 - 3:00):** Show `fancodeAdapter.stub.ts`. Highlight that only the adapter changes when deploying to FanCode's live WebSocket.

---

## 9. Data Credits & License

- **Cricket Data:** Ball-by-ball match dataset from [Cricsheet](https://cricsheet.org/) (Creative Commons Attribution-ShareAlike 4.0 International).
- **Formula 1 Data:** Telemetry and lap timing structured from [FastF1](https://github.com/theOehrly/Fast-F1) / [OpenF1](https://openf1.org/).
- **Tennis Data:** Point-by-point Grand Slam final records from [Jeff Sackmann / Tennis Abstract](https://github.com/JeffSackmann).

*Non-commercial educational prototype developed exclusively for the Dream Sports Forward Deployed Engineer Intern evaluation.*
