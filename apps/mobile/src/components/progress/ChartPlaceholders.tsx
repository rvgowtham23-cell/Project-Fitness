// Plain View-based chart stand-ins for the Progress screen. These are intentionally not
// real charts — swap in `victory-native` or `react-native-gifted-charts` (both already
// assume react-native-svg, not installed here) once the real analytics endpoints
// (GET /progress/{weekly,monthly,range,weight-history}) are live and a charting
// library is chosen. Layout/behavior below should carry over to whichever library wins.
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../../theme';
import { Card } from '../ui';

interface BarSeriesProps {
  title: string;
  values: number[];
  labels?: string[];
  color?: string;
  unit?: string;
}

export function BarSeriesPlaceholder({ title, values, labels, color = colors.accent, unit }: BarSeriesProps) {
  const max = Math.max(...values, 1);
  return (
    <Card style={styles.card}>
      <Text style={typography.h3}>{title}</Text>
      <View style={styles.barsRow}>
        {values.map((v, i) => (
          <View key={i} style={styles.barColumn}>
            <View style={styles.barTrack}>
              <View style={[styles.bar, { height: `${(v / max) * 100}%`, backgroundColor: v === 0 ? colors.surfaceAlt : color }]} />
            </View>
            {labels && <Text style={styles.barLabel}>{labels[i]}</Text>}
          </View>
        ))}
      </View>
      {unit && <Text style={[typography.caption, styles.unitCaption]}>Values in {unit}</Text>}
    </Card>
  );
}

export function LineTrendPlaceholder({ title, values, unit }: { title: string; values: number[]; unit?: string }) {
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  return (
    <Card style={styles.card}>
      <Text style={typography.h3}>{title}</Text>
      <View style={styles.lineRow}>
        {values.map((v, i) => {
          const heightPct = ((v - min) / range) * 70 + 15;
          return (
            <View key={i} style={styles.lineColumn}>
              <View style={[styles.dot, { bottom: `${heightPct}%` }]} />
            </View>
          );
        })}
      </View>
      <View style={styles.lineFooter}>
        <Text style={typography.caption}>{values[0]?.toFixed(1)}{unit}</Text>
        <Text style={typography.caption}>{values[values.length - 1]?.toFixed(1)}{unit}</Text>
      </View>
    </Card>
  );
}

export function MacroDistributionPlaceholder({
  proteinG,
  carbsG,
  fatG,
}: {
  proteinG: number;
  carbsG: number;
  fatG: number;
}) {
  const total = proteinG + carbsG + fatG || 1;
  const segments = [
    { label: 'Protein', value: proteinG, color: colors.macro.protein },
    { label: 'Carbs', value: carbsG, color: colors.macro.carbs },
    { label: 'Fat', value: fatG, color: colors.macro.fat },
  ];

  return (
    <Card style={styles.card}>
      <Text style={typography.h3}>Macro distribution</Text>
      <View style={styles.stackedBar}>
        {segments.map((s) => (
          <View key={s.label} style={{ width: `${(s.value / total) * 100}%`, backgroundColor: s.color }} />
        ))}
      </View>
      <View style={styles.legendRow}>
        {segments.map((s) => (
          <View key={s.label} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: s.color }]} />
            <Text style={typography.caption}>
              {s.label} {Math.round((s.value / total) * 100)}%
            </Text>
          </View>
        ))}
      </View>
    </Card>
  );
}

export function ConsistencyHeatmapPlaceholder({ days }: { days: boolean[] }) {
  return (
    <Card style={styles.card}>
      <Text style={typography.h3}>Workout consistency</Text>
      <View style={styles.heatGrid}>
        {days.map((active, i) => (
          <View key={i} style={[styles.heatCell, active ? styles.heatCellActive : styles.heatCellInactive]} />
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: spacing.lg },
  barsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 120,
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  barColumn: { flex: 1, alignItems: 'center', height: '100%', justifyContent: 'flex-end' },
  barTrack: { width: '100%', flex: 1, justifyContent: 'flex-end' },
  bar: { width: '100%', borderRadius: radius.sm, minHeight: 4 },
  barLabel: { fontSize: 10, color: colors.textTertiary, marginTop: spacing.xs },
  unitCaption: { marginTop: spacing.sm },
  lineRow: {
    flexDirection: 'row',
    height: 80,
    marginTop: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  lineColumn: { flex: 1, justifyContent: 'flex-end' },
  dot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.charcoal,
    alignSelf: 'center',
  },
  lineFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.sm },
  stackedBar: {
    flexDirection: 'row',
    height: 14,
    borderRadius: radius.pill,
    overflow: 'hidden',
    marginTop: spacing.lg,
    backgroundColor: colors.surfaceAlt,
  },
  legendRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.md },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  heatGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: spacing.lg },
  heatCell: { width: 18, height: 18, borderRadius: 4 },
  heatCellActive: { backgroundColor: colors.accent },
  heatCellInactive: { backgroundColor: colors.surfaceAlt },
});
