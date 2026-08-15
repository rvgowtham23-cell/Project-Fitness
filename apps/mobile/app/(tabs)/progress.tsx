import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../../src/theme';
import { Card, Screen } from '../../src/components/ui';
import {
  BarSeriesPlaceholder,
  ConsistencyHeatmapPlaceholder,
  LineTrendPlaceholder,
  MacroDistributionPlaceholder,
} from '../../src/components/progress/ChartPlaceholders';
import {
  mockCalorieHistory,
  mockDailyNutritionSummary,
  mockWeightHistoryKg,
  mockWorkoutVolumeHistory,
} from '../../src/lib/mock-data';

type RangeKey = 'daily' | 'weekly' | 'monthly' | 'long-term';

const RANGES: { key: RangeKey; label: string }[] = [
  { key: 'daily', label: 'Daily' },
  { key: 'weekly', label: 'Weekly' },
  { key: 'monthly', label: 'Monthly' },
  { key: 'long-term', label: 'Long-term' },
];

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function ProgressScreen() {
  const [range, setRange] = useState<RangeKey>('weekly');

  return (
    <Screen>
      <Text style={typography.h1}>Progress</Text>
      <Text style={[typography.caption, styles.subtitle]}>
        {/* GET /progress/{weekly,monthly,range,weight-history} per architecture-plan.md §G —
            not yet wired to a hook; all data below is placeholder pending that endpoint
            and a real charting library (see ChartPlaceholders.tsx). */}
        Track weight, calories, macros and workout volume over time.
      </Text>

      <View style={styles.segmentRow}>
        {RANGES.map((r) => (
          <Pressable
            key={r.key}
            onPress={() => setRange(r.key)}
            style={[styles.segment, range === r.key && styles.segmentActive]}
          >
            <Text style={[typography.captionMedium, range === r.key && styles.segmentActiveText]}>{r.label}</Text>
          </Pressable>
        ))}
      </View>

      {range === 'long-term' ? (
        <Card style={styles.comingSoon}>
          <Text style={typography.h3}>90-day / 6-month / 1-year views</Text>
          <Text style={typography.caption}>
            Long-term progress views are V1 scope per architecture-plan.md §K — daily/weekly/monthly ship first.
          </Text>
        </Card>
      ) : (
        <>
          <LineTrendPlaceholder title="Weight trend (kg)" values={mockWeightHistoryKg} unit="kg" />
          <BarSeriesPlaceholder title="Calories" values={mockCalorieHistory} labels={DAY_LABELS} unit="kcal" />
          <MacroDistributionPlaceholder
            proteinG={mockDailyNutritionSummary.totalProteinG}
            carbsG={mockDailyNutritionSummary.totalCarbsG}
            fatG={mockDailyNutritionSummary.totalFatG}
          />
          <BarSeriesPlaceholder
            title="Workout volume"
            values={mockWorkoutVolumeHistory}
            labels={DAY_LABELS}
            unit="kg lifted"
            color={colors.macro.protein}
          />
          <ConsistencyHeatmapPlaceholder days={mockWorkoutVolumeHistory.map((v) => v > 0)} />

          <Card>
            <Text style={typography.h3}>This week vs last week</Text>
            <View style={styles.comparisonRow}>
              <View>
                <Text style={typography.caption}>This week</Text>
                <Text style={typography.h2}>{mockCalorieHistory.reduce((a, b) => a + b, 0)} kcal</Text>
              </View>
              <View style={styles.alignEnd}>
                <Text style={typography.caption}>Last week</Text>
                <Text style={typography.h2}>13,420 kcal</Text>
              </View>
            </View>
          </Card>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  subtitle: { marginTop: spacing.xs, marginBottom: spacing.lg },
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
  comingSoon: { alignItems: 'center', paddingVertical: spacing.xxl },
  comparisonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.lg },
  alignEnd: { alignItems: 'flex-end' },
});
