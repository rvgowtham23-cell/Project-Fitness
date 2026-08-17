import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import type { NutritionTargets } from '@fitness/shared-types';
import { Button, Card, ErrorState, LoadingState, Screen } from '../../src/components/ui';
import { colors, spacing, typography } from '../../src/theme';
import { useOnboarding } from '../../src/state/onboarding-context';
import { apiClient } from '../../src/lib/api-client';
import { toOnboardingPayload } from '../../src/lib/onboarding-mapper';

// The "reward" screen per architecture-plan.md §I: progressive onboarding ends with an
// immediate, concrete payoff (your numbers) rather than just dumping the user into an
// empty dashboard.
export default function TargetsScreen() {
  const { draft } = useOnboarding();
  const [targets, setTargets] = useState<NutritionTargets | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    setError(null);
    Promise.resolve()
      .then(() => apiClient.submitOnboarding(toOnboardingPayload(draft)))
      // onboarding's own response isn't a flat NutritionTargets shape (it's {profile, goal}) —
      // fetch the properly-shaped numbers from the endpoint built for that.
      .then(() => apiClient.getNutritionTargets())
      .then(setTargets)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to save your profile.'));
  }, [draft, attempt]);

  if (error) {
    return (
      <Screen>
        <ErrorState message={error} onRetry={() => setAttempt((n) => n + 1)} />
      </Screen>
    );
  }

  if (!targets) {
    return (
      <Screen>
        <LoadingState label="Calculating your targets…" />
      </Screen>
    );
  }

  function finish() {
    router.replace('/(tabs)/home');
  }

  return (
    <Screen>
      <View style={styles.iconWrap}>
        <Ionicons name="checkmark-circle" size={56} color={colors.accent} />
      </View>
      <Text style={[typography.h1, styles.centerText]}>You're all set{draft.name ? `, ${draft.name}` : ''}!</Text>
      <Text style={[typography.body, styles.centerText, styles.subtitle]}>
        Here's your personalized daily target, based on what you told us.
      </Text>

      <Card style={styles.calorieCard}>
        <Text style={typography.caption}>Daily calorie target</Text>
        <Text style={styles.calorieValue}>{targets.calorieTarget}</Text>
        <Text style={typography.caption}>kcal / day</Text>
      </Card>

      <View style={styles.macroGrid}>
        <MacroTile label="Protein" value={targets.proteinTargetG} unit="g" color={colors.macro.protein} />
        <MacroTile label="Carbs" value={targets.carbTargetG} unit="g" color={colors.macro.carbs} />
        <MacroTile label="Fat" value={targets.fatTargetG} unit="g" color={colors.macro.fat} />
        <MacroTile label="Fiber" value={targets.fiberTargetG} unit="g" color={colors.macro.fiber} />
      </View>

      <Text style={[typography.caption, styles.disclaimer]}>
        These update automatically as you log — adjust anytime from Profile → Goals.
      </Text>

      <Button label="Let's go" onPress={finish} variant="accent" style={styles.finishBtn} />
    </Screen>
  );
}

function MacroTile({ label, value, unit, color }: { label: string; value: number; unit: string; color: string }) {
  return (
    <Card style={styles.macroTile}>
      <View style={[styles.macroDot, { backgroundColor: color }]} />
      <Text style={typography.h2}>{value}</Text>
      <Text style={typography.caption}>
        {unit} {label}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  iconWrap: { alignItems: 'center', marginBottom: spacing.md },
  centerText: { textAlign: 'center' },
  subtitle: { marginTop: spacing.sm, marginBottom: spacing.xl, color: colors.textSecondary },
  calorieCard: { alignItems: 'center', marginBottom: spacing.lg },
  calorieValue: { fontSize: 48, fontWeight: '800', color: colors.textPrimary },
  macroGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginBottom: spacing.lg },
  macroTile: { flexBasis: '47%', alignItems: 'center' },
  macroDot: { width: 10, height: 10, borderRadius: 5, marginBottom: spacing.xs },
  disclaimer: { textAlign: 'center', marginBottom: spacing.xl },
  finishBtn: { marginTop: spacing.sm },
});
