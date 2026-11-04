# Watchdog — 200-Word Project Submission

| Candidate | Role | Demo |
|---|---|---|
| Soham Karandikar | Forward Deployed Engineer Intern, Dream Sports / FanCode | https://watchdog-frontend-fujvvuz6p-2024sohamk-isuacins-projects.vercel.app |

**Word count:** 200 (submission body; headings and metadata excluded)

## The problem

Watchdog is a multi-match companion concept for FanCode. It helps fans follow concurrent sports without leaving their current stream. Noisy alerts obscure moments that change a contest; Watchdog aims to surface significant events.

## How it works

Replay scripts cover tennis, Formula 1, and cricket. Each event updates its match state and passes through a deterministic significance gate. Qualifying events trigger a concise broadcast-style narrative, while novice explanations appear only when sports jargon occurs. FactGuard checks generated claims against match data. Fixture fallbacks keep the walkthrough usable offline. QuickWatch switches streams, and a catch-up brief summarizes missed events when viewers return.

## Implementation

The interface pairs React, TypeScript, and Vite with a FastAPI service using Pydantic schemas and optional Gemini calls. A stepwise event walkthrough keeps context visible without pretending to provide live video. Stream-specific visuals keep scores, alerts, and explanations central.

## Scope

Watchdog is a prototype, not a FanCode production integration. Its normalized event contract provides a starting point for a future live-data adapter. Connecting it requires FanCode telemetry and event access, stream synchronization, production credentials, and operational validation. The project demonstrates how restrained, fact-checked alerts could help viewers stay informed across simultaneous matches while keeping the primary stream central. This supports calmer shared match awareness.
