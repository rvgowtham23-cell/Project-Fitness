import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../lib/api-client';
import type { SaveWorkoutPayload } from '../../types/api';

export function useExercises() {
  return useQuery({
    queryKey: ['exercises'],
    queryFn: () => apiClient.getExercises(),
    staleTime: 60 * 60_000, // exercise dictionary changes rarely
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
    mutationFn: (payload: SaveWorkoutPayload) => apiClient.saveWorkout(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
    },
  });
}
