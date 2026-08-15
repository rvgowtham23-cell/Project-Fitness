import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Button, Screen, SelectableCard, SelectableChip } from '../../src/components/ui';
import { StepHeader } from '../../src/components/onboarding/StepHeader';
import { useOnboarding } from '../../src/state/onboarding-context';
import { spacing, typography } from '../../src/theme';
import type { OnboardingDraft } from '../../src/types/api';

const ACTIVITY_LEVELS: { key: NonNullable<OnboardingDraft['activityLevel']>; label: string; description: string }[] = [
  { key: 'sedentary', label: 'Sedentary', description: 'Little to no exercise, desk job' },
  { key: 'light', label: 'Lightly active', description: '1-3 workouts/week' },
  { key: 'moderate', label: 'Moderately active', description: '3-5 workouts/week' },
  { key: 'active', label: 'Active', description: '6-7 workouts/week' },
  { key: 'very_active', label: 'Very active', description: 'Physical job or 2x/day training' },
];

const EQUIPMENT_OPTIONS = ['Bodyweight only', 'Dumbbells', 'Full gym', 'Resistance bands', 'Barbell & rack'];

export default function ActivityScreen() {
  const { draft, updateDraft } = useOnboarding();

  function toggleEquipment(item: string) {
    const has = draft.equipment.includes(item);
    updateDraft({ equipment: has ? draft.equipment.filter((e) => e !== item) : [...draft.equipment, item] });
  }

  return (
    <Screen>
      <StepHeader step={4} totalSteps={6} title="Activity & equipment" />

      {ACTIVITY_LEVELS.map((level) => (
        <SelectableCard
          key={level.key}
          label={level.label}
          description={level.description}
          selected={draft.activityLevel === level.key}
          onPress={() => updateDraft({ activityLevel: level.key })}
        />
      ))}

      <Text style={[typography.h3, styles.sectionTitle]}>Equipment access</Text>
      <View style={styles.chipWrap}>
        {EQUIPMENT_OPTIONS.map((item) => (
          <SelectableChip key={item} label={item} selected={draft.equipment.includes(item)} onPress={() => toggleEquipment(item)} />
        ))}
      </View>

      <Text style={[typography.h3, styles.sectionTitle]}>Workouts per week</Text>
      <View style={styles.stepperRow}>
        {[0, 1, 2, 3, 4, 5, 6, 7].map((n) => (
          <SelectableChip
            key={n}
            label={String(n)}
            selected={draft.workoutsPerWeek === n}
            onPress={() => updateDraft({ workoutsPerWeek: n })}
          />
        ))}
      </View>

      <Button
        label="Continue"
        onPress={() => router.push('/onboarding/dietary')}
        variant="accent"
        disabled={!draft.activityLevel}
        style={styles.continueBtn}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  sectionTitle: { marginTop: spacing.lg, marginBottom: spacing.md },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap' },
  stepperRow: { flexDirection: 'row', flexWrap: 'wrap' },
  continueBtn: { marginTop: spacing.xl },
});
