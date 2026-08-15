"""
AI Coach — V1 scope, not MVP (docs/architecture-plan.md SS K/H). The coach's
full tool-calling architecture (scoped server-side tools like
get_nutrition_summary/get_workout_history/get_weight_trend/
get_user_profile_and_goals/search_food_database, each resolving the
authenticated user server-side rather than a model-settable user_id; a
pre-classification safety pass for high-risk messages; hard-clamped calorie
floors enforced in code, not just prompted) is intentionally NOT implemented
here. This stub only reserves the route shape described in
docs/architecture-plan.md SS G (`POST /coach/chat`, SSE streamed).

TODO(V1): implement per docs/architecture-plan.md SS H "AI Coach" and
"Coach safety boundaries" before this leaves stub status.
"""
from __future__ import annotations

from fastapi import APIRouter, HTTPException

router = APIRouter(tags=["coach"])


@router.post("/coach/chat")
async def coach_chat() -> None:
    raise HTTPException(
        status_code=501,
        detail=(
            "AI Coach is V1 scope (see docs/architecture-plan.md SS K) and is not "
            "implemented in this MVP AI service."
        ),
    )
