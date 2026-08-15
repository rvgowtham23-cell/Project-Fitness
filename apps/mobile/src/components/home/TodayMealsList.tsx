import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../../theme';
import { Card, EmptyState } from '../ui';
import type { TodayMealSummary } from '../../types/api';

export function TodayMealsList({ meals }: { meals: TodayMealSummary[] }) {
  if (meals.length === 0) {
    return (
      <Card>
        <EmptyState title="No meals logged yet" subtitle="Tap Log below to snap a photo of your next meal." />
      </Card>
    );
  }

  return (
    <View style={styles.list}>
      {meals.map((meal) => (
        <Card key={meal.id} style={styles.row}>
          <View style={styles.thumb}>
            <Text style={styles.thumbEmoji}>🍽️</Text>
          </View>
          <View style={styles.info}>
            <Text style={typography.bodyMedium}>{meal.name}</Text>
            <Text style={typography.caption}>{meal.loggedAt}</Text>
          </View>
          <Text style={typography.h3}>{meal.calories} kcal</Text>
        </Card>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  thumb: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbEmoji: { fontSize: 20 },
  info: { flex: 1 },
});
