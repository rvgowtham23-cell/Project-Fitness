import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../src/lib/query-client';
import { OnboardingProvider } from '../src/state/onboarding-context';
import { MealDraftProvider } from '../src/state/meal-draft-context';
import { colors } from '../src/theme';

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <OnboardingProvider>
        <MealDraftProvider>
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="onboarding" />
            <Stack.Screen name="(tabs)" />
            {/* Log is a modal, not a tab destination — see (tabs)/_layout.tsx for why the
                Log tab intercepts tabPress instead of navigating here directly. */}
            <Stack.Screen name="log" options={{ presentation: 'modal' }} />
            <Stack.Screen name="meal" options={{ presentation: 'modal' }} />
          </Stack>
        </MealDraftProvider>
      </OnboardingProvider>
    </QueryClientProvider>
  );
}
