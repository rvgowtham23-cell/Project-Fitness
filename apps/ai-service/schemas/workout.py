"""
Pydantic models mirroring packages/shared-types/src/index.ts (WorkoutSetInput,
ParsedWorkoutResponse) field-for-field.
"""
from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class WorkoutSetInput(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    exercise_name: str = Field(alias="exerciseName")
    set_number: int = Field(alias="setNumber", ge=1)
    weight_kg: Optional[float] = Field(default=None, alias="weightKg", ge=0)
    reps: Optional[int] = Field(default=None, ge=0)
    duration_seconds: Optional[float] = Field(default=None, alias="durationSeconds", ge=0)
    rest_seconds: Optional[float] = Field(default=None, alias="restSeconds", ge=0)


class ParsedWorkoutResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    ai_request_id: str = Field(alias="aiRequestId")
    sets: list[WorkoutSetInput]
    needs_confirmation: bool = Field(alias="needsConfirmation")
    ambiguous_fields: Optional[list[str]] = Field(default=None, alias="ambiguousFields")


class WorkoutParseLLMOutput(BaseModel):
    """Shape required from the parser LLM, validated before use. Ambiguous
    fields must be surfaced here, not silently guessed — see prompts/workout.py
    and architecture-plan.md SS H ("any ambiguity ... is surfaced for user
    confirmation -- never auto-inserted")."""

    model_config = ConfigDict(populate_by_name=True)

    sets: list[WorkoutSetInput]
    needs_confirmation: bool = Field(alias="needsConfirmation")
    ambiguous_fields: Optional[list[str]] = Field(default=None, alias="ambiguousFields")


class ParseWorkoutTextRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    text: str = Field(min_length=1)
