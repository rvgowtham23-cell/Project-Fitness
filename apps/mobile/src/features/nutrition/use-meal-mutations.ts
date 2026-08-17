import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../lib/api-client';
import type { SaveMealPayload } from '../../types/api';
import type { MealTypeValue } from '../../lib/meal-type';

interface SaveMealArgs {
  payload: SaveMealPayload;
  mealType: MealTypeValue;
  inputMethod?: 'manual' | 'ai_photo' | 'barcode';
}

interface UpdateMealArgs {
  id: string;
  payload: SaveMealPayload;
  mealType: MealTypeValue;
}

export function useMealById(id: string) {
  return useQuery({
    queryKey: ['nutrition', 'meal', id],
    queryFn: () => apiClient.getMealById(id),
    enabled: !!id,
  });
}

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
    mutationFn: ({ payload, mealType, inputMethod }: SaveMealArgs) =>
      apiClient.saveMeal(payload, mealType, inputMethod),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nutrition'] });
    },
  });
}

export function useUpdateMeal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload, mealType }: UpdateMealArgs) =>
      apiClient.updateMeal(id, payload, mealType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nutrition'] });
    },
  });
}

export function useDeleteMeal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.deleteMeal(id),
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
