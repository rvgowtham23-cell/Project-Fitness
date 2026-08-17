import type { OnboardingDraft } from '../types/api';

// The draft's field names/shape follow the onboarding screens' own conventions (built up
// incrementally, one screen per field group) and don't match the backend's OnboardingDto
// 1:1 (e.g. weightKg -> currentWeightKg, goal -> goalType, a single dietaryPreference ->
// a dietaryPreferences array) — this is the seam that converts between them.
export interface OnboardingApiPayload {
  dateOfBirth?: string;
  gender?: string;
  heightCm: number;
  currentWeightKg: number;
  activityLevel: string;
  dietaryPreferences?: string[];
  allergies?: string[];
  goalType: string;
  targetWeightKg?: number;
}

export function toOnboardingPayload(draft: OnboardingDraft): OnboardingApiPayload {
  if (!draft.goal) throw new Error('A fitness goal is required.');
  if (!draft.activityLevel) throw new Error('An activity level is required.');

  return {
    dateOfBirth: draft.dateOfBirth || undefined,
    gender: draft.gender ?? undefined,
    heightCm: Number(draft.heightCm),
    currentWeightKg: Number(draft.weightKg),
    activityLevel: draft.activityLevel,
    dietaryPreferences: draft.dietaryPreference ? [draft.dietaryPreference] : undefined,
    allergies: draft.allergies.length ? draft.allergies : undefined,
    goalType: draft.goal,
    targetWeightKg: undefined,
  };
}
