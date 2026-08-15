"""
Pydantic models mirroring packages/shared-types/src/index.ts (MealItemEstimate,
AnalyzeMealImageResponse) field-for-field, so the NestJS backend's response
validation matches what this service actually returns. Field names use
camelCase aliases to match the TS shape over the wire; Python code uses the
snake_case attribute names.
"""
from __future__ import annotations

from enum import Enum
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


class SourceType(str, Enum):
    USDA = "USDA"
    IFCT = "IFCT"
    OPENFOODFACTS = "OPENFOODFACTS"
    ADMIN = "ADMIN"
    USER = "USER"
    AI_ESTIMATE = "AI_ESTIMATE"


class MealItemEstimate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    food_name: str = Field(alias="foodName")
    estimated_weight_g: float = Field(alias="estimatedWeightG", gt=0)
    # Portions are always a range (e.g. 150-180g), never a bare exact number —
    # there is no ground-truth weight sensor, so a single-number "exact gram"
    # claim overstates the model's real accuracy (architecture-plan.md SS H/M).
    estimated_weight_range_g: tuple[float, float] = Field(alias="estimatedWeightRangeG")
    unit: str
    quantity: float = Field(gt=0)
    calories: float = Field(ge=0)
    protein_g: float = Field(alias="proteinG", ge=0)
    carbs_g: float = Field(alias="carbsG", ge=0)
    fat_g: float = Field(alias="fatG", ge=0)
    fiber_g: float = Field(alias="fiberG", ge=0)
    confidence: float = Field(ge=0, le=1)
    source: SourceType = SourceType.AI_ESTIMATE

    @field_validator("estimated_weight_range_g")
    @classmethod
    def range_is_ordered(cls, v: tuple[float, float]) -> tuple[float, float]:
        lo, hi = v
        if lo <= 0 or hi <= 0:
            raise ValueError("estimatedWeightRangeG values must be positive")
        if lo > hi:
            raise ValueError("estimatedWeightRangeG must be (low, high) with low <= high")
        return v

    @model_validator(mode="after")
    def weight_within_range(self) -> "MealItemEstimate":
        lo, hi = self.estimated_weight_range_g
        if not (lo <= self.estimated_weight_g <= hi):
            # Clamp rather than reject outright — the model occasionally emits
            # a point estimate a hair outside its own stated range; treating
            # that as a hard validation failure would throw away an otherwise
            # usable estimate.
            self.estimated_weight_g = max(lo, min(hi, self.estimated_weight_g))
        return self


class AnalyzeMealImageResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    ai_request_id: str = Field(alias="aiRequestId")
    items: list[MealItemEstimate]
    overall_confidence: float = Field(alias="overallConfidence", ge=0, le=1)


class MealAnalysisLLMOutput(BaseModel):
    """Shape we require the vision LLM to return, validated before any of it
    is trusted downstream (architecture-plan.md SS E/H: AI output is treated
    as untrusted input, never a source of truth by itself). Deliberately
    excludes aiRequestId/overallConfidence — those are computed server-side,
    not taken from the model (see gateway.py)."""

    items: list[MealItemEstimate]


class UserDietaryContext(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    dietary_preferences: list[str] = Field(default_factory=list, alias="dietaryPreferences")
    allergies: list[str] = Field(default_factory=list)


class AnalyzeMealImageRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    image_url: Optional[str] = Field(default=None, alias="imageUrl")
    image_base64: Optional[str] = Field(default=None, alias="imageBase64")
    image_media_type: str = Field(default="image/jpeg", alias="imageMediaType")
    dietary_preferences: list[str] = Field(default_factory=list, alias="dietaryPreferences")
    allergies: list[str] = Field(default_factory=list)

    @model_validator(mode="after")
    def one_image_source_required(self) -> "AnalyzeMealImageRequest":
        if not self.image_url and not self.image_base64:
            raise ValueError("Either imageUrl or imageBase64 is required")
        return self
