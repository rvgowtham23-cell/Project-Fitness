from __future__ import annotations

from fastapi import APIRouter, Request

from schemas.meal import AnalyzeMealImageRequest, AnalyzeMealImageResponse

router = APIRouter(tags=["meal"])


@router.post("/analyze-meal-image", response_model=AnalyzeMealImageResponse)
async def analyze_meal_image(
    request: AnalyzeMealImageRequest, http_request: Request
) -> AnalyzeMealImageResponse:
    gateway = http_request.app.state.gateway
    return await gateway.analyze_meal_image(
        image_url=request.image_url,
        image_base64=request.image_base64,
        image_media_type=request.image_media_type,
        dietary_preferences=request.dietary_preferences,
        allergies=request.allergies,
    )
