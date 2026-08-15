'use client';

import { useState } from 'react';
import { Banner } from '@/components/ui/Banner';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { useApiData } from '@/lib/use-api-data';
import { getProfile, requestAccountDeletion, requestDataExport, updateProfile } from '@/lib/api-client';
import type { ProfileData } from '@/types/api';

const DEMO_PROFILE: ProfileData = {
  id: 'demo-user',
  name: 'Demo User',
  email: 'demo.user@example.com',
  goal: 'muscle_gain',
  heightCm: 175,
  weightKg: 78,
};

export default function ProfilePage() {
  const profileState = useApiData(() => getProfile(), []);
  const [status, setStatus] = useState<string | null>(null);
  const profile = profileState.data ?? DEMO_PROFILE;
  const usingDemoData = Boolean(profileState.error);

  async function handleSave(updated: ProfileData) {
    try {
      await updateProfile(updated);
      setStatus('Profile saved.');
    } catch {
      setStatus('Could not reach the API — changes were not persisted.');
    }
  }

  async function handleExport() {
    try {
      await requestDataExport();
      setStatus('Export requested — you will receive an email when it is ready.');
    } catch {
      setStatus('Could not reach the API to request an export.');
    }
  }

  async function handleDelete() {
    if (typeof window !== 'undefined' && !window.confirm('This will permanently delete your account and data. Continue?')) {
      return;
    }
    try {
      await requestAccountDeletion();
      setStatus('Account deletion requested.');
    } catch {
      setStatus('Could not reach the API to request deletion.');
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-charcoal-900">Profile &amp; settings</h1>
      <p className="mt-1 text-sm text-neutral-500">Goals, notifications, subscription, and data controls.</p>

      {usingDemoData ? (
        <Banner>
          Showing sample profile — wired to <code>GET /profile</code>.
        </Banner>
      ) : null}
      {status ? <Banner tone={status.startsWith('Could not') ? 'error' : 'info'}>{status}</Banner> : null}

      <div className="mt-6 space-y-6">
        <ProfileForm profile={profile} onSave={handleSave} />

        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-neutral-500">Subscription</h2>
          <p className="text-sm text-charcoal-800">Free tier</p>
          <p className="mt-1 text-xs text-neutral-500">
            Subscription enforcement is planned for V2 (architecture-plan.md §K).
          </p>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-neutral-500">Your data</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleExport}
              className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-charcoal-800 hover:bg-neutral-50"
            >
              Export my data
            </button>
            <button
              onClick={handleDelete}
              className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              Delete account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
