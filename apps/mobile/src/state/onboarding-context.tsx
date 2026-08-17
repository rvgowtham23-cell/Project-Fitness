import React, { createContext, useContext, useMemo, useState } from 'react';
import type { OnboardingDraft } from '../types/api';

const emptyDraft: OnboardingDraft = {
  email: '',
  name: '',
  dateOfBirth: '',
  gender: null,
  heightCm: '',
  weightKg: '',
  goal: null,
  activityLevel: null,
  equipment: [],
  workoutsPerWeek: 3,
  dietaryPreference: null,
  allergies: [],
};

interface OnboardingContextValue {
  draft: OnboardingDraft;
  updateDraft: (partial: Partial<OnboardingDraft>) => void;
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

// Holds only the in-progress onboarding form draft. Whether onboarding is actually complete
// is a backend fact (UserProfile.onboardingCompletedAt), checked once at app boot by
// useAppBootstrap — not tracked here, since anything kept only in this in-memory context
// resets on every JS reload/cold start.
export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [draft, setDraft] = useState<OnboardingDraft>(emptyDraft);

  const value = useMemo<OnboardingContextValue>(
    () => ({
      draft,
      updateDraft: (partial) => setDraft((prev) => ({ ...prev, ...partial })),
    }),
    [draft],
  );

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

export function useOnboarding(): OnboardingContextValue {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error('useOnboarding must be used within OnboardingProvider');
  return ctx;
}
