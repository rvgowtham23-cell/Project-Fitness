import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../../theme';

interface Props {
  label: string;
  value: number;
  target: number;
  unit?: string;
  color?: string;
}

// Deliberately a plain View-based bar, not a ring/chart library — matches the "simple
// custom progress-bar component" guidance for the MVP scaffold (see PR description).
export function ProgressBar({ label, value, target, unit = 'g', color = colors.accent }: Props) {
  const pct = target > 0 ? Math.min(value / target, 1) : 0;
  const isOver = target > 0 && value > target;

  return (
    <View style={styles.row}>
      <View style={styles.labelRow}>
        <Text style={typography.captionMedium}>{label}</Text>
        <Text style={typography.caption}>
          {Math.round(value)}
          <Text style={{ color: colors.textTertiary }}> / {Math.round(target)}{unit}</Text>
        </Text>
      </View>
      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            { width: `${pct * 100}%`, backgroundColor: isOver ? colors.warning : color },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { marginBottom: spacing.md },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  track: {
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radius.pill,
  },
});
