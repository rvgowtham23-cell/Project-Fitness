import React from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Button, Screen, SelectableChip, TextField } from '../../src/components/ui';
import { StepHeader } from '../../src/components/onboarding/StepHeader';
import { useOnboarding } from '../../src/state/onboarding-context';
import { spacing } from '../../src/theme';
import type { OnboardingDraft } from '../../src/types/api';

const GENDERS: { key: NonNullable<OnboardingDraft['gender']>; label: string }[] = [
  { key: 'female', label: 'Female' },
  { key: 'male', label: 'Male' },
  { key: 'other', label: 'Other' },
  { key: 'prefer_not_to_say', label: 'Prefer not to say' },
];

export default function BasicInfoScreen() {
  const { draft, updateDraft } = useOnboarding();

  const canContinue =
    draft.name.trim().length > 0 &&
    /^\d{4}-\d{2}-\d{2}$/.test(draft.dateOfBirth) &&
    !!draft.gender &&
    parseFloat(draft.heightCm) > 0 &&
    parseFloat(draft.weightKg) > 0;

  return (
    <Screen>
      <StepHeader step={2} totalSteps={6} title="Tell us about you" subtitle="This tunes your calorie & macro targets." />

      <TextField label="Name" placeholder="Your name" value={draft.name} onChangeText={(v) => updateDraft({ name: v })} />
      <TextField
        label="Date of birth"
        placeholder="YYYY-MM-DD"
        // TODO: swap for a native date picker (@react-native-community/datetimepicker)
        // before shipping — a raw text field is a scaffold-only shortcut.
        value={draft.dateOfBirth}
        onChangeText={(v) => updateDraft({ dateOfBirth: v })}
        keyboardType="numbers-and-punctuation"
      />

      <View style={styles.chipWrap}>
        {GENDERS.map((g) => (
          <SelectableChip
            key={g.key}
            label={g.label}
            selected={draft.gender === g.key}
            onPress={() => updateDraft({ gender: g.key })}
          />
        ))}
      </View>

      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <TextField
            label="Height (cm)"
            placeholder="175"
            keyboardType="decimal-pad"
            value={draft.heightCm}
            onChangeText={(v) => updateDraft({ heightCm: v })}
          />
        </View>
        <View style={{ flex: 1 }}>
          <TextField
            label="Weight (kg)"
            placeholder="70"
            keyboardType="decimal-pad"
            value={draft.weightKg}
            onChangeText={(v) => updateDraft({ weightKg: v })}
          />
        </View>
      </View>

      <Button label="Continue" onPress={() => router.push('/onboarding/goal')} variant="accent" disabled={!canContinue} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: spacing.lg },
  row: { flexDirection: 'row', gap: spacing.md },
});
