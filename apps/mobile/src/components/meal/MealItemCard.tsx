import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '../../theme';
import { Badge, confidenceLabel, confidenceTone } from '../ui/Badge';
import type { ConfirmedMealItem } from '../../types/api';

interface Props {
  item: ConfirmedMealItem;
  onChange: (partial: Partial<ConfirmedMealItem>) => void;
  onRemove: () => void;
}

// Inline tap-to-edit is the point: the "AI estimates, user corrects" pattern only earns
// trust if correcting a guess is at least as fast as accepting it — no navigating to a
// separate edit screen for a quantity tweak.
export function MealItemCard({ item, onChange, onRemove }: Props) {
  const [editingField, setEditingField] = useState<'quantity' | 'weight' | 'name' | null>(null);
  const [draftValue, setDraftValue] = useState('');

  function startEdit(field: 'quantity' | 'weight' | 'name', currentValue: string) {
    setDraftValue(currentValue);
    setEditingField(field);
  }

  // Editing quantity/weight scales calories+macros proportionally rather than leaving
  // them stale — the correction is only useful if the nutrition numbers stay honest.
  function scaledMacros(factor: number) {
    return {
      calories: item.calories * factor,
      proteinG: item.proteinG * factor,
      carbsG: item.carbsG * factor,
      fatG: item.fatG * factor,
      fiberG: item.fiberG * factor,
    };
  }

  function commitEdit() {
    if (editingField === 'quantity') {
      const qty = parseFloat(draftValue);
      if (!Number.isNaN(qty) && qty > 0 && item.quantity > 0) {
        const factor = qty / item.quantity;
        onChange({ quantity: qty, estimatedWeightG: item.estimatedWeightG * factor, ...scaledMacros(factor) });
      }
    } else if (editingField === 'weight') {
      const weight = parseFloat(draftValue);
      if (!Number.isNaN(weight) && weight > 0 && item.estimatedWeightG > 0) {
        const factor = weight / item.estimatedWeightG;
        onChange({ estimatedWeightG: weight, ...scaledMacros(factor) });
      }
    } else if (editingField === 'name') {
      if (draftValue.trim().length > 0) onChange({ foodName: draftValue.trim() });
    }
    setEditingField(null);
  }

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        {editingField === 'name' ? (
          <TextInput
            autoFocus
            value={draftValue}
            onChangeText={setDraftValue}
            onBlur={commitEdit}
            onSubmitEditing={commitEdit}
            style={[typography.h3, styles.inlineInput, styles.nameInput]}
          />
        ) : (
          <Pressable style={styles.nameWrap} onPress={() => startEdit('name', item.foodName)}>
            <Text style={typography.h3}>{item.foodName}</Text>
            <Ionicons name="pencil" size={13} color={colors.textTertiary} style={styles.pencil} />
          </Pressable>
        )}
        <Pressable onPress={onRemove} hitSlop={8}>
          <Ionicons name="close-circle" size={20} color={colors.textTertiary} />
        </Pressable>
      </View>

      <View style={styles.metaRow}>
        <Badge label={confidenceLabel(item.confidence)} tone={confidenceTone(item.confidence)} />
        <Text style={typography.caption}>
          Est. range {item.estimatedWeightRangeG[0]}–{item.estimatedWeightRangeG[1]}g
        </Text>
      </View>

      <View style={styles.editRow}>
        <Pressable style={styles.editField} onPress={() => startEdit('quantity', String(item.quantity))}>
          <Text style={typography.caption}>Quantity</Text>
          {editingField === 'quantity' ? (
            <TextInput
              autoFocus
              keyboardType="decimal-pad"
              value={draftValue}
              onChangeText={setDraftValue}
              onBlur={commitEdit}
              onSubmitEditing={commitEdit}
              style={[typography.bodyMedium, styles.inlineInput]}
            />
          ) : (
            <Text style={typography.bodyMedium}>
              {item.quantity} {item.unit}
            </Text>
          )}
        </Pressable>

        <Pressable style={styles.editField} onPress={() => startEdit('weight', String(item.estimatedWeightG))}>
          <Text style={typography.caption}>Weight (g)</Text>
          {editingField === 'weight' ? (
            <TextInput
              autoFocus
              keyboardType="decimal-pad"
              value={draftValue}
              onChangeText={setDraftValue}
              onBlur={commitEdit}
              onSubmitEditing={commitEdit}
              style={[typography.bodyMedium, styles.inlineInput]}
            />
          ) : (
            <Text style={typography.bodyMedium}>{item.estimatedWeightG}g</Text>
          )}
        </Pressable>

        <View style={styles.editField}>
          <Text style={typography.caption}>Calories</Text>
          <Text style={typography.bodyMedium}>{Math.round(item.calories)}</Text>
        </View>
      </View>

      <View style={styles.macroRow}>
        <Text style={styles.macroText}>P {item.proteinG.toFixed(1)}g</Text>
        <Text style={styles.macroText}>C {item.carbsG.toFixed(1)}g</Text>
        <Text style={styles.macroText}>F {item.fatG.toFixed(1)}g</Text>
        <Text style={styles.macroText}>Fiber {item.fiberG.toFixed(1)}g</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  nameWrap: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: spacing.xs },
  pencil: { marginTop: 2 },
  nameInput: { flex: 1, padding: 0 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.sm, marginBottom: spacing.md },
  editRow: { flexDirection: 'row', gap: spacing.lg, marginBottom: spacing.md },
  editField: { flex: 1 },
  inlineInput: {
    borderBottomWidth: 1.5,
    borderBottomColor: colors.charcoal,
    padding: 0,
    paddingBottom: 2,
  },
  macroRow: { flexDirection: 'row', gap: spacing.md, flexWrap: 'wrap' },
  macroText: { fontSize: 12, color: colors.textSecondary, fontWeight: '600' },
});
