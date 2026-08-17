import type { WorkoutSetInput } from '@fitness/shared-types';
import type { Exercise } from '../types/api';

// The backend's CreateWorkoutDto groups sets under {exerciseId, sets[]} per exercise and
// wants `startedAt`, not the client's flat {exerciseName, ...}[] + `performedAt` shape (which
// also has no exerciseId at all — exercise names only exist client-side, whether typed
// manually or produced by the AI text parser). This resolves names against the fetched
// exercise dictionary and groups accordingly; throws with a clear message if a name doesn't
// match anything in the library, rather than letting the backend 400 on a missing exerciseId.
export interface CreateWorkoutApiPayload {
  startedAt: string;
  exercises: Array<{
    exerciseId: string;
    sets: Array<{ setNumber: number; weightKg?: number; reps?: number; durationSeconds?: number; restSeconds?: number }>;
  }>;
}

export function toCreateWorkoutPayload(
  sets: WorkoutSetInput[],
  performedAt: string,
  exerciseLibrary: Exercise[],
): CreateWorkoutApiPayload {
  const byName = new Map<string, Exercise>(exerciseLibrary.map((ex) => [ex.name.toLowerCase().trim(), ex]));

  const groups = new Map<string, WorkoutSetInput[]>();
  for (const set of sets) {
    const key = set.exerciseName.toLowerCase().trim();
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(set);
  }

  const exercises = Array.from(groups.entries()).map(([key, groupSets]) => {
    const match = byName.get(key);
    if (!match) {
      throw new Error(
        `"${groupSets[0].exerciseName}" isn't in the exercise library yet — try a listed exercise or a close spelling.`,
      );
    }
    return {
      exerciseId: match.id,
      sets: groupSets.map((s, i) => ({
        setNumber: s.setNumber ?? i + 1,
        weightKg: s.weightKg,
        reps: s.reps,
        durationSeconds: s.durationSeconds,
        restSeconds: s.restSeconds,
      })),
    };
  });

  return { startedAt: performedAt, exercises };
}
