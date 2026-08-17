import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../../theme';
import { Card } from '../ui';
import type { Exercise, WorkoutSessionRecord } from '../../types/api';

interface Props {
  sessions: WorkoutSessionRecord[];
  exercisesById: Map<string, Exercise>;
}

function formatSet(set: { weightKg: number | null; reps: number | null }): string {
  if (set.weightKg && set.reps) return `${set.weightKg}kg × ${set.reps}`;
  if (set.reps) return `${set.reps} reps`;
  if (set.weightKg) return `${set.weightKg}kg`;
  return '—';
}

export function TodayWorkoutsList({ sessions, exercisesById }: Props) {
  const rows = sessions.flatMap((session) =>
    session.exercises.map((exercise) => ({
      key: exercise.id,
      name: exercisesById.get(exercise.exerciseId)?.name ?? 'Exercise',
      setsLabel: exercise.sets.map(formatSet).join(', '),
      setCount: exercise.sets.length,
    })),
  );

  if (rows.length === 0) return null;

  return (
    <View style={styles.list}>
      {rows.map((row) => (
        <Card key={row.key} style={styles.row}>
          <View style={styles.thumb}>
            <Text style={styles.thumbEmoji}>🏋️</Text>
          </View>
          <View style={styles.info}>
            <Text style={typography.bodyMedium}>{row.name}</Text>
            <Text style={typography.caption}>{row.setsLabel}</Text>
          </View>
          <Text style={typography.h3}>{row.setCount}</Text>
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
