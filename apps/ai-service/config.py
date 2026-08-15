"""
Config-driven model routing (see docs/architecture-plan.md SS H: "AI Gateway ...
Handles model routing ... so no provider is hardcoded").

Swapping providers/models for a task is an env var change here, never a
change to calling code in routers/ or gateway.py.
"""
from __future__ import annotations

from enum import Enum
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class TaskType(str, Enum):
    VISION_MEAL_ANALYSIS = "vision_meal_analysis"
    WORKOUT_PARSE = "workout_parse"
    COACH_CHAT = "coach_chat"  # V1 scope — see routers/coach.py


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    anthropic_api_key: str | None = None

    # Model routing per docs/architecture-plan.md SS H / SS D:
    # Sonnet 5 for vision + coach (structured-output adherence, single-vendor
    # simplicity); Haiku 4.5 for workout parsing (narrow extraction -> cheap
    # model tier).
    vision_model: str = "claude-sonnet-5"
    workout_parse_model: str = "claude-haiku-4-5"
    coach_model: str = "claude-sonnet-5"

    vision_max_tokens: int = 2048
    workout_max_tokens: int = 1024
    coach_max_tokens: int = 2048

    request_log_db_path: str = "ai_service_requests.db"

    host: str = "0.0.0.0"
    port: int = 8000


@lru_cache
def get_settings() -> Settings:
    return Settings()


# Rough list-price cost estimates ($ per million tokens), input/output.
# Used only for the cost column in the request/response log — not billing-grade.
MODEL_PRICING_PER_MTOK: dict[str, dict[str, float]] = {
    "claude-sonnet-5": {"input": 3.0, "output": 15.0},
    "claude-haiku-4-5": {"input": 1.0, "output": 5.0},
}


def estimate_cost_usd(model: str, input_tokens: int, output_tokens: int) -> float:
    pricing = MODEL_PRICING_PER_MTOK.get(model)
    if pricing is None:
        return 0.0
    return (input_tokens / 1_000_000) * pricing["input"] + (
        output_tokens / 1_000_000
    ) * pricing["output"]


def build_task_model_map(settings: Settings) -> dict[TaskType, dict]:
    """task_type -> {provider, model, max_tokens}. The single place a task's
    provider/model pairing is decided — routers and gateway never hardcode a
    model string."""
    return {
        TaskType.VISION_MEAL_ANALYSIS: {
            "provider": "anthropic",
            "model": settings.vision_model,
            "max_tokens": settings.vision_max_tokens,
        },
        TaskType.WORKOUT_PARSE: {
            "provider": "anthropic",
            "model": settings.workout_parse_model,
            "max_tokens": settings.workout_max_tokens,
        },
        TaskType.COACH_CHAT: {
            "provider": "anthropic",
            "model": settings.coach_model,
            "max_tokens": settings.coach_max_tokens,
        },
    }
