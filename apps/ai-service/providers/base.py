"""
AI Gateway provider abstraction (docs/architecture-plan.md SS H: "single
abstraction (LLMProvider/VisionProvider/STTProvider/ProductLookupProvider
interfaces) so no provider is hardcoded"). STTProvider / ProductLookupProvider
are out of scope for this scaffold (voice logging and barcode lookup are V1 /
owned by the main backend respectively) — only LLMProvider and VisionProvider
are implemented here.
"""
from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Optional


@dataclass
class ProviderResponse:
    """Raw provider output plus everything the gateway needs to log a
    request/response record (provider, model, tokens, latency, cost)."""

    raw_text: str
    model: str
    input_tokens: int
    output_tokens: int
    latency_ms: float
    mock: bool = False


class LLMProvider(ABC):
    """Text-only completion provider (e.g. workout-text parsing)."""

    @abstractmethod
    async def complete(
        self,
        *,
        system: str,
        user_text: str,
        model: str,
        max_tokens: int,
    ) -> ProviderResponse:
        ...


class VisionProvider(LLMProvider):
    """Extends LLMProvider with image input (e.g. meal-photo analysis).
    A VisionProvider is-a LLMProvider so the gateway can route either task
    type through the same `providers: list[LLMProvider]` shape if needed."""

    @abstractmethod
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
        ...
