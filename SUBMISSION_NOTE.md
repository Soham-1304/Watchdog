# Cutaway: 200-Word Submission Note
**Candidate:** Soham Karandikar  
**Role:** Forward Deployed Engineer Intern, Dream11 / Dream Sports (FanCode)  
**Artifact URL:** *(Insert deployed live link)*  
**Word Count:** 182 words (Hard limit: 200 words)

---

### The Fan Problem
FanCode broadcasts multiple live sports simultaneously—F1, tennis, cricket, football. A fan watching one match suffers constant FOMO regarding decisive moments occurring in concurrent streams. Today, checking means abandoning the video player, scrolling cluttered feeds, and guessing what matters. Existing score notifications spam on every routine point or boundary without understanding true game significance.

### How Cutaway Helps
Cutaway is an intelligent multi-match companion layer built for FanCode. A two-stage pipeline pairs a deterministic rules gate with an LLM scorer to identify genuinely pivotal turning points (1–10 significance, broadcast-grade 1-line explanation, novice rule explainers). Fans switch feeds in one tap, receive a concise "Since you left" catch-up card upon returning, and can inspect suppressed events as transparent proof of anti-bloat restraint. A configurable delay ensures alerts never spoil stream latency.

### AI Tools & Architecture
Powered by Google Gemini 1.5 Flash via a decoupled Python/Pydantic agent mesh (Significance Scorer, Broadcast Narrator, Novice Explainer, Catch-Up Synthesizer, and FactGuard reconciler). Built with Vite, React, TypeScript, and Tailwind CSS using synchronized, time-compressed real match replays (Cricsheet, FastF1, Sackmann Tennis). Engineered with modular adapter interfaces for direct drop-in to FanCode’s production event bus.
