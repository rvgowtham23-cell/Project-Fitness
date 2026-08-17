import type {
  AnalyzeMealImageResponse,
  DailyNutritionSummary,
  NutritionTargets,
  ParsedWorkoutResponse,
} from '@fitness/shared-types';
import { API_BASE_URL } from './config';
import { getAccessToken, saveTokens } from './auth-storage';
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
  MealRecord,
  SaveMealPayload,
  SaveMealResult,
  SaveWorkoutPayload,
  SaveWorkoutResult,
  WorkoutSessionRecord,
} from '../types/api';
import type { OnboardingApiPayload } from './onboarding-mapper';
import { toCreateMealPayload } from './meal-mapper';
import type { MealTypeValue } from './meal-type';
import { toCreateWorkoutPayload } from './workout-mapper';

export class ApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getAccessToken();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
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
  // Auth is never mock-fallback'd — pretending register/login succeeded when the real
  // request failed is exactly what left the onboarding "reward" screen showing locally
  // computed numbers with no account ever created on the backend.
  register: async (email: string, password: string, fullName: string) => {
    const tokens = await request<{ accessToken: string; refreshToken: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, fullName }),
    });
    await saveTokens(tokens.accessToken, tokens.refreshToken);
    return tokens;
  },

  login: async (email: string, password: string) => {
    const tokens = await request<{ accessToken: string; refreshToken: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    await saveTokens(tokens.accessToken, tokens.refreshToken);
    return tokens;
  },

  // Not mock-fallback'd: this is read-your-own-writes for the meal/workout logging just
  // fixed above — silently showing an empty list on a network blip would reintroduce the
  // same "looks fine, nothing actually happened" trust problem for a read instead of a write.
  getMealsForDate: (date: string) => request<MealRecord[]>(`/meals?date=${date}`),
  getWorkoutsForDate: (date: string) => request<WorkoutSessionRecord[]>(`/workouts?date=${date}`),

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

  // Not mock-fallback'd, same reasoning as submitOnboarding: a fake "saved" result for a
  // core-loop write is worse than a visible error, since the user has no other signal that
  // nothing was actually persisted.
  saveMeal: (
    payload: SaveMealPayload,
    mealType: MealTypeValue,
    inputMethod: 'manual' | 'ai_photo' | 'barcode' = 'manual',
  ) =>
    request<SaveMealResult>('/meals', {
      method: 'POST',
      body: JSON.stringify(toCreateMealPayload(payload, mealType, inputMethod)),
    }),

  searchFoods: (query: string) =>
    withMockFallback(
      () => request<FoodSearchResult[]>(`/foods/search?q=${encodeURIComponent(query)}`),
      mockFoodSearchResults.filter((f) => f.name.toLowerCase().includes(query.toLowerCase())),
      'GET /foods/search',
    ),

  // Not mock-fallback'd now that a real backend endpoint exists — a "not found" barcode
  // should surface as a real error (falls through to manual entry in the UI), not a fake
  // product.
  getBarcodeProduct: (code: string) =>
    request<BarcodeProductResponse>(`/foods/barcode/${code}`, { method: 'POST' }),

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

  // Not mock-fallback'd, same reasoning as saveMeal — and requires the fetched exercise
  // library to resolve exerciseName -> exerciseId (see workout-mapper.ts).
  saveWorkout: (payload: SaveWorkoutPayload, exerciseLibrary: Exercise[]) =>
    request<SaveWorkoutResult>('/workouts', {
      method: 'POST',
      body: JSON.stringify(toCreateWorkoutPayload(payload.sets, payload.performedAt, exerciseLibrary)),
    }),

  getExercises: () =>
    withMockFallback(() => request<Exercise[]>('/exercises'), mockExercises, 'GET /exercises'),

  // Not mock-fallback'd: this is the call that actually creates the user's profile/goal
  // server-side. Silently substituting a locally-computed estimate here previously made a
  // completely failed submission look identical to a successful one.
  // Returns {profile, goal} — not a flat NutritionTargets shape, unlike GET /profile/targets.
  // Callers that need the calorie/macro numbers should follow up with getNutritionTargets().
  submitOnboarding: (payload: OnboardingApiPayload) =>
    request<{ profile: unknown; goal: unknown }>('/profile/onboarding', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};
