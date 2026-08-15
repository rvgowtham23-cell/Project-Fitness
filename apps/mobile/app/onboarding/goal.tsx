import React from 'react';
import { router } from 'expo-router';
import type { FitnessGoal } from '@fitness/shared-types';
import { Button, Screen, SelectableCard } from '../../src/components/ui';
import { StepHeader } from '../../src/components/onboarding/StepHeader';
import { useOnboarding } from '../../src/state/onboarding-context';

const GOALS: { key: FitnessGoal; label: string; description: string }[] = [
  { key: 'weight_loss', label: 'Weight loss', description: 'Reduce overall body weight' },
  { key: 'fat_loss', label: 'Fat loss', description: 'Lower body fat, keep muscle' },
  { key: 'weight_maintenance', label: 'Maintain weight', description: 'Stay around where you are' },
  { key: 'muscle_gain', label: 'Muscle gain', description: 'Build size and strength' },
  { key: 'strength_improvement', label: 'Get stronger', description: 'Improve lifts, not necessarily size' },
  { key: 'body_recomposition', label: 'Recomposition', description: 'Lose fat and build muscle together' },
  { key: 'endurance', label: 'Endurance', description: 'Cardio & stamina focus' },
  { key: 'general_fitness', label: 'General fitness', description: 'Stay active and healthy' },
];

export default function GoalScreen() {
  const { draft, updateDraft } = useOnboarding();

  return (
    <Screen>
      <StepHeader step={3} totalSteps={6} title="What's your main goal?" subtitle="You can change this anytime." />

      {GOALS.map((g) => (
        <SelectableCard
          key={g.key}
          label={g.label}
          description={g.description}
          selected={draft.goal === g.key}
          onPress={() => updateDraft({ goal: g.key })}
        />
      ))}

      <Button label="Continue" onPress={() => router.push('/onboarding/activity')} variant="accent" disabled={!draft.goal} />
    </Screen>
  );
}
