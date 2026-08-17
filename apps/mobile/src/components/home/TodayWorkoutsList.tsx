import React from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '../../theme';
import { Card } from '../ui';
import { useDeleteWorkout } from '../../features/workout/use-workout';
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
  const deleteMutation = useDeleteWorkout();

  // Deleting removes the whole session (backend has no per-exercise delete), so every row
  // carries its parent session's id even though the row itself is per-exercise — matches
  // "log a workout" being one unit even when it has multiple exercises.
  const rows = sessions.flatMap((session) =>
    session.exercises.map((exercise) => ({
      key: exercise.id,
      sessionId: session.id,
      name: exercisesById.get(exercise.exerciseId)?.name ?? 'Exercise',
      setsLabel: exercise.sets.map(formatSet).join(', '),
      setCount: exercise.sets.length,
    })),
  );

  if (rows.length === 0) return null;

  function confirmDelete(sessionId: string) {
    Alert.alert('Delete workout?', 'This removes the whole logged session.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteMutation.mutate(sessionId) },
    ]);
  }

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
          <Pressable onPress={() => confirmDelete(row.sessionId)} hitSlop={8} style={styles.deleteBtn}>
            <Ionicons name="trash-outline" size={18} color={colors.danger} />
          </Pressable>
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
  deleteBtn: { paddingHorizontal: spacing.xs, paddingVertical: spacing.xs },
});
