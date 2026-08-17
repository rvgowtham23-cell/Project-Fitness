import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, spacing, typography } from '../../src/theme';
import { Button, EmptyState } from '../../src/components/ui';
import { MealItemCard } from '../../src/components/meal/MealItemCard';
import { useMealDraft } from '../../src/state/meal-draft-context';
import { useSaveMeal } from '../../src/features/nutrition/use-meal-mutations';
import { deriveMealTypeFromTime } from '../../src/lib/meal-type';

// The centerpiece of the "AI estimates, user confirms" pattern (architecture-plan.md §H,
// §G's /meals/analyze-image being a draft-only endpoint): nothing here is saved until
// the user taps Confirm — every field is editable inline via MealItemCard.
export default function MealConfirmScreen() {
  const { draft, updateItem, removeItem, clearDraft } = useMealDraft();
  const saveMealMutation = useSaveMeal();

  const totals = useMemo(() => {
    const items = draft?.items ?? [];
    return items.reduce(
      (acc, item) => ({
        calories: acc.calories + item.calories,
        proteinG: acc.proteinG + item.proteinG,
        carbsG: acc.carbsG + item.carbsG,
        fatG: acc.fatG + item.fatG,
      }),
      { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 },
    );
  }, [draft]);

  function handleClose() {
    clearDraft();
    router.back();
  }

  function handleConfirm() {
    if (!draft) return;
    const inputMethod = draft.originLabel.startsWith('From barcode')
      ? 'barcode'
      : draft.originLabel.startsWith('From photo')
        ? 'ai_photo'
        : 'manual';
    saveMealMutation.mutate(
      {
        payload: { items: draft.items, loggedAt: new Date().toISOString(), aiRequestId: draft.aiRequestId },
        mealType: deriveMealTypeFromTime(),
        inputMethod,
      },
      {
        onSuccess: () => {
          clearDraft();
          router.replace('/(tabs)/home');
        },
      },
    );
  }

  if (!draft || draft.items.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <EmptyState title="Nothing to confirm" subtitle="Start a new log from the Log tab." />
        <Button label="Back to Log" onPress={() => router.replace('/log')} style={styles.emptyButton} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable onPress={handleClose} hitSlop={8}>
          <Ionicons name="close" size={24} color={colors.textPrimary} />
        </Pressable>
        <View style={styles.headerTextWrap}>
          <Text style={typography.h3}>Confirm meal</Text>
          <Text style={typography.caption}>{draft.originLabel}</Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {draft.items.map((item, i) => (
          <MealItemCard
            key={i}
            item={item}
            onChange={(partial) => updateItem(i, partial)}
            onRemove={() => removeItem(i)}
          />
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.totalsRow}>
          <Text style={typography.h2}>{Math.round(totals.calories)} kcal</Text>
          <Text style={typography.caption}>
            P{totals.proteinG.toFixed(0)}g · C{totals.carbsG.toFixed(0)}g · F{totals.fatG.toFixed(0)}g
          </Text>
        </View>
        {saveMealMutation.isError && (
          <Text style={styles.errorText}>
            {saveMealMutation.error instanceof Error ? saveMealMutation.error.message : 'Failed to save meal.'}
          </Text>
        )}
        <Button
          label="Confirm & Save"
          onPress={handleConfirm}
          variant="accent"
          loading={saveMealMutation.isPending}
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
  headerTextWrap: { alignItems: 'center' },
  list: { flex: 1 },
  listContent: { padding: spacing.lg },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.md,
  },
  totalsRow: { alignItems: 'center' },
  errorText: { color: colors.danger, textAlign: 'center' },
  emptyButton: { marginTop: spacing.lg, marginHorizontal: spacing.lg },
});
