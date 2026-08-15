'use client';

import { useEffect, useState } from 'react';
import { searchFoods } from '@/lib/api-client';
import type { FoodSearchResult, LogMealPayload, MealType } from '@/types/api';

const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];

const DEMO_RESULTS: FoodSearchResult[] = [
  { id: 'food-1', name: 'Idli', servingUnit: 'piece', servingSizeG: 40, caloriesPerServing: 58, proteinG: 2, carbsG: 12, fatG: 0.2, source: 'IFCT' },
  { id: 'food-2', name: 'Chapati', servingUnit: 'piece', servingSizeG: 40, caloriesPerServing: 104, proteinG: 3, carbsG: 18, fatG: 2.5, source: 'IFCT' },
  { id: 'food-3', name: 'Brown rice', servingUnit: 'cup', servingSizeG: 195, caloriesPerServing: 216, proteinG: 5, carbsG: 45, fatG: 1.8, source: 'USDA' },
];

interface AddMealFormProps {
  onAdd: (payload: LogMealPayload) => void | Promise<void>;
}

export function AddMealForm({ onAdd }: AddMealFormProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FoodSearchResult[]>([]);
  const [selected, setSelected] = useState<FoodSearchResult | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [mealType, setMealType] = useState<MealType>('lunch');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!query.trim() || selected) {
      setResults([]);
      return;
    }
    const handle = setTimeout(() => {
      searchFoods(query)
        .then(setResults)
        // Falls back to a small local list so search stays usable while /foods/search isn't reachable.
        .catch(() => setResults(DEMO_RESULTS.filter((f) => f.name.toLowerCase().includes(query.toLowerCase()))));
    }, 300);
    return () => clearTimeout(handle);
  }, [query, selected]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    setSubmitting(true);
    try {
      await onAdd({
        foodId: selected.id,
        foodName: selected.name,
        quantity,
        unit: selected.servingUnit,
        mealType,
        loggedAt: new Date().toISOString(),
      });
      setSelected(null);
      setQuery('');
      setQuantity(1);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-neutral-200 bg-white p-5">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500">Add a meal</h2>

      <label className="mb-3 block text-sm font-medium text-charcoal-800">
        Food
        <input
          value={selected ? selected.name : query}
          onChange={(e) => {
            setSelected(null);
            setQuery(e.target.value);
          }}
          placeholder="Search food, e.g. idli"
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
        />
      </label>

      {!selected && results.length > 0 ? (
        <ul className="mb-3 max-h-40 overflow-y-auto rounded-md border border-neutral-200 text-sm">
          {results.map((food) => (
            <li key={food.id}>
              <button
                type="button"
                onClick={() => setSelected(food)}
                className="flex w-full justify-between px-3 py-2 text-left hover:bg-neutral-50"
              >
                <span>{food.name}</span>
                <span className="text-neutral-400">
                  {food.caloriesPerServing} kcal / {food.servingUnit}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mb-3 grid grid-cols-2 gap-3">
        <label className="text-sm font-medium text-charcoal-800">
          Quantity
          <input
            type="number"
            min={0}
            step={0.5}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="text-sm font-medium text-charcoal-800">
          Meal
          <select
            value={mealType}
            onChange={(e) => setMealType(e.target.value as MealType)}
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm capitalize"
          >
            {MEAL_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>
      </div>

      <button
        type="submit"
        disabled={!selected || submitting}
        className="w-full rounded-lg bg-charcoal-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-charcoal-800 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {submitting ? 'Saving...' : 'Log meal'}
      </button>
    </form>
  );
}
