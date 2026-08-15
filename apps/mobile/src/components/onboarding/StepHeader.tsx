import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../../theme';

interface Props {
  step: number;
  totalSteps: number;
  title: string;
  subtitle?: string;
}

export function StepHeader({ step, totalSteps, title, subtitle }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.dots}>
        {Array.from({ length: totalSteps }).map((_, i) => (
          <View key={i} style={[styles.dot, i < step ? styles.dotActive : styles.dotInactive]} />
        ))}
      </View>
      <Text style={typography.tiny}>
        STEP {step} OF {totalSteps}
      </Text>
      <Text style={[typography.h1, styles.title]}>{title}</Text>
      {subtitle && <Text style={[typography.body, styles.subtitle]}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.xl },
  dots: { flexDirection: 'row', gap: spacing.xs, marginBottom: spacing.lg },
  dot: { flex: 1, height: 4, borderRadius: 2 },
  dotActive: { backgroundColor: colors.accent },
  dotInactive: { backgroundColor: colors.surfaceAlt },
  title: { marginTop: spacing.sm },
  subtitle: { marginTop: spacing.xs, color: colors.textSecondary },
});
