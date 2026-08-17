import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../lib/api-client';
import type { Exercise, SaveWorkoutPayload } from '../../types/api';

export function useExercises() {
  return useQuery({
    queryKey: ['exercises'],
    queryFn: () => apiClient.getExercises(),
    staleTime: 60 * 60_000, // exercise dictionary changes rarely
  });
}

export function useWorkoutsForDate(date: string) {
  return useQuery({
    queryKey: ['workouts', date],
    queryFn: () => apiClient.getWorkoutsForDate(date),
  });
}

export function useParseWorkoutText() {
  return useMutation({
    mutationFn: (text: string) => apiClient.parseWorkoutText(text),
  });
}

export function useSaveWorkout() {
  const queryClient = useQueryClient();
  return useMutation({
    // TODO(offline-sync): same deferred local-queue concern as useSaveMeal.
    mutationFn: ({ payload, exerciseLibrary }: { payload: SaveWorkoutPayload; exerciseLibrary: Exercise[] }) =>
      apiClient.saveWorkout(payload, exerciseLibrary),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
    },
  });
}

export function useDeleteWorkout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.deleteWorkout(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
    },
  });
}
