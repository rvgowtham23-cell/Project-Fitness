"""
Speech-to-text (Whisper) — V1/voice-logging scope, not MVP
(docs/architecture-plan.md SS K: "voice workout logging" is V1; MVP workout
logging is text-only). STT provider selection (self-hosted Whisper vs.
commercial cloud STT) is an explicit open bake-off per SS C, deferred until
voice logging is actually built.

TODO(V1): implement an STTProvider (mirroring providers/base.py's
LLMProvider/VisionProvider shape) and wire this into the same text parser used
by /parse-workout-text (docs/architecture-plan.md SS H: "same parser code path
for both inputs").
"""
from __future__ import annotations

from fastapi import APIRouter, HTTPException

router = APIRouter(tags=["voice"])


@router.post("/parse-workout-voice")
async def parse_workout_voice() -> None:
    raise HTTPException(
        status_code=501,
        detail=(
            "Voice workout logging (STT) is V1 scope (see docs/architecture-plan.md "
            "SS K) and is not implemented in this MVP AI service."
        ),
    )
