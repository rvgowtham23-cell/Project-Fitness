import React, { createContext, useContext, useMemo, useState } from 'react';
import type { MealItemEstimate } from '@fitness/shared-types';
import type { ConfirmedMealItem } from '../types/api';

interface MealDraft {
  aiRequestId?: string;
  originLabel: string; // e.g. "From photo", "From barcode" — shown on the confirm screen
  items: ConfirmedMealItem[];
}

interface MealDraftContextValue {
  draft: MealDraft | null;
  setDraftFromItems: (items: MealItemEstimate[], originLabel: string, aiRequestId?: string) => void;
  updateItem: (index: number, partial: Partial<ConfirmedMealItem>) => void;
  removeItem: (index: number) => void;
  clearDraft: () => void;
}

const MealDraftContext = createContext<MealDraftContextValue | null>(null);

// Holds the in-flight "AI estimated, awaiting user confirmation" meal so the photo/
// barcode/manual-food flows (app/log/*) can hand off to app/meal/confirm.tsx without
// serializing large item arrays through router query params.
export function MealDraftProvider({ children }: { children: React.ReactNode }) {
  const [draft, setDraft] = useState<MealDraft | null>(null);

  const value = useMemo<MealDraftContextValue>(
    () => ({
      draft,
      setDraftFromItems: (items, originLabel, aiRequestId) =>
        setDraft({
          aiRequestId,
          originLabel,
          items: items.map((item) => ({ ...item, confirmed: true })),
        }),
      updateItem: (index, partial) =>
        setDraft((prev) => {
          if (!prev) return prev;
          const items = [...prev.items];
          items[index] = { ...items[index], ...partial };
          return { ...prev, items };
        }),
      removeItem: (index) =>
        setDraft((prev) => {
          if (!prev) return prev;
          return { ...prev, items: prev.items.filter((_, i) => i !== index) };
        }),
      clearDraft: () => setDraft(null),
    }),
    [draft],
  );

  return <MealDraftContext.Provider value={value}>{children}</MealDraftContext.Provider>;
}

export function useMealDraft(): MealDraftContextValue {
  const ctx = useContext(MealDraftContext);
  if (!ctx) throw new Error('useMealDraft must be used within MealDraftProvider');
  return ctx;
}
