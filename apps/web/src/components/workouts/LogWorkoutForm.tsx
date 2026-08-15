'use client';

import { useState } from 'react';
import type { WorkoutSetInput } from '@fitness/shared-types';
import type { LogWorkoutPayload } from '@/types/api';

function emptySet(setNumber: number): WorkoutSetInput {
  return { exerciseName: '', setNumber, weightKg: undefined, reps: undefined };
}

interface LogWorkoutFormProps {
  onAdd: (payload: LogWorkoutPayload) => void | Promise<void>;
}

export function LogWorkoutForm({ onAdd }: LogWorkoutFormProps) {
  const [exerciseName, setExerciseName] = useState('');
  const [sets, setSets] = useState<WorkoutSetInput[]>([emptySet(1)]);
  const [submitting, setSubmitting] = useState(false);

  function updateSet(index: number, patch: Partial<WorkoutSetInput>) {
    setSets((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  }

  function addSet() {
    setSets((prev) => [...prev, emptySet(prev.length + 1)]);
  }

  function removeSet(index: number) {
    setSets((prev) => prev.filter((_, i) => i !== index).map((s, i) => ({ ...s, setNumber: i + 1 })));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!exerciseName.trim()) return;
    setSubmitting(true);
    try {
      await onAdd({
        exerciseName,
        performedAt: new Date().toISOString(),
        sets: sets.map((s) => ({ ...s, exerciseName })),
      });
      setExerciseName('');
      setSets([emptySet(1)]);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-neutral-200 bg-white p-5">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500">Log a workout</h2>

      <label className="mb-4 block text-sm font-medium text-charcoal-800">
        Exercise
        <input
          value={exerciseName}
          onChange={(e) => setExerciseName(e.target.value)}
          placeholder="e.g. Barbell squat"
          className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
        />
      </label>

      <div className="mb-3 space-y-2">
        {sets.map((set, index) => (
          <div key={index} className="flex items-center gap-2">
            <span className="w-6 text-xs text-neutral-400">#{set.setNumber}</span>
            <input
              type="number"
              placeholder="kg"
              value={set.weightKg ?? ''}
              onChange={(e) => updateSet(index, { weightKg: e.target.value === '' ? undefined : Number(e.target.value) })}
              className="w-20 rounded-md border border-neutral-300 px-2 py-1.5 text-sm"
            />
            <input
              type="number"
              placeholder="reps"
              value={set.reps ?? ''}
              onChange={(e) => updateSet(index, { reps: e.target.value === '' ? undefined : Number(e.target.value) })}
              className="w-20 rounded-md border border-neutral-300 px-2 py-1.5 text-sm"
            />
            <button
              type="button"
              onClick={() => removeSet(index)}
              disabled={sets.length === 1}
              className="ml-auto text-xs text-neutral-400 hover:text-red-500 disabled:opacity-30"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <button type="button" onClick={addSet} className="mb-4 text-sm font-medium text-lime-700 hover:text-lime-800">
        + Add set
      </button>

      <button
        type="submit"
        disabled={!exerciseName.trim() || submitting}
        className="w-full rounded-lg bg-charcoal-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-charcoal-800 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {submitting ? 'Saving...' : 'Log workout'}
      </button>
    </form>
  );
}
