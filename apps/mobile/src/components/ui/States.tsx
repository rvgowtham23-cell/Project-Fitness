import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../../theme';
import { Button } from './Button';

export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <View style={styles.center}>
      <ActivityIndicator color={colors.charcoal} />
      <Text style={[typography.caption, styles.spacedText]}>{label}</Text>
    </View>
  );
}

export function ErrorState({
  message = 'Something went wrong.',
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <View style={styles.center}>
      <Text style={[typography.body, styles.spacedText]}>{message}</Text>
      {onRetry && <Button label="Try again" onPress={onRetry} variant="outline" fullWidth={false} style={styles.retryBtn} />}
    </View>
  );
}

export function EmptyState({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={styles.center}>
      <Text style={typography.h3}>{title}</Text>
      {subtitle && <Text style={[typography.caption, styles.spacedText]}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.xxl },
  spacedText: { marginTop: spacing.sm, textAlign: 'center' },
  retryBtn: { marginTop: spacing.lg },
});
