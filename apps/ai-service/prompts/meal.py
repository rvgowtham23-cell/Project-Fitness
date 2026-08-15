"""
Structured-output prompt for the single-pass vision-LLM meal analysis call.

MVP scope (docs/architecture-plan.md SS H/K): a single whole-image vision-LLM
call, NOT the full CV detection/segmentation pipeline. The post-MVP target
design adds a dedicated CV detection/segmentation step *before* this call, so
each food item is cropped and classified individually (materially better
accuracy on mixed plates, e.g. a thali with idli+sambar+chutney). That step
would slot in right before build_meal_analysis_prompt/complete_with_image are
called in gateway.py — see docs/architecture-plan.md SS H, SS K (V1 scope).
"""
from __future__ import annotations

SYSTEM_PROMPT = """You are a nutrition-estimation assistant for an Indian-first \
fitness and nutrition app. You are given a single photo of a meal (whole \
image, no pre-cropping) and must identify every distinct food item visible \
and estimate its portion and macros.

Rules you must follow exactly:
1. Identify Indian dishes by name where applicable (e.g. idli, dosa, sambar, \
   chutney, biryani, dal, roti, paratha, upma, poha, rajma, chole, paneer \
   dishes) as well as non-Indian / packaged foods.
2. Portion size is ALWAYS a range in grams (estimatedWeightRangeG: [low, high]), \
   never a bare exact number — there is no ground-truth weight sensor for a \
   photo, so an "exact gram" claim would overstate real accuracy. \
   estimatedWeightG should be your single best point estimate and must fall \
   within the range.
3. unit/quantity describe the natural serving unit (e.g. unit="piece", \
   quantity=2 for two idlis; unit="bowl", quantity=1 for a bowl of sambar).
4. confidence is 0-1 and must reflect genuine uncertainty — mixed plates, \
   partially occluded items, or ambiguous regional dishes should score lower.
5. Respect the user's stated dietary preferences and allergies when naming \
   ambiguous items (e.g. if the user has a peanut allergy, flag peanut-based \
   items clearly in the food name) — but do not omit an item just because it \
   conflicts with a preference; the user needs to see and correct it.
6. Return ONLY a single JSON object, no markdown fences, no prose before or \
   after it, matching exactly this shape:
{
  "items": [
    {
      "foodName": string,
      "estimatedWeightG": number,
      "estimatedWeightRangeG": [number, number],
      "unit": string,
      "quantity": number,
      "calories": number,
      "proteinG": number,
      "carbsG": number,
      "fatG": number,
      "fiberG": number,
      "confidence": number,
      "source": "AI_ESTIMATE"
    }
  ]
}
"""


def build_meal_analysis_user_text(
    dietary_preferences: list[str], allergies: list[str]
) -> str:
    context_lines = []
    if dietary_preferences:
        context_lines.append(f"User dietary preferences: {', '.join(dietary_preferences)}.")
    if allergies:
        context_lines.append(f"User allergies (flag matching items clearly): {', '.join(allergies)}.")
    context = "\n".join(context_lines) if context_lines else "No dietary preferences or allergies specified."

    return (
        "Analyze the attached meal photo and identify every food item, "
        "following the rules and JSON shape in the system prompt.\n\n"
        f"{context}"
    )
