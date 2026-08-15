// Client-side approximation of the calorie/macro engine ONLY so the onboarding reward
// screen (app/onboarding/targets.tsx) can show numbers immediately. The authoritative
// calculation lives in the backend's Profile module (POST /profile/onboarding, per
// architecture-plan.md §D/§G) — this local copy exists purely to avoid a blank/loading
// reward screen and should defer to the server response whenever it succeeds.
import type { FitnessGoal, NutritionTargets } from '@fitness/shared-types';
import type { OnboardingDraft } from '../types/api';

const ACTIVITY_FACTORS: Record<NonNullable<OnboardingDraft['activityLevel']>, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

// Never recommend below a clinically conservative floor, regardless of the formula's
// raw output — same "hard-clamp in code, not just in a prompt" principle architecture-
// plan.md §H applies to the AI coach.
const MIN_SAFE_CALORIES = { female: 1200, male: 1500, other: 1350, prefer_not_to_say: 1350 } as const;

function ageFromDob(dob: string): number {
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return 30;
  const diffMs = Date.now() - birth.getTime();
  return Math.max(Math.floor(diffMs / (1000 * 60 * 60 * 24 * 365.25)), 13);
}

function goalCalorieAdjustment(goal: FitnessGoal): number {
  switch (goal) {
    case 'weight_loss':
    case 'fat_loss':
      return -500;
    case 'muscle_gain':
      return 300;
    case 'body_recomposition':
      return -150;
    default:
      return 0;
  }
}

function proteinMultiplier(goal: FitnessGoal): number {
  switch (goal) {
    case 'muscle_gain':
    case 'strength_improvement':
    case 'body_recomposition':
      return 2.0;
    default:
      return 1.6;
  }
}

export function calculateNutritionTargets(draft: OnboardingDraft): NutritionTargets {
  const weightKg = parseFloat(draft.weightKg) || 70;
  const heightCm = parseFloat(draft.heightCm) || 170;
  const age = ageFromDob(draft.dateOfBirth);
  const activityLevel = draft.activityLevel ?? 'moderate';
  const goal = draft.goal ?? 'general_fitness';
  const gender = draft.gender ?? 'prefer_not_to_say';

  const sexOffset = gender === 'male' ? 5 : gender === 'female' ? -161 : -78;
  const bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + sexOffset;
  const tdee = bmr * ACTIVITY_FACTORS[activityLevel];

  const rawTarget = tdee + goalCalorieAdjustment(goal);
  const calorieTarget = Math.round(Math.max(rawTarget, MIN_SAFE_CALORIES[gender]));

  const proteinTargetG = Math.round(weightKg * proteinMultiplier(goal));
  const fatTargetG = Math.round((calorieTarget * 0.25) / 9);
  const carbCalories = Math.max(calorieTarget - proteinTargetG * 4 - fatTargetG * 9, 0);
  const carbTargetG = Math.round(carbCalories / 4);

  return {
    calorieTarget,
    proteinTargetG,
    carbTargetG,
    fatTargetG,
    fiberTargetG: 30,
    waterTargetMl: Math.round(weightKg * 35),
  };
}
