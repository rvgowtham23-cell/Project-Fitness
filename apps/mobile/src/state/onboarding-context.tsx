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
  isOnboarded: boolean;
  draft: OnboardingDraft;
  updateDraft: (partial: Partial<OnboardingDraft>) => void;
  completeOnboarding: () => void;
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  // In-memory only for this scaffold — a real build persists this flag (SecureStore/
  // AsyncStorage) and cross-checks it against the user's profile on the backend, so
  // "shown once" survives app restarts and reinstall-on-existing-account.
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [draft, setDraft] = useState<OnboardingDraft>(emptyDraft);

  const value = useMemo<OnboardingContextValue>(
    () => ({
      isOnboarded,
      draft,
      updateDraft: (partial) => setDraft((prev) => ({ ...prev, ...partial })),
      completeOnboarding: () => setIsOnboarded(true),
    }),
    [isOnboarded, draft],
  );

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

export function useOnboarding(): OnboardingContextValue {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error('useOnboarding must be used within OnboardingProvider');
  return ctx;
}
