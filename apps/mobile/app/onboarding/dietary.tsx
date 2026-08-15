import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Button, Screen, SelectableCard, SelectableChip, TextField } from '../../src/components/ui';
import { StepHeader } from '../../src/components/onboarding/StepHeader';
import { useOnboarding } from '../../src/state/onboarding-context';
import { spacing, typography } from '../../src/theme';
import type { OnboardingDraft } from '../../src/types/api';

const DIET_OPTIONS: { key: NonNullable<OnboardingDraft['dietaryPreference']>; label: string }[] = [
  { key: 'vegetarian', label: 'Vegetarian' },
  { key: 'non_vegetarian', label: 'Non-vegetarian' },
  { key: 'eggetarian', label: 'Eggetarian' },
  { key: 'vegan', label: 'Vegan' },
];

const COMMON_ALLERGIES = ['Peanuts', 'Tree nuts', 'Dairy', 'Gluten', 'Shellfish', 'Soy'];

export default function DietaryScreen() {
  const { draft, updateDraft } = useOnboarding();
  const [customAllergy, setCustomAllergy] = useState('');

  function toggleAllergy(item: string) {
    const has = draft.allergies.includes(item);
    updateDraft({ allergies: has ? draft.allergies.filter((a) => a !== item) : [...draft.allergies, item] });
  }

  function addCustomAllergy() {
    const trimmed = customAllergy.trim();
    if (trimmed && !draft.allergies.includes(trimmed)) {
      updateDraft({ allergies: [...draft.allergies, trimmed] });
    }
    setCustomAllergy('');
  }

  function goNext() {
    router.push('/onboarding/targets');
  }

  return (
    <Screen>
      <StepHeader
        step={5}
        totalSteps={6}
        title="Dietary preferences"
        subtitle="Optional — skip if you'd rather not say."
      />

      {DIET_OPTIONS.map((opt) => (
        <SelectableCard
          key={opt.key}
          label={opt.label}
          selected={draft.dietaryPreference === opt.key}
          onPress={() => updateDraft({ dietaryPreference: opt.key })}
        />
      ))}

      <Text style={[typography.h3, styles.sectionTitle]}>Allergies</Text>
      <View style={styles.chipWrap}>
        {COMMON_ALLERGIES.map((item) => (
          <SelectableChip key={item} label={item} selected={draft.allergies.includes(item)} onPress={() => toggleAllergy(item)} />
        ))}
      </View>
      <TextField
        placeholder="Add another allergy…"
        value={customAllergy}
        onChangeText={setCustomAllergy}
        onSubmitEditing={addCustomAllergy}
        returnKeyType="done"
      />

      <Button label="Continue" onPress={goNext} variant="accent" />
      <Button label="Skip for now" onPress={goNext} variant="ghost" style={styles.skipBtn} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  sectionTitle: { marginTop: spacing.md, marginBottom: spacing.md },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: spacing.md },
  skipBtn: { marginTop: spacing.sm },
});
