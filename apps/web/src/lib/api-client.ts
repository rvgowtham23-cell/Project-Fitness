import type { DailyNutritionSummary, NutritionTargets } from '@fitness/shared-types';
import { API_BASE_URL } from './config';
import type {
  ChatMessage,
  Exercise,
  FoodSearchResult,
  LogMealPayload,
  LoggedMeal,
  LogWorkoutPayload,
  ProfileData,
  ProgressWeeklySummary,
  SessionResponse,
  SessionUser,
  WorkoutSession,
} from '@/types/api';

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

interface DateRange {
  from: string;
  to: string;
}

// Every call to the backend goes through here so credentials/headers/error
// shape stay consistent, and so a real backend swap-in never needs page changes.
async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      // Sends the httpOnly access-token cookie set by our own /api/auth/login route
      // (see docs/architecture-plan.md §D — cookie-based auth, not localStorage, for web).
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers ?? {}),
      },
    });
  } catch {
    throw new ApiError('Could not reach the API server. Is the backend running?', 0);
  }

  if (res.status === 204) return undefined as T;

  const body = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(body?.message ?? `Request failed (${res.status})`, res.status);
  }
  return body as T;
}

// --- Auth -------------------------------------------------------------
// Login/logout/session go through our own Next.js route handlers (not apiFetch/API_BASE_URL
// directly) because only a server-side route can set the httpOnly cookie the backend issues.

export async function login(email: string, password: string): Promise<{ user: SessionUser | null }> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(body?.message ?? 'Login failed.', res.status);
  return body;
}

export async function logout(): Promise<void> {
  await fetch('/api/auth/logout', { method: 'POST' });
}

export async function getSession(): Promise<SessionResponse> {
  const res = await fetch('/api/auth/session');
  if (!res.ok) return { authenticated: false, user: null };
  return res.json();
}

// --- Nutrition ---------------------------------------------------------

export function getDailyNutrition(date: string): Promise<DailyNutritionSummary> {
  return apiFetch<DailyNutritionSummary>(`/nutrition/daily?date=${encodeURIComponent(date)}`);
}

export function getNutritionTargets(): Promise<NutritionTargets> {
  return apiFetch<NutritionTargets>('/profile/targets');
}

// GET /meals with a date-range filter isn't literally listed in architecture-plan.md §G
// (only POST /meals and /meals/analyze-image are) — assumed sibling list endpoint for the
// web history view; swap the query param names here if the backend lands differently.
export function getMeals(range: DateRange): Promise<LoggedMeal[]> {
  return apiFetch<LoggedMeal[]>(`/meals?from=${range.from}&to=${range.to}`);
}

export function searchFoods(query: string): Promise<FoodSearchResult[]> {
  return apiFetch<FoodSearchResult[]>(`/foods/search?q=${encodeURIComponent(query)}`);
}

export function logMeal(payload: LogMealPayload): Promise<LoggedMeal> {
  return apiFetch<LoggedMeal>('/meals', { method: 'POST', body: JSON.stringify(payload) });
}

// --- Workouts ------------------------------------------------------------

// GET /workouts (list) is assumed alongside the documented POST /workouts.
export function getWorkoutSessions(): Promise<WorkoutSession[]> {
  return apiFetch<WorkoutSession[]>('/workouts');
}

export function logWorkout(payload: LogWorkoutPayload): Promise<WorkoutSession> {
  return apiFetch<WorkoutSession>('/workouts', { method: 'POST', body: JSON.stringify(payload) });
}

export function getExercises(): Promise<Exercise[]> {
  return apiFetch<Exercise[]>('/exercises');
}

// --- Progress ------------------------------------------------------------

export function getProgressWeekly(): Promise<ProgressWeeklySummary> {
  return apiFetch<ProgressWeeklySummary>('/progress/weekly');
}

export function getWeightHistory(range: string): Promise<{ date: string; weightKg: number }[]> {
  return apiFetch<{ date: string; weightKg: number }[]>(`/progress/weight-history?range=${range}`);
}

// --- Coach (V1, stub) ------------------------------------------------------

export async function sendCoachMessage(message: string): Promise<ChatMessage> {
  return apiFetch<ChatMessage>('/coach/chat', { method: 'POST', body: JSON.stringify({ message }) });
}

// --- Profile ---------------------------------------------------------------

export function getProfile(): Promise<ProfileData> {
  return apiFetch<ProfileData>('/profile');
}

export function updateProfile(payload: ProfileData): Promise<ProfileData> {
  return apiFetch<ProfileData>('/profile', { method: 'PATCH', body: JSON.stringify(payload) });
}

// Export/delete endpoints aren't in the §G table but are required MVP scope (§K); assumed
// under /profile pending the backend's actual route names.
export function requestDataExport(): Promise<void> {
  return apiFetch<void>('/profile/export', { method: 'POST' });
}

export function requestAccountDeletion(): Promise<void> {
  return apiFetch<void>('/profile', { method: 'DELETE' });
}
