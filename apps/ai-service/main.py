"""
AI Service (Python/FastAPI) — the AISvc node in docs/architecture-plan.md SS E.

Pure AI orchestration: no user database, no business/transactional logic.
Called over HTTP by the main NestJS backend's AiGatewayModule. Every
request/response is validated against a schema here before it's returned —
see gateway.py.
"""
from __future__ import annotations

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI

from config import get_settings
from gateway import AIGateway
from providers.anthropic_provider import AnthropicProvider
from routers import coach, meal, voice, workout
from storage.request_log import RequestLog

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ai-service")


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()
    provider = AnthropicProvider(api_key=settings.anthropic_api_key)
    request_log = RequestLog(db_path=settings.request_log_db_path)

    app.state.settings = settings
    app.state.gateway = AIGateway(
        settings=settings,
        vision_provider=provider,
        llm_provider=provider,
        request_log=request_log,
    )
    app.state.mock_mode = provider.mock_mode

    if provider.mock_mode:
        logger.warning(
            "AI service starting in MOCK MODE — no ANTHROPIC_API_KEY configured "
            "or the anthropic package is unavailable. Endpoints are exercisable "
            "end-to-end but return canned, clearly-labeled mock responses."
        )

    yield


app = FastAPI(
    title="AI Service",
    description="AI orchestration worker for the fitness/nutrition platform (see docs/architecture-plan.md SS H).",
    version="0.1.0",
    lifespan=lifespan,
)


@app.get("/health")
async def health() -> dict:
    return {
        "status": "ok",
        "service": "ai-service",
        "mockMode": getattr(app.state, "mock_mode", True),
    }


app.include_router(meal.router)
app.include_router(workout.router)
app.include_router(coach.router)
app.include_router(voice.router)
