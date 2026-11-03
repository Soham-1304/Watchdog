"""
Cutaway: Pydantic v2 Core Schemas
Strictly typed data contracts for sports telemetry, match events, and multi-agent outputs.
"""

from typing import Literal, Optional, Union, Any
from pydantic import BaseModel, Field, ConfigDict

# ==============================================================================
# 1. Sport Specific Telemetry Models
# ==============================================================================

class CricketBatter(BaseModel):
    model_config = ConfigDict(extra="ignore")
    name: str
    runs: int = Field(ge=0)
    balls: int = Field(ge=0)


class CricketBowler(BaseModel):
    model_config = ConfigDict(extra="ignore")
    name: str
    figures: str  # e.g. "4-0-18-2"


class CricketState(BaseModel):
    model_config = ConfigDict(extra="ignore")
    innings: Literal[1, 2]
    battingTeam: str
    bowlingTeam: str
    score: int = Field(ge=0)
    wickets: int = Field(ge=0, le=10)
    overs: float = Field(ge=0.0, le=50.0)
    target: Optional[int] = None
    requiredRunRate: Optional[float] = None
    currentRunRate: float = Field(ge=0.0)
    currentBatters: list[CricketBatter]
    currentBowler: CricketBowler
    lastOverSummary: Optional[list[str]] = Field(default_factory=list)


class F1DriverStanding(BaseModel):
    model_config = ConfigDict(extra="ignore")
    pos: int = Field(ge=1, le=20)
    driver: str
    code: str
    team: str
    gap: str
    tyre: Literal["SOFT", "MEDIUM", "HARD", "INTER", "WET"]
    pitStops: int = Field(ge=0)


class F1State(BaseModel):
    model_config = ConfigDict(extra="ignore")
    lap: int = Field(ge=1)
    totalLaps: int = Field(ge=1)
    leader: str
    standings: list[F1DriverStanding]
    status: Literal["GREEN", "SAFETY_CAR", "VSC", "RED_FLAG"]
    lastPitStop: Optional[dict[str, Any]] = None


class TennisPlayer(BaseModel):
    model_config = ConfigDict(extra="ignore")
    name: str
    seed: Optional[str] = None
    setsWon: int = Field(ge=0, le=3)


class TennisState(BaseModel):
    model_config = ConfigDict(extra="ignore")
    player1: TennisPlayer
    player2: TennisPlayer
    setScores: list[str]
    currentSet: int = Field(ge=1, le=5)
    gameScore: str  # e.g. "40-30", "40-AD", "FINAL"
    server: Literal[1, 2]
    isBreakPoint: bool = False
    isSetPoint: bool = False
    isMatchPoint: bool = False
    isTiebreak: bool = False


# ==============================================================================
# 2. Normalized Match Event
# ==============================================================================

SportType = Literal["cricket", "f1", "tennis"]

class MatchEvent(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    match_id: str
    sport: SportType
    t: float = Field(ge=0.0, description="Normalized replay clock seconds")
    type: str
    headline: str
    actors: list[str] = Field(default_factory=list)
    state: Union[CricketState, F1State, TennisState, dict[str, Any]]


# ==============================================================================
# 3. Multi-Agent Persona Output Schemas
# ==============================================================================

class SignificanceOutput(BaseModel):
    """Output from Agent 1: Quantitative Significance & Leverage Scorer"""
    model_config = ConfigDict(extra="ignore")
    event_id: str
    importance_score: int = Field(ge=1, le=10, description="1-10 significance rating")
    leverage_category: Literal["routine", "notable", "major_swing", "championship_decider"]
    state_delta_summary: str = Field(max_length=100, description="Factual change in game equation")
    confidence: float = Field(ge=0.0, le=1.0, default=1.0)


class NarrativeOutput(BaseModel):
    """Output from Agent 2: Broadcast Color Analyst (The 'Why')"""
    model_config = ConfigDict(extra="ignore")
    event_id: str
    headline: str = Field(max_length=95, description="Clear, urgent broadcast alert line")
    why_it_matters: str = Field(max_length=145, description="1-line strategic context")
    primary_tags: list[str] = Field(min_length=1, max_length=5)


class NoviceOutput(BaseModel):
    """Output from Agent 3: Novice Fan Jargon Translator"""
    model_config = ConfigDict(extra="ignore")
    event_id: str
    term_detected: str
    plain_english_explanation: str = Field(max_length=130, description="Plain-English explanation")
    relevance_to_moment: str = Field(max_length=100)


class CatchUpOutput(BaseModel):
    """Output from Agent 4: Stream-Return Catch-Up Synthesizer"""
    model_config = ConfigDict(extra="ignore")
    match_id: str
    duration_absent_seconds: int = Field(ge=0)
    events_missed_count: int = Field(ge=0)
    recap_narrative: str = Field(max_length=190, description="Strictly max 2 factual sentences")
    current_game_equation: str = Field(max_length=100)


class FactGuardResult(BaseModel):
    """Output from Guardrail Layer: Entity Verification & Anti-Hallucination Gate"""
    passed: bool
    verified_entities: list[str] = Field(default_factory=list)
    flagged_discrepancies: list[str] = Field(default_factory=list)
    safe_output: dict[str, Any]


class EnrichedAlert(BaseModel):
    """Consolidated alert payload distributed to clients"""
    event_id: str
    match_id: str
    sport: SportType
    t: float
    importance: int = Field(ge=1, le=10)
    alert: str
    why: str
    novice_note: Optional[str] = None
    tags: list[str] = Field(default_factory=list)
    source: Literal["live_agent_mesh", "cached_fallback"] = "live_agent_mesh"
