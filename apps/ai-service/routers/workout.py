from __future__ import annotations

from fastapi import APIRouter, Request

from schemas.workout import ParsedWorkoutResponse, ParseWorkoutTextRequest

router = APIRouter(tags=["workout"])


@router.post("/parse-workout-text", response_model=ParsedWorkoutResponse)
async def parse_workout_text(
    request: ParseWorkoutTextRequest, http_request: Request
) -> ParsedWorkoutResponse:
    gateway = http_request.app.state.gateway
    return await gateway.parse_workout_text(text=request.text)
