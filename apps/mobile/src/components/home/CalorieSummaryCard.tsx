import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../../theme';
import { Card } from '../ui';

interface Props {
  consumed: number;
  target: number;
}

export function CalorieSummaryCard({ consumed, target }: Props) {
  const remaining = Math.max(target - consumed, 0);
  const pct = target > 0 ? Math.min(consumed / target, 1) : 0;
  const isOver = target > 0 && consumed > target;

  return (
    <Card style={styles.card}>
      <View style={styles.row}>
        <View>
          <Text style={typography.caption}>Consumed</Text>
          <Text style={typography.display}>{Math.round(consumed)}</Text>
        </View>
        <View style={styles.centerBlock}>
          <Text style={typography.h1}>{Math.round(remaining)}</Text>
          <Text style={typography.tiny}>KCAL LEFT</Text>
        </View>
        <View style={styles.alignEnd}>
          <Text style={typography.caption}>Target</Text>
          <Text style={typography.h2}>{Math.round(target)}</Text>
        </View>
      </View>
      <View style={styles.track}>
        <View
          style={[styles.fill, { width: `${pct * 100}%`, backgroundColor: isOver ? colors.warning : colors.accent }]}
        />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: spacing.lg },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg },
  centerBlock: { alignItems: 'center' },
  alignEnd: { alignItems: 'flex-end' },
  track: {
    height: 10,
    borderRadius: 999,
    backgroundColor: colors.surfaceAlt,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: 999 },
});
