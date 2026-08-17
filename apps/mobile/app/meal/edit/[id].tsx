import React, { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, spacing, typography } from '../../../src/theme';
import { Button, EmptyState, ErrorState, LoadingState } from '../../../src/components/ui';
import { MealItemCard } from '../../../src/components/meal/MealItemCard';
import { useDeleteMeal, useMealById, useUpdateMeal } from '../../../src/features/nutrition/use-meal-mutations';
import type { ConfirmedMealItem, MealItemRecord } from '../../../src/types/api';
import type { MealTypeValue } from '../../../src/lib/meal-type';

function toConfirmedItem(item: MealItemRecord): ConfirmedMealItem {
  const weight = item.weightG ?? 0;
  return {
    foodName: item.foodName,
    estimatedWeightG: weight,
    estimatedWeightRangeG: [weight, weight],
    unit: item.unit,
    quantity: Number(item.quantity),
    calories: Number(item.calories),
    proteinG: Number(item.proteinG),
    carbsG: Number(item.carbsG),
    fatG: Number(item.fatG),
    fiberG: Number(item.fiberG),
    confidence: item.confidence ?? 1,
    source: item.sourceType,
    confirmed: true,
  };
}

// Reuses MealItemCard's inline tap-to-edit (already built for the AI-confirm flow) so
// correcting an already-logged meal's quantities/macros works the same way as correcting an
// AI estimate before it's ever saved — one editing pattern, not two.
export default function MealEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const mealQuery = useMealById(id);
  const updateMutation = useUpdateMeal();
  const deleteMutation = useDeleteMeal();

  const [items, setItems] = useState<ConfirmedMealItem[] | null>(null);
  const [mealType, setMealType] = useState<MealTypeValue>('lunch');
  const [loggedAt, setLoggedAt] = useState<string>(new Date().toISOString());

  useEffect(() => {
    if (mealQuery.data && items === null) {
      setItems(mealQuery.data.items.map(toConfirmedItem));
      setMealType(mealQuery.data.mealType as MealTypeValue);
      setLoggedAt(mealQuery.data.loggedAt);
    }
  }, [mealQuery.data, items]);

  function updateItem(index: number, partial: Partial<ConfirmedMealItem>) {
    setItems((prev) => (prev ? prev.map((it, i) => (i === index ? { ...it, ...partial } : it)) : prev));
  }

  function removeItem(index: number) {
    setItems((prev) => (prev ? prev.filter((_, i) => i !== index) : prev));
  }

  function handleSave() {
    if (!items || items.length === 0) return;
    updateMutation.mutate(
      { id, payload: { items, loggedAt }, mealType },
      { onSuccess: () => router.back() },
    );
  }

  function handleDelete() {
    Alert.alert('Delete meal?', 'This removes it from your log and today\'s totals.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteMutation.mutate(id, { onSuccess: () => router.back() }),
      },
    ]);
  }

  if (mealQuery.isLoading || items === null) {
    return (
      <SafeAreaView style={styles.safe}>
        <LoadingState label="Loading meal…" />
      </SafeAreaView>
    );
  }

  if (mealQuery.isError) {
    return (
      <SafeAreaView style={styles.safe}>
        <ErrorState message="Couldn't load this meal." onRetry={() => mealQuery.refetch()} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="close" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={typography.h3}>Edit meal</Text>
        <Pressable onPress={handleDelete} hitSlop={8}>
          <Ionicons name="trash-outline" size={22} color={colors.danger} />
        </Pressable>
      </View>

      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {items.length === 0 ? (
          <EmptyState title="No items left" subtitle="Add at least one item or delete this meal instead." />
        ) : (
          items.map((item, i) => (
            <MealItemCard
              key={i}
              item={item}
              onChange={(partial) => updateItem(i, partial)}
              onRemove={() => removeItem(i)}
            />
          ))
        )}
      </ScrollView>

      <View style={styles.footer}>
        {updateMutation.isError && (
          <Text style={styles.errorText}>
            {updateMutation.error instanceof Error ? updateMutation.error.message : 'Failed to save changes.'}
          </Text>
        )}
        {deleteMutation.isError && (
          <Text style={styles.errorText}>
            {deleteMutation.error instanceof Error ? deleteMutation.error.message : 'Failed to delete meal.'}
          </Text>
        )}
        <Button
          label="Save changes"
          onPress={handleSave}
          variant="accent"
          loading={updateMutation.isPending}
          disabled={items.length === 0}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  list: { flex: 1 },
  listContent: { padding: spacing.lg },
  footer: { padding: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border, gap: spacing.md },
  errorText: { color: colors.danger, textAlign: 'center' },
});
