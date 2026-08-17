import type { ConfirmedMealItem, SaveMealPayload } from '../types/api';
import type { MealTypeValue } from './meal-type';

// Client-side items carry AI-estimation fields (estimatedWeightG/estimatedWeightRangeG,
// source, confirmed) that don't match the backend's CreateMealItemDto field names
// (weightG, sourceType) or its "already resolved to a single value" shape — this is the
// seam that converts between them, same pattern as onboarding-mapper.ts.
export interface CreateMealApiPayload {
  mealType: MealTypeValue;
  inputMethod?: 'manual' | 'ai_photo' | 'barcode';
  loggedAt: string;
  items: Array<{
    foodName: string;
    quantity: number;
    unit: string;
    weightG?: number;
    calories: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
    fiberG?: number;
    sourceType?: string;
    confidence?: number;
  }>;
}

function mapItem(item: ConfirmedMealItem) {
  return {
    foodName: item.foodName,
    quantity: item.quantity,
    unit: item.unit,
    weightG: item.estimatedWeightG || undefined,
    calories: item.calories,
    proteinG: item.proteinG,
    carbsG: item.carbsG,
    fatG: item.fatG,
    fiberG: item.fiberG,
    sourceType: item.source,
    confidence: item.confidence,
  };
}

export function toCreateMealPayload(
  payload: SaveMealPayload,
  mealType: MealTypeValue,
  inputMethod: 'manual' | 'ai_photo' | 'barcode' = 'manual',
): CreateMealApiPayload {
  return {
    mealType,
    inputMethod,
    loggedAt: payload.loggedAt,
    items: payload.items.map(mapItem),
  };
}
