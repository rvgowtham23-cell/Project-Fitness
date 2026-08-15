import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { spacing, typography } from '../../src/theme';
import { LogOptionRow } from '../../src/components/log/LogOptionRow';
import { Screen } from '../../src/components/ui';

// The action-sheet-as-screen: 4 entry points into the two core loops (Eat, Workout).
// Presented modally (see app/_layout.tsx) so it always feels like a transient action,
// not a place you "are" — closing it (swipe down / back) just returns to wherever you
// were, same as a native action sheet would.
export default function LogActionSheet() {
  return (
    <Screen scroll={false} style={styles.screen}>
      <Text style={typography.h1}>Log something</Text>
      <Text style={[typography.caption, styles.subtitle]}>Snap it, scan it, or tell us about it.</Text>

      <View style={styles.list}>
        <LogOptionRow
          icon="camera"
          title="Take Photo"
          subtitle="AI estimates what's on your plate"
          onPress={() => router.push('/log/photo')}
        />
        <LogOptionRow
          icon="barcode-outline"
          title="Scan Barcode"
          subtitle="Packaged & branded foods"
          onPress={() => router.push('/log/barcode')}
        />
        <LogOptionRow
          icon="search"
          title="Search / Manual Food"
          subtitle="Look up or enter foods yourself"
          onPress={() => router.push('/log/manual-food')}
        />
        <LogOptionRow
          icon="barbell"
          title="Log Workout"
          subtitle="Manual, text, or voice"
          onPress={() => router.push('/log/workout')}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { justifyContent: 'flex-start' },
  subtitle: { marginTop: spacing.xs, marginBottom: spacing.xl },
  list: { gap: spacing.xs },
});
