import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useDailyNutrition, useNutritionTargets } from '../../src/features/nutrition/use-daily-nutrition';
import { CalorieSummaryCard } from '../../src/components/home/CalorieSummaryCard';
import { MacroProgressGrid } from '../../src/components/home/MacroProgressGrid';
import { TodayMealsList } from '../../src/components/home/TodayMealsList';
import { Button, Card, ErrorState, LoadingState, Screen } from '../../src/components/ui';
import { colors, spacing, typography } from '../../src/theme';
import { mockTodayMeals } from '../../src/lib/mock-data';

const today = new Date().toISOString().slice(0, 10);

export default function HomeScreen() {
  const nutritionQuery = useDailyNutrition(today);
  const targetsQuery = useNutritionTargets();

  // TODO: replace with GET /workouts?date=today once that endpoint is wired to a hook —
  // hardcoded false here just demonstrates the "no workout yet" state.
  const workedOutToday = false;

  if (nutritionQuery.isLoading || targetsQuery.isLoading) {
    return (
      <Screen>
        <LoadingState label="Loading today's summary…" />
      </Screen>
    );
  }

  if (nutritionQuery.isError || !nutritionQuery.data || !targetsQuery.data) {
    return (
      <Screen>
        <ErrorState message="Couldn't load your dashboard." onRetry={() => nutritionQuery.refetch()} />
      </Screen>
    );
  }

  const summary = nutritionQuery.data;
  const targets = targetsQuery.data;

  return (
    <Screen onRefresh={() => nutritionQuery.refetch()} refreshing={nutritionQuery.isFetching}>
      <View style={styles.header}>
        <View>
          <Text style={typography.caption}>Today</Text>
          <Text style={typography.h1}>Good to see you</Text>
        </View>
        <Button label="+ Log" onPress={() => router.push('/log')} variant="accent" fullWidth={false} />
      </View>

      <CalorieSummaryCard consumed={summary.totalCalories} target={summary.targetCalories} />

      <Text style={[typography.h3, styles.sectionTitle]}>Macros</Text>
      <MacroProgressGrid summary={summary} targets={targets} />

      <Card style={styles.workoutCard}>
        <View style={styles.workoutRow}>
          <View style={styles.workoutIconWrap}>
            <Ionicons
              name={workedOutToday ? 'checkmark-circle' : 'barbell-outline'}
              size={22}
              color={workedOutToday ? colors.success : colors.textSecondary}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={typography.bodyMedium}>
              {workedOutToday ? 'Workout logged today' : 'No workout logged yet'}
            </Text>
            <Text style={typography.caption}>
              {workedOutToday ? 'Nice work — keep the streak going.' : 'Log a set, even a quick one.'}
            </Text>
          </View>
          {!workedOutToday && (
            <Button
              label="Log"
              onPress={() => router.push('/log/workout')}
              variant="outline"
              fullWidth={false}
            />
          )}
        </View>
      </Card>

      <Text style={[typography.h3, styles.sectionTitle]}>Today's meals</Text>
      {/* architecture-plan.md §G doesn't list a dedicated "meals for a day" endpoint —
          likely GET /meals?date= once the Nutrition module is built. Using mock data
          directly (not a hook) until that contract exists. */}
      <TodayMealsList meals={mockTodayMeals} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xl,
  },
  sectionTitle: { marginBottom: spacing.md, marginTop: spacing.xs },
  workoutCard: { marginBottom: spacing.xl },
  workoutRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  workoutIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
