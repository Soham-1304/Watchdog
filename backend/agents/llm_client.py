"""
Cutaway: Unified LLM Client for Specialized Agents
Calls Gemini API with structured JSON schema output and fallback handling.
"""

import os
import json
import httpx
from typing import Type, TypeVar, Optional, Any
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

T = TypeVar("T", bound=BaseModel)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"

async def call_structured_agent(
    system_instruction: str,
    prompt: str,
    response_schema: Type[T],
    fallback_data: Optional[dict[str, Any]] = None,
    timeout_seconds: float = 4.0
) -> T:
    """
    Invokes Gemini with strict JSON schema compliance and validates with Pydantic.
    Falls back gracefully if the API is offline or key is unset.
    """
    if not GEMINI_API_KEY:
        if fallback_data:
            return response_schema.model_validate(fallback_data)
        raise ValueError("GEMINI_API_KEY is not set and no fallback data provided.")

    headers = {"Content-Type": "application/json"}
    payload = {
        "contents": [
            {
                "role": "user",
                "parts": [{"text": f"{system_instruction}\n\nTask Input:\n{prompt}"}]
            }
        ],
        "generationConfig": {
            "temperature": 0.1,
            "responseMimeType": "application/json"
        }
    }

    try:
        async with httpx.AsyncClient(timeout=timeout_seconds) as client:
            resp = await client.post(
                f"{GEMINI_ENDPOINT}?key={GEMINI_API_KEY}",
                headers=headers,
                json=payload
            )
            if resp.status_code != 200:
                raise RuntimeError(f"Gemini API returned status {resp.status_code}: {resp.text}")

            result = resp.json()
            raw_text = result["candidates"][0]["content"]["parts"][0]["text"]
            parsed_json = json.loads(raw_text)
            return response_schema.model_validate(parsed_json)
    except Exception as e:
        print(f"[Cutaway LLM Client] Call failed or timed out ({e}). Falling back to deterministic output.")
        if fallback_data:
            return response_schema.model_validate(fallback_data)
        raise e
