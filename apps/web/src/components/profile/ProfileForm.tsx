'use client';

import { useState } from 'react';
import type { FitnessGoal } from '@fitness/shared-types';
import type { ProfileData } from '@/types/api';

const GOALS: FitnessGoal[] = [
  'weight_loss',
  'fat_loss',
  'weight_maintenance',
  'muscle_gain',
  'strength_improvement',
  'general_fitness',
  'endurance',
  'body_recomposition',
];

interface ProfileFormProps {
  profile: ProfileData;
  onSave: (profile: ProfileData) => void | Promise<void>;
}

export function ProfileForm({ profile, onSave }: ProfileFormProps) {
  const [form, setForm] = useState(profile);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(form);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-neutral-200 bg-white p-5">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500">Goals &amp; profile</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium text-charcoal-800">
          Name
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="text-sm font-medium text-charcoal-800">
          Email
          <input
            value={form.email}
            disabled
            className="mt-1 w-full rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-500"
          />
        </label>
        <label className="text-sm font-medium text-charcoal-800">
          Height (cm)
          <input
            type="number"
            value={form.heightCm ?? ''}
            onChange={(e) => setForm({ ...form, heightCm: Number(e.target.value) })}
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="text-sm font-medium text-charcoal-800">
          Weight (kg)
          <input
            type="number"
            value={form.weightKg ?? ''}
            onChange={(e) => setForm({ ...form, weightKg: Number(e.target.value) })}
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
        </label>
        <label className="text-sm font-medium text-charcoal-800 sm:col-span-2">
          Primary goal
          <select
            value={form.goal}
            onChange={(e) => setForm({ ...form, goal: e.target.value as FitnessGoal })}
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm capitalize"
          >
            {GOALS.map((g) => (
              <option key={g} value={g}>
                {g.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </label>
      </div>
      <button
        type="submit"
        disabled={saving}
        className="mt-4 rounded-lg bg-charcoal-900 px-4 py-2 text-sm font-semibold text-white hover:bg-charcoal-800 disabled:opacity-40"
      >
        {saving ? 'Saving...' : 'Save changes'}
      </button>
    </form>
  );
}
