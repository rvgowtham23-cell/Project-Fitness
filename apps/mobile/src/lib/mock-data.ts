// Realistic placeholder data used when the backend (apps/backend) isn't reachable —
// see the fallback pattern in src/lib/api-client.ts. Keeping this centralized means every
// screen renders believable content in isolation, which matters for a solo/small team
// iterating on UI before the backend is fully live.
import type {
  AnalyzeMealImageResponse,
  DailyNutritionSummary,
  NutritionTargets,
  ParsedWorkoutResponse,
} from '@fitness/shared-types';
import type { BarcodeProductResponse, Exercise, FoodSearchResult, TodayMealSummary } from '../types/api';

export const mockNutritionTargets: NutritionTargets = {
  calorieTarget: 2200,
  proteinTargetG: 140,
  carbTargetG: 240,
  fatTargetG: 65,
  fiberTargetG: 30,
  waterTargetMl: 3000,
};

export const mockDailyNutritionSummary: DailyNutritionSummary = {
  summaryDate: new Date().toISOString().slice(0, 10),
  totalCalories: 1340,
  totalProteinG: 78,
  totalCarbsG: 152,
  totalFatG: 38,
  totalFiberG: 14,
  totalWaterMl: 1500,
  targetCalories: mockNutritionTargets.calorieTarget,
  targetProteinG: mockNutritionTargets.proteinTargetG,
  mealCount: 2,
};

export const mockTodayMeals: TodayMealSummary[] = [
  { id: 'meal-1', name: 'Poha with peanuts', loggedAt: '08:15 AM', calories: 320 },
  { id: 'meal-2', name: 'Grilled chicken + dal + rice', loggedAt: '01:40 PM', calories: 620 },
];

export const mockAnalyzeMealImageResponse: AnalyzeMealImageResponse = {
  aiRequestId: 'mock-ai-req-meal-001',
  overallConfidence: 0.74,
  items: [
    {
      foodName: 'Steamed rice',
      estimatedWeightG: 180,
      estimatedWeightRangeG: [150, 210],
      unit: 'bowl',
      quantity: 1,
      calories: 234,
      proteinG: 4.9,
      carbsG: 51,
      fatG: 0.5,
      fiberG: 1.3,
      confidence: 0.86,
      source: 'AI_ESTIMATE',
    },
    {
      foodName: 'Dal tadka',
      estimatedWeightG: 150,
      estimatedWeightRangeG: [110, 190],
      unit: 'bowl',
      quantity: 1,
      calories: 180,
      proteinG: 9,
      carbsG: 22,
      fatG: 6,
      fiberG: 5,
      confidence: 0.71,
      source: 'AI_ESTIMATE',
    },
    {
      foodName: 'Mixed vegetable sabzi',
      estimatedWeightG: 120,
      estimatedWeightRangeG: [80, 160],
      unit: 'cup',
      quantity: 1,
      calories: 140,
      proteinG: 3,
      carbsG: 14,
      fatG: 8,
      fiberG: 4,
      confidence: 0.52,
      source: 'AI_ESTIMATE',
    },
  ],
};

export const mockParsedWorkoutResponse: ParsedWorkoutResponse = {
  aiRequestId: 'mock-ai-req-workout-001',
  needsConfirmation: true,
  ambiguousFields: ['weightKg:Bench Press'],
  sets: [
    { exerciseName: 'Barbell Squat', setNumber: 1, weightKg: 60, reps: 10, restSeconds: 90 },
    { exerciseName: 'Barbell Squat', setNumber: 2, weightKg: 60, reps: 10, restSeconds: 90 },
    { exerciseName: 'Barbell Squat', setNumber: 3, weightKg: 65, reps: 8, restSeconds: 90 },
    { exerciseName: 'Bench Press', setNumber: 1, weightKg: undefined, reps: 8, restSeconds: 60 },
  ],
};

export const mockExercises: Exercise[] = [
  { id: 'ex-1', name: 'Barbell Squat', category: 'legs', equipment: ['barbell', 'rack'] },
  { id: 'ex-2', name: 'Bench Press', category: 'chest', equipment: ['barbell', 'bench'] },
  { id: 'ex-3', name: 'Deadlift', category: 'back', equipment: ['barbell'] },
  { id: 'ex-4', name: 'Pull-up', category: 'back', equipment: ['bodyweight'] },
  { id: 'ex-5', name: 'Push-up', category: 'chest', equipment: ['bodyweight'] },
  { id: 'ex-6', name: 'Dumbbell Shoulder Press', category: 'shoulders', equipment: ['dumbbells'] },
  { id: 'ex-7', name: 'Plank', category: 'core', equipment: ['bodyweight'] },
];

export const mockFoodSearchResults: FoodSearchResult[] = [
  {
    id: 'food-1',
    name: 'Idli (2 pieces)',
    servingUnit: 'piece',
    caloriesPerServing: 78,
    proteinPerServingG: 2.4,
    carbsPerServingG: 16,
    fatPerServingG: 0.3,
    source: 'IFCT',
  },
  {
    id: 'food-2',
    name: 'Roti (whole wheat)',
    servingUnit: 'piece',
    caloriesPerServing: 104,
    proteinPerServingG: 3.1,
    carbsPerServingG: 18,
    fatPerServingG: 2.5,
    source: 'IFCT',
  },
  {
    id: 'food-3',
    name: 'Banana (medium)',
    servingUnit: 'piece',
    caloriesPerServing: 105,
    proteinPerServingG: 1.3,
    carbsPerServingG: 27,
    fatPerServingG: 0.4,
    source: 'USDA',
  },
  {
    id: 'food-4',
    name: 'Greek Yogurt (100g)',
    servingUnit: '100g',
    caloriesPerServing: 59,
    proteinPerServingG: 10,
    carbsPerServingG: 3.6,
    fatPerServingG: 0.4,
    source: 'USDA',
  },
];

export function mockBarcodeProduct(code: string): BarcodeProductResponse {
  return {
    code,
    name: 'Amul Masti Dahi (400g pack)',
    brand: 'Amul',
    item: {
      foodName: 'Amul Masti Dahi',
      estimatedWeightG: 100,
      estimatedWeightRangeG: [100, 100],
      unit: 'serving',
      quantity: 1,
      calories: 62,
      proteinG: 3.5,
      carbsG: 4.5,
      fatG: 3.3,
      fiberG: 0,
      confidence: 0.97,
      source: 'OPENFOODFACTS',
    },
  };
}

export const mockWeightHistoryKg: number[] = [78.4, 78.1, 77.9, 78.0, 77.6, 77.4, 77.1];
export const mockCalorieHistory: number[] = [1980, 2350, 1600, 2100, 2400, 1450, 1340];
export const mockWorkoutVolumeHistory: number[] = [2400, 0, 3100, 2800, 0, 3600, 1900];
