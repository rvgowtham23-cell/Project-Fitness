'use client';

import { useState } from 'react';
import { Banner } from '@/components/ui/Banner';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { DateRangeFilter } from '@/components/nutrition/DateRangeFilter';
import { MealTable } from '@/components/nutrition/MealTable';
import { AddMealForm } from '@/components/nutrition/AddMealForm';
import { useApiData } from '@/lib/use-api-data';
import { getMeals, logMeal } from '@/lib/api-client';
import type { LoggedMeal, LogMealPayload } from '@/types/api';

function isoDaysAgo(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

const DEMO_MEALS: LoggedMeal[] = [
  { id: 'demo-1', foodName: 'Idli with sambar', quantity: 3, unit: 'piece', mealType: 'breakfast', loggedAt: `${isoDaysAgo(0)}T08:15:00Z`, calories: 320, proteinG: 10, carbsG: 58, fatG: 4 },
  { id: 'demo-2', foodName: 'Grilled chicken salad', quantity: 1, unit: 'bowl', mealType: 'lunch', loggedAt: `${isoDaysAgo(0)}T13:05:00Z`, calories: 450, proteinG: 38, carbsG: 22, fatG: 20 },
  { id: 'demo-3', foodName: 'Paneer tikka', quantity: 200, unit: 'g', mealType: 'dinner', loggedAt: `${isoDaysAgo(1)}T20:30:00Z`, calories: 380, proteinG: 26, carbsG: 12, fatG: 24 },
];

export default function NutritionPage() {
  const [range, setRange] = useState({ from: isoDaysAgo(6), to: isoDaysAgo(0) });
  const [localMeals, setLocalMeals] = useState<LoggedMeal[] | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const mealsState = useApiData(() => getMeals(range), [range.from, range.to]);
  const usingDemoData = Boolean(mealsState.error);
  const meals = localMeals ?? mealsState.data ?? DEMO_MEALS;

  async function handleAddMeal(payload: LogMealPayload) {
    setSaveError(null);
    const optimistic: LoggedMeal = { ...payload, id: `local-${Date.now()}`, calories: 0, proteinG: 0, carbsG: 0, fatG: 0 };
    try {
      const saved = await logMeal(payload);
      setLocalMeals([saved, ...meals]);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Could not reach the API — meal saved locally only.');
      setLocalMeals([optimistic, ...meals]);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-charcoal-900">Nutrition</h1>
          <p className="mt-1 text-sm text-neutral-500">History and analytics for logged meals.</p>
        </div>
        <DateRangeFilter value={range} onChange={setRange} />
      </div>

      {usingDemoData ? (
        <Banner>
          Showing sample meals — wired to <code>GET /meals?from=&amp;to=</code> (assumed list endpoint per
          architecture-plan.md §G&apos;s nutrition-resource pattern).
        </Banner>
      ) : null}
      {saveError ? <Banner tone="error">{saveError}</Banner> : null}

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          {mealsState.loading ? (
            <LoadingSpinner label="Loading meals..." />
          ) : meals.length === 0 ? (
            <EmptyState message="No meals logged in this range yet." />
          ) : (
            <MealTable meals={meals} />
          )}
        </div>
        <div>
          <AddMealForm onAdd={handleAddMeal} />
        </div>
      </div>
    </div>
  );
}
