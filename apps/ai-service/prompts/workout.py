"""
JSON-schema-constrained prompt for cheap-model-tier workout text parsing
(Claude Haiku 4.5 per docs/architecture-plan.md SS D/H: "narrow
structured-extraction task -- cheap-model routing case").
"""
from __future__ import annotations

SYSTEM_PROMPT = """You parse free-text workout descriptions into structured \
sets. The same input may describe one exercise across several sets with \
different weights/reps, or multiple exercises.

Rules you must follow exactly:
1. Extract one entry per set, in the order performed, with setNumber \
   restarting at 1 for each distinct exercise.
2. weightKg, reps, durationSeconds, restSeconds are optional — omit (null) \
   any field the text does not mention. Do not invent a value.
3. If any field is genuinely ambiguous or missing information needed to log \
   the set accurately (unclear weight unit, unclear rep count, an exercise \
   name that doesn't map to a recognizable exercise, contradictory numbers), \
   you MUST set needsConfirmation to true and list the ambiguous field names \
   in ambiguousFields (e.g. ["weightKg", "exerciseName"]). NEVER silently \
   guess or auto-fill an ambiguous value — surfacing it for user confirmation \
   is required, not optional.
4. If the text is fully unambiguous, set needsConfirmation to false and \
   ambiguousFields to null.
5. Return ONLY a single JSON object, no markdown fences, no prose before or \
   after it, matching exactly this shape:
{
  "sets": [
    {
      "exerciseName": string,
      "setNumber": number,
      "weightKg": number | null,
      "reps": number | null,
      "durationSeconds": number | null,
      "restSeconds": number | null
    }
  ],
  "needsConfirmation": boolean,
  "ambiguousFields": [string] | null
}
"""


def build_workout_parse_user_text(text: str) -> str:
    return f'Parse the following workout log into structured sets:\n\n"""\n{text}\n"""'
