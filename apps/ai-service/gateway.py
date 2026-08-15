"""
AI Gateway: routes each task type to its configured provider/model, logs a
request/response record, and validates every provider response against its
expected schema before returning it — model output is treated as untrusted
input, never a source of truth by itself (docs/architecture-plan.md SS E/H).
"""
from __future__ import annotations

import json
import logging
import re
import uuid
from typing import Optional

from fastapi import HTTPException

from config import Settings, TaskType, build_task_model_map, estimate_cost_usd
from providers.base import LLMProvider, ProviderResponse, VisionProvider
from prompts.meal import SYSTEM_PROMPT as MEAL_SYSTEM_PROMPT
from prompts.meal import build_meal_analysis_user_text
from prompts.workout import SYSTEM_PROMPT as WORKOUT_SYSTEM_PROMPT
from prompts.workout import build_workout_parse_user_text
from schemas.meal import AnalyzeMealImageResponse, MealAnalysisLLMOutput
from schemas.workout import ParsedWorkoutResponse, WorkoutParseLLMOutput
from storage.request_log import RequestLog, RequestLogEntry

logger = logging.getLogger("ai-service.gateway")

_JSON_FENCE_RE = re.compile(r"```(?:json)?\s*(.*?)\s*```", re.DOTALL)


def _extract_json_object(raw_text: str) -> dict:
    """Model output is untrusted text, not guaranteed-clean JSON — strip an
    optional markdown code fence and locate the outermost {...} object before
    parsing, rather than assuming raw_text is already bare JSON."""
    text = raw_text.strip()
    fence_match = _JSON_FENCE_RE.search(text)
    if fence_match:
        text = fence_match.group(1).strip()

    first_brace = text.find("{")
    last_brace = text.rfind("}")
    if first_brace == -1 or last_brace == -1 or last_brace < first_brace:
        raise ValueError("No JSON object found in provider response")
    text = text[first_brace : last_brace + 1]

    try:
        return json.loads(text)
    except json.JSONDecodeError as exc:
        raise ValueError(f"Provider response was not valid JSON: {exc}") from exc


class AIGateway:
    def __init__(
        self,
        settings: Settings,
        vision_provider: VisionProvider,
        llm_provider: LLMProvider,
        request_log: RequestLog,
    ) -> None:
        self._settings = settings
        self._vision_provider = vision_provider
        self._llm_provider = llm_provider
        self._request_log = request_log
        self._task_model_map = build_task_model_map(settings)

    def _log(
        self,
        *,
        ai_request_id: str,
        task_type: TaskType,
        response: ProviderResponse,
        validation_ok: bool,
    ) -> None:
        cost = estimate_cost_usd(response.model, response.input_tokens, response.output_tokens)
        self._request_log.record(
            RequestLogEntry(
                ai_request_id=ai_request_id,
                task_type=task_type.value,
                provider="anthropic",
                model=response.model,
                input_tokens=response.input_tokens,
                output_tokens=response.output_tokens,
                latency_ms=response.latency_ms,
                cost_estimate_usd=cost,
                mock=response.mock,
                validation_ok=validation_ok,
            )
        )

    async def analyze_meal_image(
        self,
        *,
        image_url: Optional[str],
        image_base64: Optional[str],
        image_media_type: str,
        dietary_preferences: list[str],
        allergies: list[str],
    ) -> AnalyzeMealImageResponse:
        task_cfg = self._task_model_map[TaskType.VISION_MEAL_ANALYSIS]
        ai_request_id = str(uuid.uuid4())
        user_text = build_meal_analysis_user_text(dietary_preferences, allergies)

        response = await self._vision_provider.complete_with_image(
            system=MEAL_SYSTEM_PROMPT,
            user_text=user_text,
            model=task_cfg["model"],
            max_tokens=task_cfg["max_tokens"],
            image_url=image_url,
            image_base64=image_base64,
            image_media_type=image_media_type,
        )

        try:
            parsed_json = _extract_json_object(response.raw_text)
            llm_output = MealAnalysisLLMOutput.model_validate(parsed_json)
        except (ValueError, TypeError) as exc:
            self._log(
                ai_request_id=ai_request_id,
                task_type=TaskType.VISION_MEAL_ANALYSIS,
                response=response,
                validation_ok=False,
            )
            logger.error("Meal analysis response failed validation: %s", exc)
            raise HTTPException(
                status_code=502,
                detail="AI provider returned a response that failed schema validation.",
            ) from exc

        self._log(
            ai_request_id=ai_request_id,
            task_type=TaskType.VISION_MEAL_ANALYSIS,
            response=response,
            validation_ok=True,
        )

        # overallConfidence is computed here rather than trusted from the
        # model, consistent with "AI output is treated as untrusted" — an
        # average of validated per-item confidences is a more defensible
        # number than whatever the model might additionally claim.
        items = llm_output.items
        overall_confidence = (
            sum(item.confidence for item in items) / len(items) if items else 0.0
        )

        return AnalyzeMealImageResponse(
            aiRequestId=ai_request_id,
            items=items,
            overallConfidence=round(overall_confidence, 4),
        )

    async def parse_workout_text(self, *, text: str) -> ParsedWorkoutResponse:
        task_cfg = self._task_model_map[TaskType.WORKOUT_PARSE]
        ai_request_id = str(uuid.uuid4())
        user_text = build_workout_parse_user_text(text)

        response = await self._llm_provider.complete(
            system=WORKOUT_SYSTEM_PROMPT,
            user_text=user_text,
            model=task_cfg["model"],
            max_tokens=task_cfg["max_tokens"],
        )

        try:
            parsed_json = _extract_json_object(response.raw_text)
            llm_output = WorkoutParseLLMOutput.model_validate(parsed_json)
        except (ValueError, TypeError) as exc:
            self._log(
                ai_request_id=ai_request_id,
                task_type=TaskType.WORKOUT_PARSE,
                response=response,
                validation_ok=False,
            )
            logger.error("Workout parse response failed validation: %s", exc)
            raise HTTPException(
                status_code=502,
                detail="AI provider returned a response that failed schema validation.",
            ) from exc

        self._log(
            ai_request_id=ai_request_id,
            task_type=TaskType.WORKOUT_PARSE,
            response=response,
            validation_ok=True,
        )

        return ParsedWorkoutResponse(
            aiRequestId=ai_request_id,
            sets=llm_output.sets,
            needsConfirmation=llm_output.needs_confirmation,
            ambiguousFields=llm_output.ambiguous_fields,
        )
