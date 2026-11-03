"""
Cutaway: Enterprise FastAPI Service
Exposes REST and SSE endpoints for multi-agent evaluation and real-time streaming.
"""

import json
import asyncio
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from backend.models.schemas import MatchEvent, EnrichedAlert, CatchUpOutput
from backend.services.orchestrator import PipelineOrchestrator
from backend.agents.catchup import generate_catch_up

app = FastAPI(
    title="Cutaway Sports Intelligence Service",
    version="1.0.0",
    description="Decoupled AI multi-agent service for FanCode live streaming"
)

# Enable CORS for local Vite development and production origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CatchUpRequest(BaseModel):
    match_id: str
    duration_absent_seconds: int
    missed_events: list[MatchEvent]
    current_state_line: str

@app.get("/api/v1/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "cutaway-intelligence",
        "agents": ["SignificanceAgent", "NarrativeAgent", "NoviceAgent", "CatchUpAgent", "FactGuard"]
    }

@app.post("/api/v1/evaluate")
async def evaluate_event(event: MatchEvent):
    """Evaluates an incoming match event through the multi-agent pipeline."""
    try:
        alert, suppression_reason = await PipelineOrchestrator.process_event(event)
        return {
            "event_id": event.id,
            "qualified": alert is not None,
            "alert": alert,
            "suppression_reason": suppression_reason
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/catch-up", response_model=CatchUpOutput)
async def get_catch_up(req: CatchUpRequest):
    """Generates a contextual catch-up brief for stream-switchers."""
    try:
        return await generate_catch_up(
            match_id=req.match_id,
            duration_absent_seconds=req.duration_absent_seconds,
            missed_events=req.missed_events,
            current_state_line=req.current_state_line
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/stream")
async def sse_event_stream():
    """
    Server-Sent Events (SSE) live broadcast simulation.
    Streams normalized match events across concurrent sports in real-time.
    """
    replay_dir = Path(__file__).resolve().parent.parent / "public" / "replay"
    events: list[dict] = []

    for sport_file in ["match-cricket.json", "match-f1.json", "match-tennis.json"]:
        file_path = replay_dir / sport_file
        if file_path.exists():
            with open(file_path) as f:
                events.extend(json.load(f))

    events.sort(key=lambda x: x["t"])

    async def event_generator():
        current_t = 0.0
        for ev in events:
            delay = max(0.1, (ev["t"] - current_t) / 10.0)  # 10x simulation speed
            await asyncio.sleep(delay)
            current_t = ev["t"]
            yield f"data: {json.dumps(ev)}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
