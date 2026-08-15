import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../lib/api-client';
import type { SaveMealPayload } from '../../types/api';

export function useAnalyzeMealImage() {
  return useMutation({
    mutationFn: (imageUri: string) => apiClient.analyzeMealImage(imageUri),
  });
}

export function useSaveMeal() {
  const queryClient = useQueryClient();
  return useMutation({
    // TODO(offline-sync): queue this locally (with a client-generated UUIDv7, per
    // architecture-plan.md §F) when there's no connectivity, rather than failing the
    // save outright. Deferred — see architecture-plan.md §L roadmap.
    mutationFn: (payload: SaveMealPayload) => apiClient.saveMeal(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nutrition'] });
    },
  });
}

export function useFoodSearch() {
  return useMutation({
    mutationFn: (query: string) => apiClient.searchFoods(query),
  });
}

export function useBarcodeLookup() {
  return useMutation({
    mutationFn: (code: string) => apiClient.getBarcodeProduct(code),
  });
}
