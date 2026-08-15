import type { WorkoutSession } from '@/types/api';

export function WorkoutSessionList({ sessions }: { sessions: WorkoutSession[] }) {
  return (
    <div className="space-y-4">
      {sessions.map((session) => (
        <div key={session.id} className="rounded-2xl border border-neutral-200 bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-semibold text-charcoal-900">
              {new Date(session.performedAt).toLocaleDateString('en-IN', {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
              })}
            </p>
            {session.totalVolumeKg ? (
              <p className="text-sm text-neutral-500">{session.totalVolumeKg.toLocaleString()} kg volume</p>
            ) : null}
          </div>
          <div className="space-y-2">
            {session.exercises.map((ex) => (
              <div key={ex.exerciseName} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <span className="font-medium text-charcoal-800">{ex.exerciseName}</span>
                <span className="text-neutral-500">
                  {ex.sets.map((s) => `${s.weightKg ?? 0}kg×${s.reps ?? 0}`).join(', ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
