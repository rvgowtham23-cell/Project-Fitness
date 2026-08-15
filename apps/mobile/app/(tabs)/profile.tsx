import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '../../src/theme';
import { Button, Card, Screen } from '../../src/components/ui';

function SettingsRow({
  icon,
  label,
  value,
  onPress,
  danger,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
  danger?: boolean;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}>
      <Ionicons name={icon} size={19} color={danger ? colors.danger : colors.textSecondary} />
      <Text style={[typography.body, styles.rowLabel, danger && { color: colors.danger }]}>{label}</Text>
      {value && <Text style={typography.caption}>{value}</Text>}
      {onPress && !value && <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />}
    </Pressable>
  );
}

export default function ProfileScreen() {
  const [mealReminders, setMealReminders] = useState(true);
  const [workoutReminders, setWorkoutReminders] = useState(true);
  const [weeklySummary, setWeeklySummary] = useState(true);

  function confirmDelete() {
    Alert.alert(
      'Delete account',
      'This permanently deletes your account and all logged data. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => Alert.alert('Deletion requested (stub)') },
      ],
    );
  }

  return (
    <Screen>
      <Text style={typography.h1}>Profile</Text>

      <Card style={styles.section}>
        <Text style={typography.h3}>Goals</Text>
        <Text style={[typography.caption, styles.sectionSub]}>Muscle gain · Moderate activity · 4x/week</Text>
        <Button label="Edit goals" variant="outline" onPress={() => Alert.alert('Edit goals (stub)')} />
      </Card>

      <Card style={styles.section}>
        <Text style={typography.h3}>Body measurements</Text>
        <View style={styles.measurementRow}>
          <View>
            <Text style={typography.caption}>Weight</Text>
            <Text style={typography.h2}>77.1 kg</Text>
          </View>
          <View style={styles.alignEnd}>
            <Text style={typography.caption}>Height</Text>
            <Text style={typography.h2}>175 cm</Text>
          </View>
        </View>
        <Button
          label="Log new measurement"
          variant="outline"
          onPress={() => Alert.alert('Log measurement (stub)')}
        />
      </Card>

      <Card style={styles.section}>
        <Text style={[typography.h3, styles.sectionSub]}>Notifications</Text>
        <View style={styles.toggleRow}>
          <Text style={typography.body}>Meal reminders</Text>
          <Switch value={mealReminders} onValueChange={setMealReminders} trackColor={{ true: colors.accent }} />
        </View>
        <View style={styles.toggleRow}>
          <Text style={typography.body}>Workout reminders</Text>
          <Switch value={workoutReminders} onValueChange={setWorkoutReminders} trackColor={{ true: colors.accent }} />
        </View>
        <View style={styles.toggleRow}>
          <Text style={typography.body}>Weekly summary</Text>
          <Switch value={weeklySummary} onValueChange={setWeeklySummary} trackColor={{ true: colors.accent }} />
        </View>
      </Card>

      <Card style={styles.section}>
        <Text style={typography.h3}>Subscription</Text>
        <View style={styles.planRow}>
          <Text style={typography.bodyMedium}>Free plan</Text>
          <Text style={typography.caption}>2 photo logs/day · limited coach messages</Text>
        </View>
        <Button label="Upgrade" variant="accent" onPress={() => Alert.alert('Upgrade (stub) — V2 scope')} />
      </Card>

      <Card style={styles.section}>
        <SettingsRow icon="person-outline" label="Account details" onPress={() => Alert.alert('Account (stub)')} />
        <SettingsRow icon="lock-closed-outline" label="Privacy & security" onPress={() => Alert.alert('Privacy (stub)')} />
        <SettingsRow icon="help-circle-outline" label="Help & support" onPress={() => Alert.alert('Help (stub)')} />
        <SettingsRow
          icon="download-outline"
          label="Export my data"
          onPress={() => Alert.alert('Export requested (stub)')}
        />
        <SettingsRow icon="trash-outline" label="Delete account" onPress={confirmDelete} danger />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: spacing.lg, gap: spacing.md },
  sectionSub: { marginBottom: spacing.xs },
  measurementRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  alignEnd: { alignItems: 'flex-end' },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  planRow: { marginBottom: spacing.xs },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md },
  rowPressed: { opacity: 0.6 },
  rowLabel: { flex: 1 },
});
