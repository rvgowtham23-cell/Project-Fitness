// Local DTOs for shapes the architecture-plan.md §G endpoint table implies but doesn't
// spell out field-by-field. Shared, backend-defined DTOs live in @fitness/shared-types
// instead — this file only fills the gaps around it.
import type { FitnessGoal, SourceType, WorkoutSetInput } from '@fitness/shared-types';

export interface SessionUser {
  id: string;
  email: string;
  name?: string;
}

export interface SessionResponse {
  authenticated: boolean;
  user: SessionUser | null;
}

export interface FoodSearchResult {
  id: string;
  name: string;
  brand?: string;
  servingUnit: string;
  servingSizeG: number;
  caloriesPerServing: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  source: SourceType;
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface LogMealPayload {
  foodId?: string;
  foodName: string;
  quantity: number;
  unit: string;
  mealType: MealType;
  loggedAt: string; // ISO datetime
}

export interface LoggedMeal extends LogMealPayload {
  id: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

export interface WorkoutSessionExercise {
  exerciseName: string;
  sets: WorkoutSetInput[];
}

export interface WorkoutSession {
  id: string;
  performedAt: string; // ISO datetime
  exercises: WorkoutSessionExercise[];
  totalVolumeKg?: number;
}

export interface LogWorkoutPayload {
  exerciseName: string;
  performedAt: string;
  sets: WorkoutSetInput[];
}

export interface Exercise {
  id: string;
  name: string;
  category: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface ProfileData {
  id: string;
  name: string;
  email: string;
  goal: FitnessGoal;
  heightCm?: number;
  weightKg?: number;
}

export interface ProgressWeeklySummary {
  weekStart: string;
  averageCalories: number;
  workoutsCompleted: number;
  weightDeltaKg?: number;
}
