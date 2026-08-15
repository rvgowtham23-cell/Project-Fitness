import React from 'react';
import { Stack } from 'expo-router';
import { colors } from '../../src/theme';

// Nested Stack inside the outer modal (see root _layout.tsx's Stack.Screen name="log"
// presentation: 'modal') so Take Photo / Scan Barcode / etc. can push deeper without
// leaving the modal presentation.
export default function LogLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerShadowVisible: false,
        headerTintColor: colors.textPrimary,
        headerTitleStyle: { fontWeight: '700' },
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Log' }} />
      <Stack.Screen name="photo" options={{ title: 'Take Photo' }} />
      <Stack.Screen name="barcode" options={{ title: 'Scan Barcode' }} />
      <Stack.Screen name="manual-food" options={{ title: 'Log Food' }} />
      <Stack.Screen name="workout" options={{ title: 'Log Workout' }} />
    </Stack>
  );
}
