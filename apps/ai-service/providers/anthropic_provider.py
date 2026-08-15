"""
Concrete AnthropicProvider — Claude Sonnet 5 for vision, Haiku 4.5 for workout
parsing per docs/architecture-plan.md SS D/H model routing. Reads the API key
only from the ANTHROPIC_API_KEY env var; never hardcoded.

If the `anthropic` package isn't installed, or no API key is configured, this
falls back to a clearly-labeled mock response instead of crashing, so every
endpoint stays exercisable end-to-end without live credentials.
"""
from __future__ import annotations

import logging
import time
from typing import Optional

from providers.base import ProviderResponse, VisionProvider

logger = logging.getLogger("ai-service.providers.anthropic")

try:
    from anthropic import AsyncAnthropic

    _ANTHROPIC_SDK_AVAILABLE = True
except ImportError:  # pragma: no cover - exercised when the package isn't installed
    AsyncAnthropic = None  # type: ignore[assignment]
    _ANTHROPIC_SDK_AVAILABLE = False


class AnthropicProvider(VisionProvider):
    def __init__(self, api_key: Optional[str]) -> None:
        self._mock_mode = not (_ANTHROPIC_SDK_AVAILABLE and api_key)
        self._client: Optional["AsyncAnthropic"] = None

        if self._mock_mode:
            reason = (
                "anthropic package not installed"
                if not _ANTHROPIC_SDK_AVAILABLE
                else "ANTHROPIC_API_KEY not set"
            )
            logger.warning(
                "AnthropicProvider running in MOCK MODE (%s) — "
                "responses are canned, not real model output.",
                reason,
            )
        else:
            self._client = AsyncAnthropic(api_key=api_key)

    @property
    def mock_mode(self) -> bool:
        return self._mock_mode

    async def complete(
        self,
        *,
        system: str,
        user_text: str,
        model: str,
        max_tokens: int,
    ) -> ProviderResponse:
        if self._mock_mode:
            return self._mock_response(model=model, task_hint=user_text)

        start = time.perf_counter()
        message = await self._client.messages.create(  # type: ignore[union-attr]
            model=model,
            max_tokens=max_tokens,
            system=system,
            messages=[{"role": "user", "content": user_text}],
        )
        latency_ms = (time.perf_counter() - start) * 1000
        return self._to_provider_response(message, model, latency_ms)

    async def complete_with_image(
        self,
        *,
        system: str,
        user_text: str,
        model: str,
        max_tokens: int,
        image_url: Optional[str] = None,
        image_base64: Optional[str] = None,
        image_media_type: str = "image/jpeg",
    ) -> ProviderResponse:
        if self._mock_mode:
            return self._mock_response(model=model, task_hint=user_text)

        content: list[dict] = []
        if image_url:
            content.append({"type": "image", "source": {"type": "url", "url": image_url}})
        elif image_base64:
            content.append(
                {
                    "type": "image",
                    "source": {
                        "type": "base64",
                        "media_type": image_media_type,
                        "data": image_base64,
                    },
                }
            )
        content.append({"type": "text", "text": user_text})

        start = time.perf_counter()
        message = await self._client.messages.create(  # type: ignore[union-attr]
            model=model,
            max_tokens=max_tokens,
            system=system,
            messages=[{"role": "user", "content": content}],
        )
        latency_ms = (time.perf_counter() - start) * 1000
        return self._to_provider_response(message, model, latency_ms)

    @staticmethod
    def _to_provider_response(message, model: str, latency_ms: float) -> ProviderResponse:
        text_parts = [block.text for block in message.content if block.type == "text"]
        return ProviderResponse(
            raw_text="\n".join(text_parts),
            model=model,
            input_tokens=message.usage.input_tokens,
            output_tokens=message.usage.output_tokens,
            latency_ms=latency_ms,
            mock=False,
        )

    @staticmethod
    def _mock_response(*, model: str, task_hint: str) -> ProviderResponse:
        """A single mock generator covers both text and vision calls — the
        caller (gateway) always parses `raw_text` as JSON regardless of task,
        so the mock payload just needs to match whichever schema the prompt
        asked for. We detect which by a cheap substring check on the prompt
        rather than a second provider method, since the shape of the mock is
        the only thing that differs."""
        import json

        if '"estimatedWeightRangeG"' in task_hint or "food" in task_hint.lower():
            mock_payload = {
                "items": [
                    {
                        "foodName": "Idli (steamed rice cake)",
                        "estimatedWeightG": 120,
                        "estimatedWeightRangeG": [100, 140],
                        "unit": "piece",
                        "quantity": 2,
                        "calories": 156,
                        "proteinG": 4.4,
                        "carbsG": 32.0,
                        "fatG": 0.6,
                        "fiberG": 1.2,
                        "confidence": 0.55,
                        "source": "AI_ESTIMATE",
                    },
                    {
                        "foodName": "Sambar",
                        "estimatedWeightG": 150,
                        "estimatedWeightRangeG": [120, 180],
                        "unit": "bowl",
                        "quantity": 1,
                        "calories": 120,
                        "proteinG": 6.0,
                        "carbsG": 18.0,
                        "fatG": 3.0,
                        "fiberG": 4.5,
                        "confidence": 0.5,
                        "source": "AI_ESTIMATE",
                    },
                ]
            }
        else:
            mock_payload = {
                "sets": [
                    {"exerciseName": "Bench Press", "setNumber": 1, "weightKg": 60, "reps": 10},
                    {"exerciseName": "Bench Press", "setNumber": 2, "weightKg": 65, "reps": 8},
                    {"exerciseName": "Bench Press", "setNumber": 3, "weightKg": 65, "reps": 7},
                ],
                "needsConfirmation": False,
                "ambiguousFields": None,
            }

        return ProviderResponse(
            raw_text=json.dumps(mock_payload),
            model=f"{model} (mock)",
            input_tokens=0,
            output_tokens=0,
            latency_ms=0.0,
            mock=True,
        )
