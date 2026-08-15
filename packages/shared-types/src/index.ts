// Shared request/response DTO types used by both apps/backend and apps/web.
// Generated/expanded incrementally as endpoints are implemented (see docs/architecture-plan.md §G).

export type SourceType = 'USDA' | 'IFCT' | 'OPENFOODFACTS' | 'ADMIN' | 'USER' | 'AI_ESTIMATE';

export type FitnessGoal =
  | 'weight_loss'
  | 'fat_loss'
  | 'weight_maintenance'
  | 'muscle_gain'
  | 'strength_improvement'
  | 'general_fitness'
  | 'endurance'
  | 'body_recomposition';

export interface NutritionTargets {
  calorieTarget: number;
  proteinTargetG: number;
  carbTargetG: number;
  fatTargetG: number;
  fiberTargetG: number;
  waterTargetMl: number;
}

export interface DailyNutritionSummary {
  summaryDate: string; // ISO date
  totalCalories: number;
  totalProteinG: number;
  totalCarbsG: number;
  totalFatG: number;
  totalFiberG: number;
  totalWaterMl: number;
  targetCalories: number;
  targetProteinG: number;
  mealCount: number;
}

export interface MealItemEstimate {
  foodName: string;
  estimatedWeightG: number;
  estimatedWeightRangeG: [number, number];
  unit: string;
  quantity: number;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  confidence: number; // 0-1
  source: SourceType;
}

export interface AnalyzeMealImageResponse {
  aiRequestId: string;
  items: MealItemEstimate[];
  overallConfidence: number;
}

export interface WorkoutSetInput {
  exerciseName: string;
  setNumber: number;
  weightKg?: number;
  reps?: number;
  durationSeconds?: number;
  restSeconds?: number;
}

export interface ParsedWorkoutResponse {
  aiRequestId: string;
  sets: WorkoutSetInput[];
  needsConfirmation: boolean;
  ambiguousFields?: string[];
}
