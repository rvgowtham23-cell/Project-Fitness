import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../lib/api-client';

export function useDailyNutrition(date: string) {
  return useQuery({
    queryKey: ['nutrition', 'daily', date],
    queryFn: () => apiClient.getDailyNutrition(date),
  });
}

export function useNutritionTargets() {
  return useQuery({
    queryKey: ['nutrition', 'targets'],
    queryFn: () => apiClient.getNutritionTargets(),
  });
}
