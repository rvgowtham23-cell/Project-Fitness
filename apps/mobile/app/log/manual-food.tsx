import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { colors, radius, spacing, typography } from '../../src/theme';
import { Button, Card, EmptyState, LoadingState, Screen, TextField } from '../../src/components/ui';
import { useFoodSearch, useSaveMeal } from '../../src/features/nutrition/use-meal-mutations';
import type { FoodSearchResult } from '../../src/types/api';
import { deriveMealTypeFromTime } from '../../src/lib/meal-type';

export default function ManualFoodScreen() {
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<'search' | 'custom'>('search');
  const searchMutation = useFoodSearch();
  const saveMealMutation = useSaveMeal();

  const [customName, setCustomName] = useState('');
  const [customCalories, setCustomCalories] = useState('');
  const [customProtein, setCustomProtein] = useState('');
  const [customCarbs, setCustomCarbs] = useState('');
  const [customFat, setCustomFat] = useState('');

  function runSearch(text: string) {
    setQuery(text);
    if (text.trim().length < 2) return;
    searchMutation.mutate(text.trim());
  }

  function addSearchResult(food: FoodSearchResult) {
    saveMealMutation.mutate(
      {
        payload: {
          loggedAt: new Date().toISOString(),
          items: [
            {
              foodName: food.name,
              estimatedWeightG: 0,
              estimatedWeightRangeG: [0, 0],
              unit: food.servingUnit,
              quantity: 1,
              calories: food.caloriesPerServing,
              proteinG: food.proteinPerServingG,
              carbsG: food.carbsPerServingG,
              fatG: food.fatPerServingG,
              fiberG: 0,
              confidence: 1,
              source: food.source,
              confirmed: true,
            },
          ],
        },
        mealType: deriveMealTypeFromTime(),
      },
      { onSuccess: () => router.replace('/(tabs)/home') },
    );
  }

  function saveCustomFood() {
    const calories = parseFloat(customCalories) || 0;
    saveMealMutation.mutate(
      {
        payload: {
          loggedAt: new Date().toISOString(),
          items: [
            {
              foodName: customName || 'Custom food',
              estimatedWeightG: 0,
              estimatedWeightRangeG: [0, 0],
              unit: 'serving',
              quantity: 1,
              calories,
              proteinG: parseFloat(customProtein) || 0,
              carbsG: parseFloat(customCarbs) || 0,
              fatG: parseFloat(customFat) || 0,
              fiberG: 0,
              confidence: 1,
              source: 'USER',
              confirmed: true,
            },
          ],
        },
        mealType: deriveMealTypeFromTime(),
      },
      { onSuccess: () => router.replace('/(tabs)/home') },
    );
  }

  return (
    <Screen>
      <View style={styles.segmentRow}>
        <Pressable style={[styles.segment, mode === 'search' && styles.segmentActive]} onPress={() => setMode('search')}>
          <Text style={[typography.captionMedium, mode === 'search' && styles.segmentActiveText]}>Search</Text>
        </Pressable>
        <Pressable style={[styles.segment, mode === 'custom' && styles.segmentActive]} onPress={() => setMode('custom')}>
          <Text style={[typography.captionMedium, mode === 'custom' && styles.segmentActiveText]}>Custom entry</Text>
        </Pressable>
      </View>

      {mode === 'search' ? (
        <>
          <TextField
            placeholder="Search foods (e.g. idli, roti, banana)"
            value={query}
            onChangeText={runSearch}
            autoFocus
          />
          {searchMutation.isPending && <LoadingState label="Searching…" />}
          {!searchMutation.isPending && query.length >= 2 && searchMutation.data?.length === 0 && (
            <EmptyState title="No matches" subtitle="Try a different search term, or add it as a custom food." />
          )}
          {(searchMutation.data ?? []).map((food) => (
            <Card key={food.id} style={styles.resultCard}>
              <View style={{ flex: 1 }}>
                <Text style={typography.bodyMedium}>{food.name}</Text>
                <Text style={typography.caption}>
                  {food.caloriesPerServing} kcal · P{food.proteinPerServingG}g C{food.carbsPerServingG}g F
                  {food.fatPerServingG}g
                </Text>
              </View>
              <Button label="Add" onPress={() => addSearchResult(food)} variant="accent" fullWidth={false} />
            </Card>
          ))}
        </>
      ) : (
        <>
          <TextField label="Food name" placeholder="e.g. Homemade paneer curry" value={customName} onChangeText={setCustomName} />
          <TextField
            label="Calories"
            placeholder="0"
            keyboardType="decimal-pad"
            value={customCalories}
            onChangeText={setCustomCalories}
          />
          <View style={styles.macroRow}>
            <View style={styles.macroField}>
              <TextField label="Protein (g)" keyboardType="decimal-pad" value={customProtein} onChangeText={setCustomProtein} />
            </View>
            <View style={styles.macroField}>
              <TextField label="Carbs (g)" keyboardType="decimal-pad" value={customCarbs} onChangeText={setCustomCarbs} />
            </View>
            <View style={styles.macroField}>
              <TextField label="Fat (g)" keyboardType="decimal-pad" value={customFat} onChangeText={setCustomFat} />
            </View>
          </View>
          {saveMealMutation.isError && (
            <Text style={styles.errorText}>
              {saveMealMutation.error instanceof Error ? saveMealMutation.error.message : 'Failed to save meal.'}
            </Text>
          )}
          <Button
            label="Save to log"
            onPress={saveCustomFood}
            variant="accent"
            loading={saveMealMutation.isPending}
            disabled={!customName.trim()}
          />
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  errorText: { color: colors.danger, marginBottom: spacing.sm },
  segmentRow: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: 4,
    marginBottom: spacing.xl,
  },
  segment: { flex: 1, paddingVertical: spacing.sm, alignItems: 'center', borderRadius: radius.sm },
  segmentActive: { backgroundColor: colors.white },
  segmentActiveText: { color: colors.charcoal },
  resultCard: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md, gap: spacing.md },
  macroRow: { flexDirection: 'row', gap: spacing.md },
  macroField: { flex: 1 },
});
