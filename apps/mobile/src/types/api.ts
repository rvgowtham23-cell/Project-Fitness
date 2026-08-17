// Mobile-side request/response shapes for endpoints not yet covered by
// @fitness/shared-types (that package currently only exports the AI-facing DTOs —
// see packages/shared-types/src/index.ts). These mirror docs/architecture-plan.md §G
// and should move into @fitness/shared-types once apps/backend defines them formally,
// so both apps stop maintaining parallel copies.
import type { MealItemEstimate, NutritionTargets, SourceType, WorkoutSetInput } from '@fitness/shared-types';

export interface FoodSearchResult {
  id: string;
  name: string;
  brand?: string;
  servingUnit: string;
  caloriesPerServing: number;
  proteinPerServingG: number;
  carbsPerServingG: number;
  fatPerServingG: number;
  source: SourceType;
}

export interface BarcodeProductResponse {
  code: string;
  name: string;
  brand?: string;
  item: MealItemEstimate;
}

export interface Exercise {
  id: string;
  name: string;
  category: string;
  equipment: string[];
}

export interface ConfirmedMealItem extends MealItemEstimate {
  confirmed: boolean;
}

export interface SaveMealPayload {
  items: ConfirmedMealItem[];
  loggedAt: string; // ISO timestamp
  aiRequestId?: string;
}

export interface SaveMealResult {
  mealId: string;
}

export interface SaveWorkoutPayload {
  sets: WorkoutSetInput[];
  performedAt: string; // ISO timestamp
  aiRequestId?: string;
}

export interface SaveWorkoutResult {
  workoutSessionId: string;
}

export interface TodayMealSummary {
  id: string;
  name: string;
  loggedAt: string;
  calories: number;
}

// Mirrors the backend's Meal entity (apps/backend/src/modules/nutrition/entities/meal.entity.ts)
// as returned by GET /meals?date= — field names match TypeORM's camelCase JSON serialization.
export interface MealRecord {
  id: string;
  mealType: string;
  loggedAt: string;
  totalCalories: number;
  items: Array<{ foodName: string }>;
}

// Mirrors WorkoutSession as returned by GET /workouts?date=.
export interface WorkoutSessionRecord {
  id: string;
  startedAt: string;
}

export interface OnboardingDraft {
  email: string;
  name: string;
  dateOfBirth: string; // YYYY-MM-DD
  gender: 'female' | 'male' | 'other' | 'prefer_not_to_say' | null;
  heightCm: string;
  weightKg: string;
  goal: import('@fitness/shared-types').FitnessGoal | null;
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active' | null;
  equipment: string[];
  workoutsPerWeek: number;
  dietaryPreference: 'vegetarian' | 'non_vegetarian' | 'vegan' | 'eggetarian' | null;
  allergies: string[];
}

export type NutritionTargetsResponse = NutritionTargets;
