import type {
  AnalyzeMealImageResponse,
  DailyNutritionSummary,
  NutritionTargets,
  ParsedWorkoutResponse,
} from '@fitness/shared-types';
import { API_BASE_URL } from './config';
import {
  mockAnalyzeMealImageResponse,
  mockBarcodeProduct,
  mockDailyNutritionSummary,
  mockExercises,
  mockFoodSearchResults,
  mockNutritionTargets,
  mockParsedWorkoutResponse,
} from './mock-data';
import type {
  BarcodeProductResponse,
  Exercise,
  FoodSearchResult,
  OnboardingDraft,
  SaveMealPayload,
  SaveMealResult,
  SaveWorkoutPayload,
  SaveWorkoutResult,
} from '../types/api';

export class ApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      // TODO: attach `Authorization: Bearer <accessToken>` once the auth module
      // (POST /auth/login + refresh rotation, per architecture-plan.md §D) is wired up.
      ...(init?.headers ?? {}),
    },
  });

  if (!res.ok) {
    let message = `Request failed: ${res.status}`;
    try {
      const body = await res.json();
      message = body?.message ?? message;
    } catch {
      // response wasn't JSON — keep default message
    }
    throw new ApiError(message, res.status);
  }

  return res.json() as Promise<T>;
}

// The AI-gateway/backend endpoints below are real per docs/architecture-plan.md §G and
// will work unmodified once apps/backend is live. Until then, fetch throws (no server at
// EXPO_PUBLIC_API_BASE_URL) and each method falls back to realistic mock data so the app
// is fully navigable during scaffolding — this is a temporary dev convenience, not an
// offline-sync mechanism (real offline queuing is a documented later concern, see
// src/features/*/use-*.ts TODOs near each mutation).
async function withMockFallback<T>(real: () => Promise<T>, mock: T, label: string): Promise<T> {
  try {
    return await real();
  } catch (err) {
    if (__DEV__) {
      console.warn(`[api-client] "${label}" unreachable, using mock data:`, (err as Error).message);
    }
    return mock;
  }
}

export const apiClient = {
  getDailyNutrition: (date: string) =>
    withMockFallback(
      () => request<DailyNutritionSummary>(`/nutrition/daily?date=${date}`),
      mockDailyNutritionSummary,
      'GET /nutrition/daily',
    ),

  getNutritionTargets: () =>
    withMockFallback(
      () => request<NutritionTargets>('/profile/targets'),
      mockNutritionTargets,
      'GET /profile/targets',
    ),

  analyzeMealImage: (imageUri: string) =>
    withMockFallback(
      async () => {
        const formData = new FormData();
        // React Native's FormData accepts this URI-object shape for file uploads.
        formData.append('image', {
          uri: imageUri,
          name: 'meal.jpg',
          type: 'image/jpeg',
        } as unknown as Blob);

        const res = await fetch(`${API_BASE_URL}/meals/analyze-image`, {
          method: 'POST',
          headers: { 'Content-Type': 'multipart/form-data' },
          body: formData,
        });
        if (!res.ok) throw new ApiError(`Request failed: ${res.status}`, res.status);
        return res.json() as Promise<AnalyzeMealImageResponse>;
      },
      mockAnalyzeMealImageResponse,
      'POST /meals/analyze-image',
    ),

  saveMeal: (payload: SaveMealPayload) =>
    withMockFallback(
      () => request<SaveMealResult>('/meals', { method: 'POST', body: JSON.stringify(payload) }),
      { mealId: `mock-meal-${Date.now()}` },
      'POST /meals',
    ),

  searchFoods: (query: string) =>
    withMockFallback(
      () => request<FoodSearchResult[]>(`/foods/search?q=${encodeURIComponent(query)}`),
      mockFoodSearchResults.filter((f) => f.name.toLowerCase().includes(query.toLowerCase())),
      'GET /foods/search',
    ),

  getBarcodeProduct: (code: string) =>
    withMockFallback(
      () => request<BarcodeProductResponse>(`/foods/barcode/${code}`, { method: 'POST' }),
      mockBarcodeProduct(code),
      'POST /foods/barcode/:code',
    ),

  parseWorkoutText: (text: string) =>
    withMockFallback(
      () =>
        request<ParsedWorkoutResponse>('/workouts/parse-text', {
          method: 'POST',
          body: JSON.stringify({ text }),
        }),
      mockParsedWorkoutResponse,
      'POST /workouts/parse-text',
    ),

  saveWorkout: (payload: SaveWorkoutPayload) =>
    withMockFallback(
      () => request<SaveWorkoutResult>('/workouts', { method: 'POST', body: JSON.stringify(payload) }),
      { workoutSessionId: `mock-workout-${Date.now()}` },
      'POST /workouts',
    ),

  getExercises: () =>
    withMockFallback(() => request<Exercise[]>('/exercises'), mockExercises, 'GET /exercises'),

  submitOnboarding: (draft: OnboardingDraft, localFallback: NutritionTargets) =>
    withMockFallback(
      () => request<NutritionTargets>('/profile/onboarding', { method: 'POST', body: JSON.stringify(draft) }),
      localFallback,
      'POST /profile/onboarding',
    ),
};
