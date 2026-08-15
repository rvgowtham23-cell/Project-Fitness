'use client';

import { useState } from 'react';
import { Banner } from '@/components/ui/Banner';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { WorkoutSessionList } from '@/components/workouts/WorkoutSessionList';
import { LogWorkoutForm } from '@/components/workouts/LogWorkoutForm';
import { useApiData } from '@/lib/use-api-data';
import { getWorkoutSessions, logWorkout } from '@/lib/api-client';
import type { LogWorkoutPayload, WorkoutSession } from '@/types/api';

const DEMO_SESSIONS: WorkoutSession[] = [
  {
    id: 'demo-1',
    performedAt: new Date().toISOString(),
    totalVolumeKg: 3200,
    exercises: [
      {
        exerciseName: 'Barbell squat',
        sets: [
          { exerciseName: 'Barbell squat', setNumber: 1, weightKg: 80, reps: 8 },
          { exerciseName: 'Barbell squat', setNumber: 2, weightKg: 85, reps: 6 },
        ],
      },
      {
        exerciseName: 'Bench press',
        sets: [{ exerciseName: 'Bench press', setNumber: 1, weightKg: 60, reps: 10 }],
      },
    ],
  },
];

export default function WorkoutsPage() {
  const [localSessions, setLocalSessions] = useState<WorkoutSession[] | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const sessionsState = useApiData(() => getWorkoutSessions(), []);
  const usingDemoData = Boolean(sessionsState.error);
  const sessions = localSessions ?? sessionsState.data ?? DEMO_SESSIONS;

  async function handleLog(payload: LogWorkoutPayload) {
    setSaveError(null);
    const optimistic: WorkoutSession = {
      id: `local-${Date.now()}`,
      performedAt: payload.performedAt,
      exercises: [{ exerciseName: payload.exerciseName, sets: payload.sets }],
    };
    try {
      const saved = await logWorkout(payload);
      setLocalSessions([saved, ...sessions]);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Could not reach the API — workout saved locally only.');
      setLocalSessions([optimistic, ...sessions]);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-charcoal-900">Workouts</h1>
      <p className="mt-1 text-sm text-neutral-500">Session history and manual logging.</p>

      {usingDemoData ? (
        <Banner>
          Showing sample sessions — wired to <code>GET /workouts</code> (assumed list endpoint alongside{' '}
          <code>POST /workouts</code> per §G).
        </Banner>
      ) : null}
      {saveError ? <Banner tone="error">{saveError}</Banner> : null}

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          {sessionsState.loading ? (
            <LoadingSpinner label="Loading sessions..." />
          ) : sessions.length === 0 ? (
            <EmptyState message="No workouts logged yet." />
          ) : (
            <WorkoutSessionList sessions={sessions} />
          )}
        </div>
        <div>
          <LogWorkoutForm onAdd={handleLog} />
        </div>
      </div>
    </div>
  );
}
