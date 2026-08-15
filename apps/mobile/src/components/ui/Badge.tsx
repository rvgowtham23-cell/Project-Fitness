import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../../theme';

interface Props {
  label: string;
  tone?: 'accent' | 'neutral' | 'success' | 'warning' | 'danger';
}

export function Badge({ label, tone = 'neutral' }: Props) {
  return (
    <View style={[styles.badge, toneStyles[tone].container]}>
      <Text style={[styles.text, toneStyles[tone].text]}>{label}</Text>
    </View>
  );
}

export function confidenceTone(confidence: number): Props['tone'] {
  if (confidence >= 0.8) return 'success';
  if (confidence >= 0.5) return 'warning';
  return 'danger';
}

export function confidenceLabel(confidence: number): string {
  if (confidence >= 0.8) return `High · ${Math.round(confidence * 100)}%`;
  if (confidence >= 0.5) return `Medium · ${Math.round(confidence * 100)}%`;
  return `Low · ${Math.round(confidence * 100)}%`;
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs / 2,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
  },
  text: { fontSize: 11, fontWeight: '700' },
});

const toneStyles: Record<NonNullable<Props['tone']>, { container: object; text: object }> = {
  accent: { container: { backgroundColor: colors.accentSoft }, text: { color: colors.charcoal } },
  neutral: { container: { backgroundColor: colors.surfaceAlt }, text: { color: colors.textSecondary } },
  success: { container: { backgroundColor: '#E7F9EE' }, text: { color: '#15803D' } },
  warning: { container: { backgroundColor: '#FEF3E2' }, text: { color: '#B45309' } },
  danger: { container: { backgroundColor: '#FDECEC' }, text: { color: '#B91C1C' } },
};
