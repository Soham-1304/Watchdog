# Cutaway — Submission Note

**Candidate:** Soham Karandikar
**Role:** Forward Deployed Engineer Intern, Dream Sports / FanCode
**Live demo:** *(add deployment URL after release)*
**Word count:** 200 (excluding this heading and metadata)

Cutaway is a multi-match companion concept for FanCode. It helps fans follow concurrent sports without leaving their current stream. Noisy alerts obscure moments that change a contest; Cutaway aims to surface significant events.

Replay scripts cover tennis, Formula 1, and cricket. Each event updates its match state and passes through a deterministic significance gate. Qualifying events trigger a concise broadcast-style narrative, while novice explanations appear only when sports jargon occurs. FactGuard checks generated claims against match data. Fixture fallbacks keep the walkthrough usable offline. QuickWatch switches streams, and a catch-up brief summarizes missed events when viewers return.

The interface pairs React, TypeScript, and Vite with a FastAPI service using Pydantic schemas and optional Gemini calls. A stepwise event walkthrough keeps context visible without pretending to provide live video. Stream-specific visuals keep scores, alerts, and explanations central.

Cutaway is a prototype, not a FanCode production integration. Its normalized event contract provides a starting point for a future live-data adapter. Connecting it requires FanCode telemetry and event access, stream synchronization, production credentials, and operational validation. The project demonstrates how restrained, fact-checked alerts could help viewers stay informed across simultaneous matches while keeping the primary stream central. This supports calmer shared match awareness.
