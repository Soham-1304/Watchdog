# Watchdog: Calmer Multi-Match Viewing for FanCode

| Candidate | Role | GitHub | Live Demo |
|---|---|---|---|
| Soham Karandikar | Forward Deployed Engineer Intern, Dream Sports / FanCode | [github.com/Soham-1304/Watchdog](https://github.com/Soham-1304/Watchdog) | [Deployed Demo](https://watchdog-frontend-fujvvuz6p-2024sohamk-isuacins-projects.vercel.app) |

---

### The problem
Fans following several matches get an alert for every point, ball and lap. The moments that actually change a contest get buried, and newcomers meet jargon like “break point” or “safety car” with no help.

### How it helps
Watchdog sits beside the stream you’re watching. Each replayed event in tennis, F1 and cricket updates match state and passes a deterministic significance gate. Only qualifying moments trigger a short broadcast-style alert. Explanations appear only when jargon occurs. QuickWatch switches streams, and a catch-up brief summarises what you missed when you return.

### What I built
I designed the pipeline myself as a multi-agent framework. Separate agents handle event tracking, significance, narration and FactGuard, which checks every generated claim against match data before it’s shown. Offline fixtures keep the demo working without API access.

### AI tools
Gemini for narration (optional, with fallbacks), plus Antigravity for development. Stack: React, TypeScript, Vite, FastAPI, Pydantic.

### Link
- **GitHub**: https://github.com/Soham-1304/Watchdog
- **Live Demo**: https://watchdog-frontend-fujvvuz6p-2024sohamk-isuacins-projects.vercel.app

*(A prototype, not a FanCode integration)*
