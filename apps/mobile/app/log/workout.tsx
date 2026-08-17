import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import type { WorkoutSetInput } from '@fitness/shared-types';
import { colors, radius, spacing, typography } from '../../src/theme';
import { Button, Card, LoadingState, Screen, SelectableChip, TextField } from '../../src/components/ui';
import { WorkoutSetRow } from '../../src/components/log/WorkoutSetRow';
import { useExercises, useParseWorkoutText, useSaveWorkout } from '../../src/features/workout/use-workout';

type Mode = 'manual' | 'text';

export default function WorkoutLogScreen() {
  const [mode, setMode] = useState<Mode>('manual');
  const exercisesQuery = useExercises();
  const parseMutation = useParseWorkoutText();
  const saveMutation = useSaveWorkout();

  const [sets, setSets] = useState<WorkoutSetInput[]>([]);
  const [ambiguousFields, setAmbiguousFields] = useState<string[]>([]);

  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [weightInput, setWeightInput] = useState('');
  const [repsInput, setRepsInput] = useState('');

  const [freeText, setFreeText] = useState('');

  function addManualSet() {
    if (!selectedExercise) return;
    const setNumber = sets.filter((s) => s.exerciseName === selectedExercise).length + 1;
    setSets((prev) => [
      ...prev,
      {
        exerciseName: selectedExercise,
        setNumber,
        weightKg: weightInput ? parseFloat(weightInput) : undefined,
        reps: repsInput ? parseInt(repsInput, 10) : undefined,
      },
    ]);
    setWeightInput('');
    setRepsInput('');
  }

  function parseText() {
    if (!freeText.trim()) return;
    parseMutation.mutate(freeText.trim(), {
      onSuccess: (response) => {
        setSets(response.sets);
        setAmbiguousFields(response.ambiguousFields ?? []);
      },
    });
  }

  function updateSet(index: number, partial: Partial<WorkoutSetInput>) {
    setSets((prev) => prev.map((s, i) => (i === index ? { ...s, ...partial } : s)));
  }

  function removeSet(index: number) {
    setSets((prev) => prev.filter((_, i) => i !== index));
  }

  function saveWorkout() {
    saveMutation.mutate(
      {
        payload: { sets, performedAt: new Date().toISOString() },
        exerciseLibrary: exercisesQuery.data ?? [],
      },
      { onSuccess: () => router.replace('/(tabs)/home') },
    );
  }

  function isAmbiguous(set: WorkoutSetInput) {
    return ambiguousFields.some((f) => f.toLowerCase().includes(set.exerciseName.toLowerCase()));
  }

  return (
    <Screen>
      <View style={styles.segmentRow}>
        <Pressable style={[styles.segment, mode === 'manual' && styles.segmentActive]} onPress={() => setMode('manual')}>
          <Text style={[typography.captionMedium, mode === 'manual' && styles.segmentActiveText]}>Manual</Text>
        </Pressable>
        <Pressable style={[styles.segment, mode === 'text' && styles.segmentActive]} onPress={() => setMode('text')}>
          <Text style={[typography.captionMedium, mode === 'text' && styles.segmentActiveText]}>Describe it</Text>
        </Pressable>
      </View>

      {mode === 'manual' ? (
        <Card style={styles.formCard}>
          <Text style={typography.h3}>Add a set</Text>
          {exercisesQuery.isLoading ? (
            <LoadingState label="Loading exercises…" />
          ) : (
            <View style={styles.chipWrap}>
              {(exercisesQuery.data ?? []).map((ex) => (
                <SelectableChip
                  key={ex.id}
                  label={ex.name}
                  selected={selectedExercise === ex.name}
                  onPress={() => setSelectedExercise(ex.name)}
                />
              ))}
            </View>
          )}
          <View style={styles.inlineFields}>
            <View style={{ flex: 1 }}>
              <TextField label="Weight (kg)" keyboardType="decimal-pad" value={weightInput} onChangeText={setWeightInput} />
            </View>
            <View style={{ flex: 1 }}>
              <TextField label="Reps" keyboardType="number-pad" value={repsInput} onChangeText={setRepsInput} />
            </View>
          </View>
          <Button label="Add set" onPress={addManualSet} variant="outline" disabled={!selectedExercise} />
        </Card>
      ) : (
        <Card style={styles.formCard}>
          <Text style={typography.h3}>Describe your workout</Text>
          <Text style={[typography.caption, styles.textHint]}>
            e.g. "3 sets of squats at 60kg for 10 reps, then bench press 8 reps"
          </Text>
          <TextField
            multiline
            numberOfLines={4}
            style={styles.textArea}
            placeholder="Type what you did…"
            value={freeText}
            onChangeText={setFreeText}
          />
          <Button
            label="Parse with AI"
            onPress={parseText}
            variant="accent"
            loading={parseMutation.isPending}
            disabled={!freeText.trim()}
          />

          <Pressable
            style={styles.voiceButton}
            onPress={() =>
              // Voice logging is explicitly V1 scope (architecture-plan.md §K) — it needs
              // the Whisper STT pipeline (§H) which isn't wired up yet, so this is a
              // styled placeholder rather than a functional recorder.
              Alert.alert('Voice logging arrives in V1', 'For now, type your workout above.')
            }
          >
            <Ionicons name="mic-outline" size={18} color={colors.textTertiary} />
            <Text style={styles.voiceButtonText}>Record voice</Text>
            <View style={styles.v1Badge}>
              <Text style={styles.v1BadgeText}>V1</Text>
            </View>
          </Pressable>
        </Card>
      )}

      {sets.length > 0 && (
        <>
          <Text style={[typography.h3, styles.setsTitle]}>
            {mode === 'text' ? 'Review parsed sets' : 'Sets to log'}
          </Text>
          {mode === 'text' && ambiguousFields.length > 0 && (
            <Text style={[typography.caption, styles.ambiguousHint]}>
              Some values need your confirmation — highlighted below.
            </Text>
          )}
          {sets.map((set, i) => (
            <WorkoutSetRow
              key={i}
              set={set}
              ambiguous={isAmbiguous(set)}
              onChange={(partial) => updateSet(i, partial)}
              onRemove={() => removeSet(i)}
            />
          ))}
          {saveMutation.isError && (
            <Text style={styles.errorText}>
              {saveMutation.error instanceof Error ? saveMutation.error.message : 'Failed to save workout.'}
            </Text>
          )}
          <Button
            label="Save Workout"
            onPress={saveWorkout}
            variant="accent"
            loading={saveMutation.isPending}
            style={styles.saveButton}
          />
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
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
  formCard: { marginBottom: spacing.xl },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', marginTop: spacing.md, marginBottom: spacing.sm },
  inlineFields: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm },
  textHint: { marginTop: spacing.xs, marginBottom: spacing.md },
  textArea: { minHeight: 90, textAlignVertical: 'top' },
  voiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
    paddingVertical: spacing.sm,
  },
  voiceButtonText: { color: colors.textTertiary, fontWeight: '600', fontSize: 13 },
  v1Badge: { backgroundColor: colors.surfaceAlt, borderRadius: radius.pill, paddingHorizontal: spacing.sm, paddingVertical: 1 },
  v1BadgeText: { fontSize: 10, fontWeight: '700', color: colors.textTertiary },
  setsTitle: { marginBottom: spacing.sm },
  ambiguousHint: { marginBottom: spacing.md, color: colors.warning },
  errorText: { color: colors.danger, marginBottom: spacing.sm },
  saveButton: { marginTop: spacing.md },
});
