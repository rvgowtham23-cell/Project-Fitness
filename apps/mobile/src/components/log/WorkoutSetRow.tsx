import React from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { WorkoutSetInput } from '@fitness/shared-types';
import { colors, radius, spacing, typography } from '../../theme';
import { Badge } from '../ui';

interface Props {
  set: WorkoutSetInput;
  ambiguous?: boolean;
  onChange: (partial: Partial<WorkoutSetInput>) => void;
  onRemove: () => void;
}

export function WorkoutSetRow({ set, ambiguous, onChange, onRemove }: Props) {
  return (
    <View style={[styles.row, ambiguous && styles.rowAmbiguous]}>
      <View style={styles.nameCol}>
        <Text style={typography.bodyMedium} numberOfLines={1}>
          {set.exerciseName}
        </Text>
        <Text style={typography.caption}>Set {set.setNumber}</Text>
      </View>

      <View style={styles.field}>
        <Text style={typography.caption}>kg</Text>
        <TextInput
          keyboardType="decimal-pad"
          value={set.weightKg?.toString() ?? ''}
          placeholder="—"
          placeholderTextColor={colors.textTertiary}
          onChangeText={(v) => onChange({ weightKg: v ? parseFloat(v) : undefined })}
          style={styles.input}
        />
      </View>

      <View style={styles.field}>
        <Text style={typography.caption}>reps</Text>
        <TextInput
          keyboardType="number-pad"
          value={set.reps?.toString() ?? ''}
          placeholder="—"
          placeholderTextColor={colors.textTertiary}
          onChangeText={(v) => onChange({ reps: v ? parseInt(v, 10) : undefined })}
          style={styles.input}
        />
      </View>

      {ambiguous && <Badge label="Confirm" tone="warning" />}

      <Pressable onPress={onRemove} hitSlop={8}>
        <Ionicons name="close-circle" size={18} color={colors.textTertiary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  rowAmbiguous: { borderColor: colors.warning },
  nameCol: { flex: 1.4 },
  field: { flex: 1 },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 2,
    fontSize: 14,
    color: colors.textPrimary,
  },
});
